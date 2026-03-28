import { NoteElement, BoundingBox, NoteBoundingBox } from '../types/index.js';
import { calculateSymbolWidth, getSymbolRatio } from './symbol-width.js';

const boundingBoxCache = new Map<string, NoteBoundingBox>();

function getCacheKey(note: NoteElement, fontSize: number, x: number, y: number): string {
  return JSON.stringify({ note, fontSize, x, y });
}

export function clearBoundingBoxCache(): void {
  boundingBoxCache.clear();
}

export function calculateNoteBoundingBox(
  note: NoteElement,
  fontSize: number,
  x: number,
  y: number
): NoteBoundingBox {
  const cacheKey = getCacheKey(note, fontSize, x, y);
  
  if (boundingBoxCache.has(cacheKey)) {
    return boundingBoxCache.get(cacheKey)!;
  }
  
  const noteWidth = calculateSymbolWidth('noteDigit', fontSize);
  const noteHeight = fontSize;
  
  // 基础边界框（音符数字）
  let left = x - noteWidth / 2;
  let right = x + noteWidth / 2;
  let top = y - noteHeight / 2;
  let bottom = y + noteHeight / 2;
  
  // 处理倚音偏移
  if (note.type === 'note' && note.isGrace) {
    const graceOffsetX = -12; // 来自NoteView.tsx
    left += graceOffsetX;
    right += graceOffsetX;
    // 倚音字体更小
    const graceWidth = calculateSymbolWidth('graceNote', fontSize);
    left = x + graceOffsetX - graceWidth / 2;
    right = x + graceOffsetX + graceWidth / 2;
  }
  
  // 处理八度点
  if (note.type === 'note' && note.octave !== 0) {
    const dotSize = calculateSymbolWidth('octaveDot', fontSize);
    if (note.octave > 0) {
      // 高八度点在上方
      const dotCount = note.octave;
      top = Math.min(top, y - (fontSize * 0.7) - (dotCount - 1) * 6);
    } else {
      // 低八度点在下方
      const dotCount = Math.abs(note.octave);
      bottom = Math.max(bottom, y + (fontSize * 0.7) + (dotCount - 1) * 6);
    }
  }
  
  // 处理减时线
  if (note.type === 'note' && note.duration.base >= 8) {
    const beamWidth = calculateSymbolWidth('beamLine', fontSize);
    right = Math.max(right, x + beamWidth / 2);
    left = Math.min(left, x - beamWidth / 2);
    bottom = Math.max(bottom, y + 12); // 减时线在下方
  }
  
  // 处理波音标记
  if (note.type === 'note' && note.trillType) {
    const trillWidth = calculateSymbolWidth('trillSymbol', fontSize);
    right = Math.max(right, x + trillWidth / 2);
    left = Math.min(left, x - trillWidth / 2);
    top = Math.min(top, y - 22); // 波音标记在上方
  }
  
  // 处理附点
  if (note.type === 'note' && note.dot) {
    const dotWidth = calculateSymbolWidth('dot', fontSize);
    right = Math.max(right, x + noteWidth / 2 + dotWidth);
  }
  
  const result: NoteBoundingBox = {
    noteIndex: 0, // 将在调用时设置
    horizontal: {
      left,
      right,
      top: y - noteHeight / 2, // 横向边界框只关心水平方向
      bottom: y + noteHeight / 2,
      width: right - left,
      height: noteHeight,
    },
    vertical: {
      left: x - noteWidth / 2, // 纵向边界框只关心垂直方向
      right: x + noteWidth / 2,
      top,
      bottom,
      width: noteWidth,
      height: bottom - top,
    },
  };
  
  boundingBoxCache.set(cacheKey, result);
  return result;
}

export function checkBoundingBoxOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.right < box2.left ||
    box1.left > box2.right ||
    box1.bottom < box2.top ||
    box1.top > box2.bottom
  );
}