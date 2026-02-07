import { describe, it, expect } from 'vitest';
import { scheduleNotes, noteToFrequency } from '../player/index';
import type { Score, Note } from '../types/index';

describe('Player', () => {
  const mockScore: Score = {
    metadata: {
      key: 'C',
      timeSignature: { beats: 4, beatValue: 4 },
      tempo: 120,
    },
    measures: [
      {
        number: 1,
        notes: [
          { type: 'note', pitch: 1, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'note', pitch: 3, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'note', pitch: 5, octave: 0, duration: { base: 4, dots: 0 }, dot: false },
          { type: 'rest', duration: { base: 4, dots: 0 } },
        ],
      },
    ],
  };

  describe('scheduleNotes', () => {
    it('should create scheduled notes with correct timing', () => {
      const scheduled = scheduleNotes(mockScore);

      expect(scheduled).toHaveLength(4);
      expect(scheduled[0].startTime).toBe(0);
      expect(scheduled[0].duration).toBeCloseTo(0.5); // 120 BPM -> 0.5s per beat
    });

    it('should assign sequential indices', () => {
      const scheduled = scheduleNotes(mockScore);

      scheduled.forEach((note, idx) => {
        expect(note.index).toBe(idx);
      });
    });

    it('should set frequency to null for rests', () => {
      const scheduled = scheduleNotes(mockScore);

      expect(scheduled[3].frequency).toBeNull(); // rest
    });

    it('should calculate cumulative start times', () => {
      const scheduled = scheduleNotes(mockScore);

      expect(scheduled[0].startTime).toBe(0);
      expect(scheduled[1].startTime).toBeCloseTo(0.5);
      expect(scheduled[2].startTime).toBeCloseTo(1.0);
      expect(scheduled[3].startTime).toBeCloseTo(1.5);
    });
  });

  describe('noteToFrequency', () => {
    it('should calculate correct frequency for middle C (do in C major)', () => {
      const note: Note = {
        type: 'note',
        pitch: 1, // do
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      };

      const freq = noteToFrequency(note, 0); // C key offset = 0
      expect(freq).toBeCloseTo(261.63, 1); // C4 = 261.63 Hz
    });

    it('should calculate correct frequency for high octave', () => {
      const note: Note = {
        type: 'note',
        pitch: 1,
        octave: 1,
        duration: { base: 4, dots: 0 },
        dot: false,
      };

      const freq = noteToFrequency(note, 0);
      expect(freq).toBeCloseTo(523.25, 1); // C5 = 523.25 Hz
    });

    it('should calculate correct frequency for low octave', () => {
      const note: Note = {
        type: 'note',
        pitch: 1,
        octave: -1,
        duration: { base: 4, dots: 0 },
        dot: false,
      };

      const freq = noteToFrequency(note, 0);
      expect(freq).toBeCloseTo(130.81, 1); // C3 = 130.81 Hz
    });

    it('should handle key transposition', () => {
      const note: Note = {
        type: 'note',
        pitch: 1, // do
        octave: 0,
        duration: { base: 4, dots: 0 },
        dot: false,
      };

      const freq = noteToFrequency(note, 2); // D major (2 semitones up)
      expect(freq).toBeCloseTo(293.66, 1); // D4 = 293.66 Hz
    });
  });
});
