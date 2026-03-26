import React from 'react';

interface RunningCatProps {
  /** 动画尺寸，默认 24 */
  size?: number;
  /** 颜色，默认 currentColor */
  color?: string;
}

/**
 * 跑动小猫 loading 动画
 *
 * 纯 SVG + CSS 动画，零依赖。
 * 小猫四肢交替奔跑、尾巴摇摆、身体微弹跳。
 */
const RunningCat: React.FC<RunningCatProps> = ({ size = 24, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className="running-cat"
      role="img"
      aria-label="加载中"
    >
      <style>{`
        .running-cat { overflow: visible; }

        /* 整体弹跳 */
        .rc-body {
          animation: rc-bounce 0.3s ease-in-out infinite alternate;
          transform-origin: 16px 18px;
        }
        @keyframes rc-bounce {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-1.5px); }
        }

        /* 前腿 — 交替蹬 */
        .rc-front-leg {
          animation: rc-front 0.2s ease-in-out infinite alternate;
          transform-origin: 22px 20px;
        }
        .rc-front-leg-alt {
          animation: rc-front-alt 0.2s ease-in-out infinite alternate;
          transform-origin: 22px 20px;
        }
        @keyframes rc-front {
          0%   { transform: rotate(-25deg); }
          100% { transform: rotate(25deg); }
        }
        @keyframes rc-front-alt {
          0%   { transform: rotate(25deg); }
          100% { transform: rotate(-25deg); }
        }

        /* 后腿 — 交替蹬（与前腿反相） */
        .rc-hind-leg {
          animation: rc-hind 0.2s ease-in-out infinite alternate;
          transform-origin: 10px 20px;
        }
        .rc-hind-leg-alt {
          animation: rc-hind-alt 0.2s ease-in-out infinite alternate;
          transform-origin: 10px 20px;
        }
        @keyframes rc-hind {
          0%   { transform: rotate(20deg); }
          100% { transform: rotate(-20deg); }
        }
        @keyframes rc-hind-alt {
          0%   { transform: rotate(-20deg); }
          100% { transform: rotate(20deg); }
        }

        /* 尾巴 — 左右摇摆 */
        .rc-tail {
          animation: rc-tail 0.4s ease-in-out infinite alternate;
          transform-origin: 8px 16px;
        }
        @keyframes rc-tail {
          0%   { transform: rotate(-15deg); }
          100% { transform: rotate(15deg); }
        }

        /* 耳朵 — 微微颤动 */
        .rc-ear {
          animation: rc-ear 0.3s ease-in-out infinite alternate;
          transform-origin: center bottom;
        }
        @keyframes rc-ear {
          0%   { transform: scaleY(1); }
          100% { transform: scaleY(0.85); }
        }
      `}</style>

      {/* 尾巴 */}
      <path
        className="rc-tail"
        d="M8 16 Q4 12, 3 8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* 身体 */}
      <g className="rc-body">
        {/* 躯干 */}
        <ellipse cx="16" cy="18" rx="7" ry="5" fill={color} opacity="0.9" />

        {/* 头 */}
        <circle cx="24" cy="13" r="4.5" fill={color} />

        {/* 耳朵 */}
        <path className="rc-ear" d="M21 9.5 L22 6 L24 9" fill={color} />
        <path className="rc-ear" d="M25 9 L27 5.5 L28 9" fill={color} />

        {/* 眼睛 */}
        <circle cx="25.5" cy="12.5" r="0.8" fill="white" />

        {/* 鼻子 */}
        <circle cx="27.5" cy="13.5" r="0.5" fill="white" opacity="0.7" />

        {/* 胡须 */}
        <line x1="27" y1="13" x2="31" y2="11.5" stroke={color} strokeWidth="0.5" opacity="0.5" />
        <line x1="27" y1="14" x2="31" y2="14"   stroke={color} strokeWidth="0.5" opacity="0.5" />
        <line x1="27" y1="15" x2="31" y2="16.5" stroke={color} strokeWidth="0.5" opacity="0.5" />
      </g>

      {/* 后腿 */}
      <g className="rc-hind-leg">
        <line x1="12" y1="22" x2="9"  y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="rc-hind-leg-alt">
        <line x1="10" y1="22" x2="7"  y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* 前腿 */}
      <g className="rc-front-leg">
        <line x1="20" y1="22" x2="22" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="rc-front-leg-alt">
        <line x1="22" y1="22" x2="24" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default RunningCat;
