import React from 'react';
import type { MeasureLayout } from '@as-nmn/core';
import NoteView from './NoteView';

interface MeasureViewProps {
  layout: MeasureLayout;
  currentNoteIndex: number;
  onNoteClick?: (index: number) => void;
}

const MeasureView: React.FC<MeasureViewProps> = ({ layout, currentNoteIndex, onNoteClick }) => {
  const { measure, x, y, width, notes } = layout;

  return (
    <g>
      {/* 小节线（右侧） */}
      <line
        x1={x + width}
        y1={y + 8}
        x2={x + width}
        y2={y + 52}
        stroke="#D6D3D1"
        strokeWidth={1}
      />

      {/* 小节编号（调试用，生产环境可隐藏） */}
      {/* <text x={x + 4} y={y + 12} fontSize={9} fill="#D6D3D1">{measure.number}</text> */}

      {/* 音符 */}
      {notes.map((notePos) => (
        <NoteView
          key={notePos.index}
          note={notePos.note}
          x={notePos.x}
          y={notePos.y}
          index={notePos.index}
          isActive={notePos.index === currentNoteIndex}
          isPlayed={currentNoteIndex >= 0 && notePos.index < currentNoteIndex}
          onClick={onNoteClick}
        />
      ))}
    </g>
  );
};

export default React.memo(MeasureView);
