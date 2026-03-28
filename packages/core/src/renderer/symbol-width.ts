export type SymbolType = 'noteDigit' | 'octaveDot' | 'beamLine' | 'trillSymbol' | 'graceNote' | 'dot';

const SYMBOL_WIDTH_RATIOS: Record<SymbolType, number> = {
  noteDigit: 1.0,      // 100%
  octaveDot: 0.3,      // 30%
  beamLine: 1.2,       // 120%
  trillSymbol: 1.5,    // 150%
  graceNote: 0.8,      // 80%
  dot: 0.3,            // 30%
};

export function calculateSymbolWidth(symbolType: SymbolType, fontSize: number): number {
  const ratio = SYMBOL_WIDTH_RATIOS[symbolType];
  if (ratio === undefined) {
    throw new Error(`Unknown symbol type: ${symbolType}`);
  }
  return fontSize * ratio;
}

export function getSymbolRatio(symbolType: SymbolType): number {
  return SYMBOL_WIDTH_RATIOS[symbolType];
}