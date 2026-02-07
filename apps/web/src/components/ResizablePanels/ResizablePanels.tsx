import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ResizablePanelsProps {
  left: React.ReactNode;
  right: React.ReactNode;
  minLeftWidth?: number;
  minRightWidth?: number;
  defaultLeftWidth?: number;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  left,
  right,
  minLeftWidth = 300,
  minRightWidth = 300,
  defaultLeftWidth = 50, // 默认 50%
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;

      // 计算新的左侧面板百分比
      const newLeftPx = e.clientX - containerRect.left;
      const newLeftPercent = (newLeftPx / containerWidth) * 100;

      // 计算最小宽度对应的百分比
      const minLeftPercent = (minLeftWidth / containerWidth) * 100;
      const minRightPercent = (minRightWidth / containerWidth) * 100;
      const maxLeftPercent = 100 - minRightPercent;

      // 限制在合理范围内
      const clampedPercent = Math.max(
        minLeftPercent,
        Math.min(maxLeftPercent, newLeftPercent)
      );

      setLeftWidth(clampedPercent);
    },
    [isDragging, minLeftWidth, minRightWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="h-full flex flex-col md:flex-row">
      {/* 左侧面板 */}
      <div
        className="border-r border-barline min-h-0"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* 分隔线（可拖动） */}
      <div
        className={`
          hidden md:flex w-1 bg-barline hover:bg-blue-400 cursor-col-resize 
          transition-colors duration-150 relative group
          ${isDragging ? 'bg-blue-500' : ''}
        `}
        onMouseDown={handleMouseDown}
      >
        {/* 拖动提示（悬停时显示） */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-12 bg-blue-500 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* 右侧面板 */}
      <div
        className="overflow-auto p-4 min-h-0"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
};
