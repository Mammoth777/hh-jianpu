import React, { useMemo, useEffect, useState } from 'react';
import { createLayout } from '@as-nmn/core';
import type { Score } from '@as-nmn/core';
import MeasureView from './MeasureView';

interface ScoreViewProps {
  score: Score;
  currentNoteIndex: number;
  width?: number;
  measuresPerLine?: number;
  onNoteClick?: (index: number) => void;
}

const ScoreView: React.FC<ScoreViewProps> = ({
  score,
  currentNoteIndex,
  width,
  measuresPerLine,
  onNoteClick,
}) => {
  // 响应式：根据窗口宽度自动调整
  const [containerWidth, setContainerWidth] = useState(width || 800);
  const [autoMeasuresPerLine, setAutoMeasuresPerLine] = useState(measuresPerLine || 4);

  useEffect(() => {
    if (width !== undefined && measuresPerLine !== undefined) return;

    const updateDimensions = () => {
      const w = window.innerWidth;
      if (w < 640) {
        // 移动端
        setContainerWidth(w - 32);
        setAutoMeasuresPerLine(2);
      } else if (w < 1024) {
        // 平板
        setContainerWidth(Math.min(w - 64, 700));
        setAutoMeasuresPerLine(3);
      } else {
        // 桌面
        setContainerWidth(Math.min(w - 128, 900));
        setAutoMeasuresPerLine(4);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [width, measuresPerLine]);

  const finalWidth = width || containerWidth;
  const finalMeasuresPerLine = measuresPerLine || autoMeasuresPerLine;

  const layout = useMemo(
    () => createLayout(score, { width: finalWidth, measuresPerLine: finalMeasuresPerLine }),
    [score, finalWidth, finalMeasuresPerLine]
  );

  return (
    <div className="score-view overflow-auto">
      <svg
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="mx-auto"
      >
        {/* 标题 */}
        {score.metadata.title && (
          <text
            x={layout.width / 2}
            y={30}
            textAnchor="middle"
            fontSize={22}
            fontWeight={600}
            fill="#1C1917"
          >
            {score.metadata.title}
          </text>
        )}

        {/* 元信息行 */}
        <text
          x={layout.width / 2}
          y={55}
          textAnchor="middle"
          fontSize={13}
          fill="#94A3B8"
          fontFamily="'JetBrains Mono', monospace"
        >
          1={score.metadata.key}  {score.metadata.timeSignature.beats}/{score.metadata.timeSignature.beatValue}  ♩={score.metadata.tempo}
        </text>

        {/* 小节 */}
        {layout.lines.map((line, lineIdx) => (
          <g key={lineIdx}>
            {/* 行首小节线 */}
            <line
              x1={line.measures[0]?.x ?? 0}
              y1={line.y + 8}
              x2={line.measures[0]?.x ?? 0}
              y2={line.y + 52}
              stroke="#D6D3D1"
              strokeWidth={1}
            />
            {line.measures.map((measureLayout) => (
              <MeasureView
                key={measureLayout.measure.number}
                layout={measureLayout}
                currentNoteIndex={currentNoteIndex}
                onNoteClick={onNoteClick}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default React.memo(ScoreView);
