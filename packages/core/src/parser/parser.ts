// ============================================================
// Parser — 将 Token 流解析为 Score AST
// ============================================================

import { tokenize, type Token } from './tokenizer.js';
import type {
  Score,
  Metadata,
  Measure,
  NoteElement,
  Note,
  Rest,
  Tie,
  Duration,
  KeyName,
  TimeSignature,
  ParseError,
  ParseResult,
} from '../types/index.js';

/** 默认元信息 */
const DEFAULT_METADATA: Metadata = {
  key: 'C',
  timeSignature: { beats: 4, beatValue: 4 },
  tempo: 120,
};

/**
 * 解析元信息 Token 对
 */
function parseMetadata(tokens: Token[]): Metadata {
  const metadata: Metadata = { ...DEFAULT_METADATA };

  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i].type === 'METADATA_KEY' && tokens[i + 1].type === 'METADATA_VALUE') {
      const key = tokens[i].value;
      const value = tokens[i + 1].value;

      switch (key) {
        case '标题':
        case 'title':
          metadata.title = value;
          break;
        case '调号':
        case 'key':
          metadata.key = value as KeyName;
          break;
        case '拍号':
        case 'time': {
          const match = value.match(/^(\d+)\/(\d+)$/);
          if (match) {
            metadata.timeSignature = {
              beats: parseInt(match[1], 10),
              beatValue: parseInt(match[2], 10),
            };
          }
          break;
        }
        case '速度':
        case 'tempo':
          metadata.tempo = parseInt(value, 10) || 120;
          break;
      }
      i++; // 跳过 value token
    }
  }

  return metadata;
}

/**
 * 将 Token 流解析为音符序列，按小节分组
 */
function parseBody(tokens: Token[]): { measures: Measure[]; errors: ParseError[] } {
  const measures: Measure[] = [];
  const errors: ParseError[] = [];
  let currentNotes: NoteElement[] = [];
  let measureNumber = 1;

  // 过滤掉元信息和换行 Token
  const bodyTokens = tokens.filter(
    t => !['METADATA_KEY', 'METADATA_VALUE', 'NEWLINE', 'EOF'].includes(t.type)
  );

  let i = 0;
  while (i < bodyTokens.length) {
    const token = bodyTokens[i];

    switch (token.type) {
      case 'BARLINE': {
        // 遇到小节线，保存当前小节
        if (currentNotes.length > 0) {
          measures.push({ number: measureNumber, notes: currentNotes });
          measureNumber++;
          currentNotes = [];
        }
        i++;
        break;
      }

      case 'NOTE': {
        const note = parseNote(bodyTokens, i);
        currentNotes.push(note.note);
        i = note.nextIndex;
        break;
      }

      case 'REST': {
        const rest: Rest = {
          type: 'rest',
          duration: { base: 4, dots: 0 },
        };
        currentNotes.push(rest);
        i++;
        // 检查后续减时线
        const underlineResult = consumeUnderlines(bodyTokens, i);
        rest.duration.base = underlineResult.base;
        i = underlineResult.nextIndex;
        break;
      }

      case 'TIE': {
        const tie: Tie = {
          type: 'tie',
          duration: { base: 4, dots: 0 },
        };
        currentNotes.push(tie);
        i++;
        break;
      }

      case 'ERROR': {
        errors.push({
          message: `未识别的字符: "${token.value}"`,
          position: { line: token.line, column: token.column, offset: token.offset },
          length: 1,
        });
        i++;
        break;
      }

      default:
        i++;
        break;
    }
  }

  // 最后一个小节
  if (currentNotes.length > 0) {
    measures.push({ number: measureNumber, notes: currentNotes });
  }

  return { measures, errors };
}

/**
 * 解析一个音符及其修饰符（八度、升降、减时线、附点）
 */
function parseNote(tokens: Token[], startIndex: number): { note: Note; nextIndex: number } {
  let i = startIndex;
  let octave = 0;
  let accidental: Note['accidental'] = undefined;
  let dot = false;

  // 检查前置修饰符（必须在调用前检查）
  // 向前回溯检查低八度点、升降号
  let checkIdx = i - 1;
  while (checkIdx >= 0) {
    const prevToken = tokens[checkIdx];
    if (prevToken.type === 'OCTAVE_DOWN') {
      octave--;
      checkIdx--;
    } else if (prevToken.type === 'SHARP') {
      accidental = 'sharp';
      break;
    } else if (prevToken.type === 'FLAT') {
      accidental = 'flat';
      break;
    } else if (prevToken.type === 'BARLINE' || prevToken.type === 'NOTE' || prevToken.type === 'REST') {
      break;
    } else {
      checkIdx--;
    }
  }

  // 当前 token 是 NOTE
  const pitch = parseInt(tokens[i].value, 10);
  i++;

  // 后置修饰符：高八度、附点
  while (i < tokens.length) {
    if (tokens[i].type === 'OCTAVE_UP') {
      octave += 1;
      i++;
    } else if (tokens[i].type === 'DOT') {
      dot = true;
      i++;
    } else {
      break;
    }
  }

  // 减时线
  const underlineResult = consumeUnderlines(tokens, i);

  const duration: Duration = {
    base: underlineResult.base,
    dots: dot ? 1 : 0,
  };

  return {
    note: {
      type: 'note',
      pitch,
      octave,
      accidental,
      duration,
      dot,
    },
    nextIndex: underlineResult.nextIndex,
  };
}

/**
 * 消费连续的减时线，返回对应的基础时值
 * 无下划线=四分音符(4)，一个=八分(8)，两个=十六分(16)
 */
function consumeUnderlines(tokens: Token[], startIndex: number): { base: 1 | 2 | 4 | 8 | 16; nextIndex: number } {
  let i = startIndex;
  let underlineCount = 0;

  while (i < tokens.length && tokens[i].type === 'UNDERLINE') {
    underlineCount++;
    i++;
  }

  let base: 1 | 2 | 4 | 8 | 16 = 4; // 默认四分音符
  if (underlineCount === 1) base = 8;
  if (underlineCount >= 2) base = 16;

  return { base, nextIndex: i };
}

/**
 * 解析简谱文本，返回 Score AST
 */
export function parse(source: string): ParseResult {
  try {
    const tokens = tokenize(source);
    const metadata = parseMetadata(tokens);
    const { measures, errors } = parseBody(tokens);

    if (measures.length === 0) {
      return {
        score: null,
        errors: [
          {
            message: '未找到任何音符',
            position: { line: 1, column: 1, offset: 0 },
            length: 0,
          },
        ],
      };
    }

    return {
      score: { metadata, measures },
      errors,
    };
  } catch (err) {
    return {
      score: null,
      errors: [
        {
          message: `解析失败: ${(err as Error).message}`,
          position: { line: 1, column: 1, offset: 0 },
          length: 0,
        },
      ],
    };
  }
}
