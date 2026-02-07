import { describe, it, expect } from 'vitest';
import { createLayout } from '../renderer/index';
import type { Score } from '../types/index';

describe('Renderer', () => {
  const mockScore: Score = {
    metadata: {
      title: 'Test',
      key: 'C',
      timeSignature: { beats: 4, beatValue: 4 },
      tempo: 120,
    },
    measures: [
      {
        number: 1,
        notes: [
          { type: 'note', pitch: 1, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'note', pitch: 2, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'note', pitch: 3, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'note', pitch: 4, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
        ],
      },
      {
        number: 2,
        notes: [
          { type: 'note', pitch: 5, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'note', pitch: 6, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'note', pitch: 7, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'note', pitch: 1, octave: 1, duration: { base: 4, dots: 0 }, dot: false },
        ],
      },
    ],
  };

  it('should create layout with correct dimensions', () => {
    const layout = createLayout(mockScore, { width: 800, measuresPerLine: 4 });

    expect(layout.width).toBe(800);
    expect(layout.height).toBeGreaterThan(0);
  });

  it('should distribute measures across lines', () => {
    const layout = createLayout(mockScore, { width: 800, measuresPerLine: 2 });

    expect(layout.lines).toHaveLength(1); // 2 measures / 2 per line = 1 line
    expect(layout.lines[0].measures).toHaveLength(2);
  });

  it('should calculate note positions', () => {
    const layout = createLayout(mockScore, { width: 800, measuresPerLine: 2 });

    expect(layout.allNotes).toHaveLength(8); // 2 measures * 4 notes
    expect(layout.allNotes[0].index).toBe(0);
    expect(layout.allNotes[0].x).toBeGreaterThan(0);
    expect(layout.allNotes[0].y).toBeGreaterThan(0);
  });

  it('should assign global note indices', () => {
    const layout = createLayout(mockScore, { width: 800, measuresPerLine: 2 });

    layout.allNotes.forEach((note, idx) => {
      expect(note.index).toBe(idx);
    });
  });
});
