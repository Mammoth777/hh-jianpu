import React from 'react';
import type { PlaybackStatus } from '@as-nmn/core';

interface PlayerBarProps {
  status: PlaybackStatus;
  tempo: number;
  isLoading?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onTempoChange: (bpm: number) => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  status,
  tempo,
  isLoading = false,
  onPlay,
  onPause,
  onStop,
  onTempoChange,
}) => {
  return (
    <div className="flex items-center justify-center gap-6 px-6 py-3 bg-white/80 backdrop-blur border-t border-barline">
      {/* 停止 */}
      <button
        onClick={onStop}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-ink"
        title="停止"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <rect x="4" y="4" width="12" height="12" rx="2" />
        </svg>
      </button>

      {/* 播放/暂停 */}
      <button
        onClick={status === 'playing' ? onPause : onPlay}
        disabled={isLoading}
        className="p-3 rounded-full bg-highlight text-white hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        title={isLoading ? '加载中...' : (status === 'playing' ? '暂停' : '播放')}
      >
        {isLoading ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="animate-spin">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="32" />
          </svg>
        ) : status === 'playing' ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="7,4 20,12 7,20" />
          </svg>
        )}
      </button>

      {/* 速度控制 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-played select-none">♩=</span>
        <input
          type="range"
          min={40}
          max={240}
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value, 10))}
          className="w-28 accent-highlight"
        />
        <span className="text-sm font-mono text-ink w-8 text-right">{tempo}</span>
      </div>
    </div>
  );
};

export default PlayerBar;
