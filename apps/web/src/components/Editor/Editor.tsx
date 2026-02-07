import React from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 简谱文本编辑器
 * MVP 阶段使用原生 textarea，后续替换为 CodeMirror
 */
const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="text-xs text-played px-3 py-2 border-b border-barline select-none">
        简谱源码
      </div>
      <textarea
        className="editor-area flex-1 w-full p-4 bg-paper text-ink border-none outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`标题: 曲名\n调号: C\n拍号: 4/4\n速度: 120\n\n1 2 3 4 | 5 6 7 1' |`}
        spellCheck={false}
      />
    </div>
  );
};

export default Editor;
