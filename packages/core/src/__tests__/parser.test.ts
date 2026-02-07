import { describe, it, expect } from 'vitest';
import { parse } from '../parser/index';

describe('Parser', () => {
  it('should parse basic metadata', () => {
    const source = `标题: 测试曲
调号: C
拍号: 4/4
速度: 120

1 2 3 4 |`;

    const result = parse(source);
    expect(result.score).not.toBeNull();
    expect(result.score?.metadata.title).toBe('测试曲');
    expect(result.score?.metadata.key).toBe('C');
    expect(result.score?.metadata.tempo).toBe(120);
    expect(result.score?.metadata.timeSignature.beats).toBe(4);
    expect(result.score?.metadata.timeSignature.beatValue).toBe(4);
  });

  it('should parse notes correctly', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

1 2 3 4 |`;

    const result = parse(source);
    expect(result.score?.measures).toHaveLength(1);
    expect(result.score?.measures[0].notes).toHaveLength(4);
    
    const notes = result.score!.measures[0].notes;
    expect(notes[0].type).toBe('note');
    if (notes[0].type === 'note') {
      expect(notes[0].pitch).toBe(1);
      expect(notes[0].octave).toBe(0);
    }
  });

  it('should parse high octave notes', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

1 2 3' 4' |`;

    const result = parse(source);
    const notes = result.score!.measures[0].notes;
    
    if (notes[2].type === 'note') {
      expect(notes[2].octave).toBe(1);
    }
    if (notes[3].type === 'note') {
      expect(notes[3].octave).toBe(1);
    }
  });

  it('should parse low octave notes', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

.7 .6 1 2 |`;

    const result = parse(source);
    const notes = result.score!.measures[0].notes;
    
    if (notes[0].type === 'note') {
      expect(notes[0].pitch).toBe(7);
      expect(notes[0].octave).toBe(-1);
    }
  });

  it('should parse rests and ties', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

1 0 5 - |`;

    const result = parse(source);
    const notes = result.score!.measures[0].notes;
    
    expect(notes[0].type).toBe('note');
    expect(notes[1].type).toBe('rest');
    expect(notes[2].type).toBe('note');
    expect(notes[3].type).toBe('tie');
  });

  it('should parse underlines (eighth notes)', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

1_ 2_ 3 4 |`;

    const result = parse(source);
    const notes = result.score!.measures[0].notes;
    
    if (notes[0].type === 'note') {
      expect(notes[0].duration.base).toBe(8);
    }
    if (notes[2].type === 'note') {
      expect(notes[2].duration.base).toBe(4);
    }
  });

  it('should parse multiple measures', () => {
    const source = `调号: C
拍号: 4/4
速度: 120

1 2 3 4 | 5 6 7 1' |`;

    const result = parse(source);
    expect(result.score?.measures).toHaveLength(2);
    expect(result.score?.measures[0].number).toBe(1);
    expect(result.score?.measures[1].number).toBe(2);
  });
});
