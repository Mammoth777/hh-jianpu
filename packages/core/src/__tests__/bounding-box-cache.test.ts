import { describe, it, expect, beforeEach } from 'vitest';
import { calculateNoteBoundingBox, clearBoundingBoxCache } from '../renderer/bounding-box.js';
import { NoteElement } from '../types/index.js';

describe('BoundingBox Cache', () => {
  beforeEach(() => {
    clearBoundingBoxCache();
  });

  it('should cache bounding box calculations', () => {
    const note: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 0,
      duration: { base: 4, dots: 0 },
      dot: false,
    };
    
    const start1 = performance.now();
    const bbox1 = calculateNoteBoundingBox(note, 18, 0, 0);
    const time1 = performance.now() - start1;
    
    const start2 = performance.now();
    const bbox2 = calculateNoteBoundingBox(note, 18, 0, 0);
    const time2 = performance.now() - start2;
    
    // 第二次调用应该更快（因为缓存）
    expect(time2).toBeLessThan(time1 * 0.5); // 至少快一倍
    expect(bbox1).toEqual(bbox2);
  });

  it('should clear cache correctly', () => {
    const note: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 0,
      duration: { base: 4, dots: 0 },
      dot: false,
    };
    
    calculateNoteBoundingBox(note, 18, 0, 0);
    clearBoundingBoxCache();
    
    // 缓存应该被清空
    const start = performance.now();
    calculateNoteBoundingBox(note, 18, 0, 0);
    const time = performance.now() - start;
    
    // 应该重新计算，时间应该比有缓存时长
    expect(time).toBeGreaterThan(0.001); // 至少1微秒
  });

  it('should cache different notes separately', () => {
    const note1: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 0,
      duration: { base: 4, dots: 0 },
      dot: false,
    };
    
    const note2: NoteElement = {
      type: 'note',
      pitch: 6,
      octave: 2, // 高八度，有不同的边界框
      duration: { base: 4, dots: 0 },
      dot: false,
    };
    
    const bbox1 = calculateNoteBoundingBox(note1, 18, 0, 0);
    const bbox2 = calculateNoteBoundingBox(note2, 18, 0, 0);
    
    // 不同的音符应该有不同的边界框
    expect(bbox1).not.toEqual(bbox2);
    
    // 再次调用应该使用缓存
    const bbox1Cached = calculateNoteBoundingBox(note1, 18, 0, 0);
    const bbox2Cached = calculateNoteBoundingBox(note2, 18, 0, 0);
    
    expect(bbox1Cached).toEqual(bbox1);
    expect(bbox2Cached).toEqual(bbox2);
  });
});