import { describe, it, expect } from 'vitest';
import { createLayout } from '../renderer/layout.js';
import { Score, Metadata } from '../types/index.js';

describe('Dynamic Layout Performance', () => {
  it('should handle large scores efficiently', () => {
    const metadata: Metadata = {
      key: 'C',
      timeSignature: { beats: 4, beatValue: 4 },
      tempo: 120,
    };
    
    // 创建一个大型乐谱
    const measures = [];
    for (let i = 0; i < 100; i++) {
      measures.push({
        number: i + 1,
        notes: Array.from({ length: 8 }, (_, j) => ({
          type: 'note' as const,
          pitch: (j % 7) + 1,
          octave: Math.floor(j / 4) - 1,
          duration: { base: 4, dots: 0 },
          dot: false,
        })),
      });
    }
    
    const score: Score = { metadata, measures };
    
    const start = performance.now();
    const layout = createLayout(score, { width: 800 });
    const time = performance.now() - start;
    
    expect(layout.allNotes.length).toBe(800);
    expect(time).toBeLessThan(100); // 应该在100ms内完成
  });

  it('should use cache for repeated calculations', () => {
    const metadata: Metadata = {
      key: 'C',
      timeSignature: { beats: 4, beatValue: 4 },
      tempo: 120,
    };
    
    const score: Score = {
      metadata,
      measures: [
        {
          number: 1,
          notes: Array.from({ length: 8 }, (_, j) => ({
            type: 'note' as const,
            pitch: (j % 7) + 1,
            octave: 0,
            duration: { base: 4, dots: 0 },
            dot: false,
          })),
        },
      ],
    };
    
    // 第一次计算
    const start1 = performance.now();
    createLayout(score, { width: 800 });
    const time1 = performance.now() - start1;
    
    // 第二次计算（应该使用缓存）
    const start2 = performance.now();
    createLayout(score, { width: 800 });
    const time2 = performance.now() - start2;
    
    // 第二次应该更快
    expect(time2).toBeLessThan(time1 * 0.7); // 至少快30%
  });

  it('should handle complex notes with multiple symbols', () => {
    const metadata: Metadata = {
      key: 'C',
      timeSignature: { beats: 4, beatValue: 4 },
      tempo: 120,
    };
    
    const score: Score = {
      metadata,
      measures: [
        {
          number: 1,
          notes: [
            {
              type: 'note',
              pitch: 5,
              octave: 2,
              duration: { base: 8, dots: 0 },
              dot: true,
              trillType: 'single',
            },
            {
              type: 'note',
              pitch: 6,
              octave: -1,
              duration: { base: 4, dots: 0 },
              dot: false,
            },
          ],
        },
      ],
    };
    
    const start = performance.now();
    const layout = createLayout(score, { width: 800 });
    const time = performance.now() - start;
    
    expect(layout.allNotes.length).toBe(2);
    expect(time).toBeLessThan(10); // 应该在10ms内完成
  });
});