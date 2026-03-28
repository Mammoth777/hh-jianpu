import { describe, it, expect } from 'vitest';
import { calculateDynamicSpacing, calculateNotePositions } from '../renderer/dynamic-spacing.js';
import { NoteElement } from '../types/index.js';

describe('DynamicSpacingCalculator', () => {
  it('should calculate spacing for simple notes', () => {
    const notes: NoteElement[] = [
      {
        type: 'note',
        pitch: 5,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      },
      {
        type: 'note',
        pitch: 6,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      },
    ];
    
    const spacing = calculateDynamicSpacing(notes, 18, 200);
    
    expect(spacing).toBeGreaterThan(0);
    expect(spacing).toBeLessThanOrEqual(200); // 不应超过最大间距
  });

  it('should increase spacing for notes with beam lines', () => {
    const simpleNotes: NoteElement[] = [
      {
        type: 'note',
        pitch: 5,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      },
      {
        type: 'note',
        pitch: 6,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      },
    ];
    
    const complexNotes: NoteElement[] = [
      {
        type: 'note',
        pitch: 5,
        octave: 0,
        duration: { base: 8, dots: 0 }, // 八分音符，有减时线
        dot: false,
      },
      {
        type: 'note',
        pitch: 6,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      },
    ];
    
    const simpleSpacing = calculateDynamicSpacing(simpleNotes, 18, 200);
    const complexSpacing = calculateDynamicSpacing(complexNotes, 18, 200);
    
    expect(complexSpacing).toBeGreaterThan(simpleSpacing);
  });

  it('should handle grace notes', () => {
    const notes: NoteElement[] = [
      {
        type: 'note',
        pitch: 5,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
        isGrace: true,
      },
      {
        type: 'note',
        pitch: 6,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      },
    ];
    
    const spacing = calculateDynamicSpacing(notes, 18, 200);
    
    expect(spacing).toBeGreaterThan(0);
  });

  it('should return default spacing for empty notes', () => {
    const spacing = calculateDynamicSpacing([], 18, 200);
    
    expect(spacing).toBe(18); // 默认间距应该是字体大小
  });

  it('should respect max width constraint', () => {
    const notes: NoteElement[] = [
      {
        type: 'note',
        pitch: 5,
        octave: 2,
        duration: { base: 8, dots: 0 },
        dot: true,
        trillType: 'single',
      },
    ];
    
    const spacing = calculateDynamicSpacing(notes, 18, 50); // 很小的最大宽度
    
    expect(spacing).toBeLessThanOrEqual(50);
  });

  it('should calculate note positions correctly', () => {
    const notes: NoteElement[] = [
      {
        type: 'note',
        pitch: 5,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      },
      {
        type: 'note',
        pitch: 6,
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      },
    ];
    
    const positions = calculateNotePositions(notes, 18, 100, 40);
    
    expect(positions).toHaveLength(2);
    expect(positions[0].x).toBe(100);
    expect(positions[1].x).toBe(140); // 100 + 40
  });
});