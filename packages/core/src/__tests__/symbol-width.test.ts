import { describe, it, expect } from 'vitest';
import { calculateSymbolWidth, SymbolType } from '../renderer/symbol-width';

describe('SymbolWidthCalculator', () => {
  it('should calculate width for note digit based on font size', () => {
    const width = calculateSymbolWidth('noteDigit', 18);
    expect(width).toBe(18); // 100% of font size
  });

  it('should calculate width for octave dot based on font size', () => {
    const width = calculateSymbolWidth('octaveDot', 18);
    expect(width).toBeCloseTo(5.4, 5); // 30% of font size
  });

  it('should calculate width for beam line based on font size', () => {
    const width = calculateSymbolWidth('beamLine', 18);
    expect(width).toBeCloseTo(21.6, 5); // 120% of font size
  });

  it('should handle grace note with smaller size', () => {
    const width = calculateSymbolWidth('graceNote', 18);
    expect(width).toBe(14.4); // 80% of font size
  });

  it('should throw error for unknown symbol type', () => {
    expect(() => calculateSymbolWidth('unknown' as SymbolType, 18)).toThrow();
  });
});