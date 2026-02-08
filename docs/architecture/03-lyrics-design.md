# 歌词功能设计文档

**版本**: v0.2.0  
**创建日期**: 2026年2月8日  
**设计人**: 技术架构师  
**依据文档**: `docs/production/04-lyrics-requirements.md`

---

## 一、架构设计

### 1.1 数据流

```
用户输入
    │
    ▼
Tokenizer (识别 @ 行)
    │
    ▼
Parser (解析歌词与音符对应)
    │
    ▼
Score AST (包含 Lyrics)
    │
    ▼
Renderer (计算歌词位置)
    │
    ▼
ScoreLayout (包含 LyricsPosition[])
    │
    ▼
UI (SVG渲染歌词)
```

### 1.2 模块职责

| 模块 | 输入 | 输出 | 职责 |
|------|------|------|------|
| Tokenizer | 源文本 | Token[] | 识别 `@` 为 LYRICS token |
| Parser | Token[] | Score (含 Lyrics) | 解析歌词并关联到 Measure |
| Renderer | Score | ScoreLayout (含歌词坐标) | 计算每个字的 SVG 位置 |
| UI | ScoreLayout | SVG | 渲染歌词 `<text>` 元素 |

---

## 二、类型设计

### 2.1 核心类型

```typescript
// packages/core/src/types/index.ts

/** 歌词片段（对应一个音符） */
export interface LyricsSyllable {
  /** 歌词文字（可能是单字、多字分组、或占位符） */
  text: string;
  /** 是否为占位符（对应无词音符） */
  isPlaceholder: boolean;
  /** 是否为分组（多字一音） */
  isGroup: boolean;
}

/** 小节的歌词 */
export interface MeasureLyrics {
  /** 歌词片段数组，与该小节的音符一一对应 */
  syllables: LyricsSyllable[];
}

/** Measure 扩展 */
export interface Measure {
  number: number;
  notes: NoteElement[];
  lyrics?: MeasureLyrics; // 新增：可选的歌词
}

/** 歌词渲染位置 */
export interface LyricsPosition {
  /** 歌词文字 */
  text: string;
  /** SVG x 坐标 */
  x: number;
  /** SVG y 坐标 */
  y: number;
  /** 是否为占位符 */
  isPlaceholder: boolean;
  /** 是否为分组 */
  isGroup: boolean;
  /** 对应的音符索引 */
  noteIndex: number;
}

/** MeasureLayout 扩展 */
export interface MeasureLayout {
  measure: Measure;
  x: number;
  y: number;
  width: number;
  notes: NotePosition[];
  lyrics?: LyricsPosition[]; // 新增：歌词位置
}
```

---

## 三、Tokenizer 扩展

### 3.1 新增 Token 类型

```typescript
// packages/core/src/parser/tokenizer.ts

export type TokenType =
  | ... // 现有类型
  | 'LYRICS_MARKER'  // @
  | 'LYRICS_TEXT';   // 歌词内容

// 识别逻辑
if (ch === '@' && column === 1) {
  tokens.push({ type: 'LYRICS_MARKER', value: '@', line, column, offset });
  // 读取行尾所有内容作为 LYRICS_TEXT
  const restOfLine = bodyLine.slice(i + 1).trim();
  tokens.push({ type: 'LYRICS_TEXT', value: restOfLine, line, column: column + 1, offset: offset + 1 });
  break; // 跳过该行剩余部分
}
```

---

## 四、Parser 扩展

### 4.1 歌词解析函数

```typescript
// packages/core/src/parser/parser.ts

/**
 * 解析歌词文本为 LyricsSyllable 数组
 * 
 * @param lyricsText - 原始歌词文本（如 "一 闪 (我的) _ 星"）
 * @returns 歌词片段数组
 */
function parseLyrics(lyricsText: string): LyricsSyllable[] {
  const syllables: LyricsSyllable[] = [];
  let i = 0;
  
  while (i < lyricsText.length) {
    const ch = lyricsText[i];
    
    // 跳过空格
    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }
    
    // 占位符 _
    if (ch === '_') {
      syllables.push({ text: '', isPlaceholder: true, isGroup: false });
      i++;
      continue;
    }
    
    // 分组 (多字一音)
    if (ch === '(') {
      const closeIndex = lyricsText.indexOf(')', i);
      if (closeIndex === -1) {
        // 未闭合，当作普通文本
        syllables.push({ text: ch, isPlaceholder: false, isGroup: false });
        i++;
      } else {
        const groupText = lyricsText.slice(i + 1, closeIndex);
        syllables.push({ text: groupText, isPlaceholder: false, isGroup: true });
        i = closeIndex + 1;
      }
      continue;
    }
    
    // 延长占位 -
    if (ch === '-') {
      syllables.push({ text: '-', isPlaceholder: true, isGroup: false });
      i++;
      continue;
    }
    
    // 普通单字
    syllables.push({ text: ch, isPlaceholder: false, isGroup: false });
    i++;
  }
  
  return syllables;
}
```

### 4.2 歌词与音符关联

```typescript
/**
 * 将歌词关联到对应的小节
 */
function associateLyricsToMeasures(
  measures: Measure[],
  lyricsTokens: Token[] // 所有 LYRICS_TEXT token
): ParseError[] {
  const errors: ParseError[] = [];
  
  // 假设歌词行与音符行按出现顺序一一对应
  let lyricsIndex = 0;
  
  for (const measure of measures) {
    if (lyricsIndex >= lyricsTokens.length) {
      break; // 没有更多歌词
    }
    
    const lyricsToken = lyricsTokens[lyricsIndex];
    const syllables = parseLyrics(lyricsToken.value);
    
    // 计算该小节有效音符数量（排除装饰音、延长线）
    const effectiveNotes = measure.notes.filter(note => {
      if (note.type === 'breath') return false;
      if (note.type === 'note' && note.isGrace) return false;
      if (note.type === 'tie') return false; // 延长线不独占歌词
      return true;
    });
    
    // 验证数量匹配
    if (syllables.length !== effectiveNotes.length) {
      errors.push({
        message: `小节 ${measure.number} 歌词数量(${syllables.length})与有效音符数量(${effectiveNotes.length})不匹配`,
        position: lyricsToken,
        length: lyricsToken.value.length,
      });
    }
    
    // 关联歌词到小节
    measure.lyrics = { syllables };
    lyricsIndex++;
  }
  
  return errors;
}
```

### 4.3 parseBody 集成

```typescript
function parseBody(tokens: Token[]): { measures: Measure[]; errors: ParseError[] } {
  // ... 现有逻辑：解析音符到 measures ...
  
  // 提取所有歌词 token
  const lyricsTokens = tokens.filter(t => t.type === 'LYRICS_TEXT');
  
  // 关联歌词到小节
  const lyricsErrors = associateLyricsToMeasures(measures, lyricsTokens);
  
  return { measures, errors: [...parseErrors, ...lyricsErrors] };
}
```

---

## 五、Renderer 扩展

### 5.1 歌词位置计算

```typescript
// packages/core/src/renderer/layout.ts

/**
 * 计算小节歌词的渲染位置
 */
function calculateLyricsPositions(
  measure: Measure,
  measureLayout: MeasureLayout,
  config: LayoutConfig
): LyricsPosition[] {
  if (!measure.lyrics) return [];
  
  const positions: LyricsPosition[] = [];
  const { syllables } = measure.lyrics;
  
  // 歌词 Y 坐标：音符底部 + 偏移
  const lyricsY = measureLayout.y + config.noteSize + config.lyricsOffset;
  
  // 遍历有效音符（排除装饰音、延长线）
  let syllableIndex = 0;
  for (let i = 0; i < measureLayout.notes.length; i++) {
    const notePos = measureLayout.notes[i];
    const note = notePos.note;
    
    // 跳过无歌词的音符
    if (note.type === 'breath') continue;
    if (note.type === 'note' && note.isGrace) continue;
    if (note.type === 'tie') continue;
    
    // 获取对应歌词
    if (syllableIndex >= syllables.length) break;
    const syllable = syllables[syllableIndex];
    
    // 占位符不渲染
    if (syllable.isPlaceholder && syllable.text === '') {
      syllableIndex++;
      continue;
    }
    
    positions.push({
      text: syllable.text,
      x: notePos.x,
      y: lyricsY,
      isPlaceholder: syllable.isPlaceholder,
      isGroup: syllable.isGroup,
      noteIndex: notePos.index,
    });
    
    syllableIndex++;
  }
  
  return positions;
}
```

### 5.2 LayoutConfig 扩展

```typescript
export interface LayoutConfig {
  // ... 现有字段 ...
  
  /** 歌词到音符的垂直偏移 */
  lyricsOffset: number; // 默认 10
  
  /** 歌词字体大小（相对音符大小的比例） */
  lyricsFontSizeRatio: number; // 默认 0.85
}
```

---

## 六、UI 渲染

### 6.1 MeasureView 扩展

```typescript
// apps/web/src/components/ScoreView/MeasureView.tsx

<g>
  {/* 现有：音符渲染 */}
  {layout.notes.map(...)}
  
  {/* 新增：歌词渲染 */}
  {layout.lyrics?.map((lyric, i) => (
    <text
      key={`lyric-${i}`}
      x={lyric.x}
      y={lyric.y}
      textAnchor="middle"
      fontSize={config.noteSize * 0.85}
      fill={lyric.isPlaceholder ? '#9CA3AF' : '#1C1917'}
      className={lyric.isGroup ? 'text-xs' : ''}
    >
      {lyric.text}
    </text>
  ))}
</g>
```

---

## 七、测试设计

### 7.1 单元测试（Parser）

```typescript
// packages/core/src/__tests__/lyrics.test.ts

describe('Lyrics Parser', () => {
  it('should parse basic lyrics', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

1 2 3 4 |
@ 一 二 三 四`;
    
    const result = parse(source);
    expect(result.score?.measures[0].lyrics?.syllables).toHaveLength(4);
    expect(result.score?.measures[0].lyrics?.syllables[0].text).toBe('一');
  });
  
  it('should handle grouped lyrics', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

1 2 3 |
@ (我的) 祖 国`;
    
    const result = parse(source);
    const syllables = result.score?.measures[0].lyrics?.syllables;
    expect(syllables?.[0].text).toBe('我的');
    expect(syllables?.[0].isGroup).toBe(true);
  });
  
  it('should handle placeholders', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

0 1 2 3 |
@ _ 一 二 三`;
    
    const result = parse(source);
    const syllables = result.score?.measures[0].lyrics?.syllables;
    expect(syllables?.[0].isPlaceholder).toBe(true);
  });
  
  it('should detect mismatch', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

1 2 3 4 |
@ 一 二`;
    
    const result = parse(source);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('不匹配');
  });
});
```

### 7.2 渲染测试

```typescript
describe('Lyrics Renderer', () => {
  it('should calculate lyrics positions', () => {
    const score = parse(`...`).score!;
    const layout = createLayout(score);
    
    expect(layout.lines[0].measures[0].lyrics).toBeDefined();
    expect(layout.lines[0].measures[0].lyrics?.length).toBeGreaterThan(0);
  });
});
```

---

## 八、边界情况处理

| 场景 | 处理方式 |
|------|---------|
| 歌词行在音符行之前 | 缓存歌词，等音符行解析完后关联 |
| 多个歌词行对应一个音符行 | 只取第一个，其余忽略并警告 |
| 歌词中包含空格 | 保留原样（如 `(hello world)` 是一个分组） |
| 歌词中包含特殊字符 | 原样渲染 |
| 歌词为纯 `-` | 视为延长占位符 |
| 小节无歌词 | `lyrics` 字段为 `undefined`，正常渲染音符 |

---

## 九、性能优化

1. **解析阶段**：歌词解析复杂度 O(n)，n 为歌词字符数
2. **渲染阶段**：每个歌词片段生成一个 `<text>` 元素
3. **内存占用**：每个 Syllable 约 50 bytes，100 个歌词 ≈ 5KB

**优化措施**：
- 歌词文本复用（同样的字只存储一次引用）
- SVG `<text>` 元素复用 React key

---

## 十、实施清单

### Phase 1: 核心实现（2 天）
- [ ] 扩展 Types（Lyrics 相关类型）
- [ ] 扩展 Tokenizer（识别 `@` 和 LYRICS_TEXT）
- [ ] 扩展 Parser（parseLyrics + associateLyricsToMeasures）
- [ ] 扩展 Renderer（calculateLyricsPositions）
- [ ] 扩展 UI（MeasureView 渲染歌词）
- [ ] 编写单元测试（≥8 个测试用例）

### Phase 2: 示例与文档（0.5 天）
- [ ] 更新小星星示例（加歌词）
- [ ] 更新生日快乐示例（加歌词）
- [ ] 更新帮助文档（新增歌词语法说明）
- [ ] 更新用户指南

### Phase 3: 验收（0.5 天）
- [ ] 运行所有测试
- [ ] 手动测试复杂场景
- [ ] 检查渲染效果
- [ ] 性能验证

**总计**: 3 天

---

**设计人**: 技术架构师  
**审阅人**: 产品经理  
**下一步**: 开始实施
