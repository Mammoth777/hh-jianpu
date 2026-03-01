import React, { useEffect, useRef, useState } from 'react';
import type { PlaybackStatus } from '@hh-jianpu/core';
import { useStore } from '../../store/useStore';

interface MetronomeProps {
  tempo: number;
  status: PlaybackStatus;
  onTempoChange: (bpm: number) => void;
}

const Metronome: React.FC<MetronomeProps> = ({ tempo, status, onTempoChange }) => {
  const player = useStore((s) => s.player);
  const score = useStore((s) => s.score);

  // 当前拍（1-based）和每小节总拍数
  const [currentBeat, setCurrentBeat] = useState(0);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  // 是否启用节拍器（默认开启）
  const [isEnabled, setIsEnabled] = useState(true);

  const isPlaying = status === 'playing';

  // 同步每小节拍数（来自曲谱拍号）
  useEffect(() => {
    if (score?.metadata?.timeSignature?.beats) {
      setBeatsPerMeasure(score.metadata.timeSignature.beats);
    }
  }, [score]);

  // 注册节拍器拍点回调（仅用于 UI 更新，一次性注册）
  useEffect(() => {
    player.setBeatCallback((beat, bpm) => {
      setCurrentBeat(beat);
      setBeatsPerMeasure(bpm);
    });
    return () => {
      player.setBeatCallback(null);
    };
  }, [player]);

  // 播放停止时重置拍点显示
  useEffect(() => {
    if (!isPlaying) {
      setCurrentBeat(0);
    }
  }, [isPlaying]);

  // 同步 enabled 状态到 player（在 play() 调用前生效）
  useEffect(() => {
    player.setMetronomeEnabled(isEnabled);
  }, [isEnabled, player]);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur rounded-xl shadow-lg border transition-all ${
          isPlaying && isEnabled ? 'border-highlight shadow-highlight/20' : 'border-barline'
        }`}
      >
        {/* 节拍指示器 + 开关（点击切换启用/禁用） */}
        <button
          onClick={() => setIsEnabled((v) => !v)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            isPlaying && isEnabled
              ? currentBeat === 1
                ? 'bg-highlight text-white scale-110'
                : 'bg-blue-200 text-blue-700'
              : isEnabled
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-300 line-through hover:bg-gray-100'
          }`}
          title={isEnabled ? '节拍器已开启（点击关闭）' : '节拍器已关闭（点击开启）'}
        >
          {isPlaying && isEnabled && currentBeat > 0 ? currentBeat : '♩'}
        </button>

        {/* 速度滑块 */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={40}
            max={240}
            value={tempo}
            onChange={(e) => onTempoChange(parseInt(e.target.value, 10))}
            className="w-20 accent-highlight"
          />
          <span className="text-sm font-mono text-ink w-8 text-right">{tempo}</span>
        </div>
      </div>
    </div>
  );
};

export default Metronome;
