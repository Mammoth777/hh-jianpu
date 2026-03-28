import { describe, it, expect } from 'vitest';
import { calculateNoteBoundingBox, checkBoundingBoxOverlap } from '../renderer/bounding-box.js';
import { NoteElement } from '../types/index.js';

describe('BoundingBoxCalculator', () => {
  it('should calculate bounding box for simple note', () => {
    const note: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 0,
      duration: { base: 4, dots: 0 },
      dot: false,
    };
    
    const bbox = calculateNoteBoundingBox(note, 18, 0, 0);
    
    expect(bbox.horizontal.width).toBeGreaterThan(0);
    expect(bbox.vertical.height).toBeGreaterThan(0);
    expect(bbox.horizontal.left).toBeLessThan(bbox.horizontal.right);
    expect(bbox.vertical.top).toBeLessThan(bbox.vertical.bottom);
  });

  it('should calculate bounding box for note with octave dots', () => {
    const note: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 2, // 高八度
      duration: { base: 4, dots: 0 },
      dot: false,
    };
    
    const bbox = calculateNoteBoundingBox(note, 18, 0, 0);
    
    // 高八度点应该在音符上方
    expect(bbox.vertical.top).toBeLessThan(0);
  });

  it('should calculate bounding box for grace note', () => {
    const note: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 0,
      duration: { base: 4, dots: 0 },
      dot: false,
      isGrace: true,
    };
    
    const bbox = calculateNoteBoundingBox(note, 18, 0, 0);
    
    // 倚音应该在左侧偏移
    expect(bbox.horizontal.left).toBeLessThan(-10);
  });

  it('should calculate bounding box for note with beam line', () => {
    const note: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 0,
      duration: { base: 8, dots: 0 }, // 八分音符
      dot: false,
    };
    
    const bbox = calculateNoteBoundingBox(note, 18, 0, 0);
    
    // 减时线应该增加宽度
    expect(bbox.horizontal.width).toBeGreaterThan(18);
  });

  it('should calculate bounding box for note with trill', () => {
    const note: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 0,
      duration: { base: 4, dots: 0 },
      dot: false,
      trillType: 'single',
    };
    
    const bbox = calculateNoteBoundingBox(note, 18, 0, 0);
    
    // 波音标记应该增加高度
    expect(bbox.vertical.height).toBeGreaterThan(18);
  });

  it('should calculate bounding box for note with dot', () => {
    const note: NoteElement = {
      type: 'note',
      pitch: 5,
      octave: 0,
      duration: { base: 4, dots: 0 },
      dot: true,
    };
    
    const bbox = calculateNoteBoundingBox(note, 18, 0, 0);
    
    // 附点应该增加宽度
    expect(bbox.horizontal.width).toBeGreaterThan(18);
  });

  it('should detect overlapping bounding boxes', () => {
    const box1 = {
      left: 0,
      right: 10,
      top: 0,
      bottom: 10,
      width: 10,
      height: 10,
    };
    
    const box2 = {
      left: 5,
      right: 15,
      top: 5,
      bottom: 15,
      width: 10,
      height: 10,
    };
    
    expect(checkBoundingBoxOverlap(box1, box2)).toBe(true);
  });

  it('should detect non-overlapping bounding boxes', () => {
    const box1 = {
      left: 0,
      right: 10,
      top: 0,
      bottom: 10,
      width: 10,
      height: 10,
    };
    
    const box2 = {
      left: 20,
      right: 30,
      top: 20,
      bottom: 30,
      width: 10,
      height: 10,
    };
    
    expect(checkBoundingBoxOverlap(box1, box2)).toBe(false);
  });
});