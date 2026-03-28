import React, { useState } from "react";
import type { PlaybackStatus } from "@hh-jianpu/core";

const DELAY_BEATS = [0, 4, 8, 16] as const;
const FONT_SIZES = [
  { label: "中杯", value: 18 },
  { label: "大杯", value: 24 },
  { label: "超大杯", value: 30 },
] as const;

interface PlayerBarProps {
  playButtonRef?: React.RefObject<HTMLButtonElement>;
  status: PlaybackStatus;
  playDelay: number;
  isMetronomeActive?: boolean;
  countdownValue?: number;
  noteFontSize: number;
  /** 控制条是否折叠（编辑器聚焦时） */
  collapsed?: boolean;
  /** 固定控制条（不折叠） */
  pinned?: boolean;
  onNoteFontSizeChange: (size: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onPlayDelayChange: (beats: number) => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  playButtonRef,
  status,
  playDelay,
  isMetronomeActive = false,
  countdownValue = 0,
  noteFontSize,
  collapsed = false,
  pinned = false,
  onNoteFontSizeChange,
  onPlay,
  onPause,
  onStop,
  onPlayDelayChange,
}) => {
  const [isPinned, setIsPinned] = useState(pinned);
  const isCollapsed = collapsed && !isPinned;

  const handlePlayClick = () => {
    if (isCollapsed) return;
    if (isMetronomeActive) {
      onPlay();
    } else if (status === "playing") {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div
      className={`relative flex items-center justify-center gap-4 px-4 py-2 bg-white/80 backdrop-blur border-t border-barline transition-all duration-300 ease-in-out ${
        isCollapsed ? "max-h-0 py-0 border-0 overflow-hidden" : "max-h-14"
      }`}
    >
      {/* Pin 按钮 - 使用 emoji */}
      <button
        onClick={() => setIsPinned(!isPinned)}
        className={`text-xl transition-opacity duration-200 ${
          isCollapsed ? "opacity-0 pointer-events-none w-0" : ""
        } ${isPinned ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
        title={isPinned ? "取消固定" : "固定控制条"}
      >
        📌
      </button>

      {/* 停止 */}
      <button
        onClick={isCollapsed ? undefined : onStop}
        disabled={isCollapsed}
        className={`p-2 rounded-lg hover:bg-gray-100 text-ink transition-opacity duration-200 ${
          isCollapsed ? "opacity-0 pointer-events-none w-0" : ""
        }`}
        title="停止"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <rect x="4" y="4" width="12" height="12" rx="2" />
        </svg>
      </button>

      {/* 播放/暂停 */}
      <button
        ref={playButtonRef}
        onClick={handlePlayClick}
        disabled={isCollapsed}
        className={`p-2.5 rounded-full text-white shadow-md transition-colors ${
          isCollapsed ? "opacity-0 pointer-events-none w-0" : ""
        } ${
          isMetronomeActive
            ? "bg-amber-500 hover:bg-amber-600"
            : "bg-highlight hover:bg-blue-700"
        }`}
        title={isMetronomeActive ? "点击取消倒计时" : status === "playing" ? "暂停" : "播放"}
      >
        {isMetronomeActive && countdownValue > 0 ? (
          <span className="w-5 h-5 flex items-center justify-center text-sm font-bold leading-none">
            {countdownValue}
          </span>
        ) : status === "playing" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="7,4 20,12 7,20" />
          </svg>
        )}
      </button>

      {/* 延迟设置 */}
      <div
        className={`flex items-center gap-1 transition-opacity duration-200 ${
          isCollapsed ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <span className="text-xs text-played select-none">延迟:</span>
        {DELAY_BEATS.map((beats) => (
          <button
            key={beats}
            onClick={() => !isCollapsed && onPlayDelayChange(beats)}
            disabled={isCollapsed}
            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
              playDelay === beats
                ? "bg-highlight text-white"
                : "bg-gray-100 text-played hover:bg-gray-200"
            }`}
          >
            {beats === 0 ? "无" : `${beats}拍`}
          </button>
        ))}
      </div>

      {/* 字体大小 */}
      <div
        className={`flex items-center gap-1 transition-opacity duration-200 ${
          isCollapsed ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        {FONT_SIZES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => !isCollapsed && onNoteFontSizeChange(value)}
            disabled={isCollapsed}
            className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
              noteFontSize === value
                ? "bg-highlight text-white"
                : "bg-gray-100 text-played hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PlayerBar;