import React, { useCallback } from 'react';
import { useStore } from './store/useStore';
import AppLayout from './components/Layout/AppLayout';
import Editor from './components/Editor/Editor';
import ScoreView from './components/ScoreView/ScoreView';
import PlayerBar from './components/Player/PlayerBar';

const App: React.FC = () => {
  const {
    source,
    setSource,
    score,
    parseErrors,
    mode,
    setMode,
    playbackStatus,
    currentNoteIndex,
    tempo,
    isLoading,
    setTempo,
    play,
    pause,
    stop,
    loadExample,
  } = useStore();

  const handleModeToggle = useCallback(() => {
    setMode(mode === 'edit' ? 'play' : 'edit');
  }, [mode, setMode]);

  return (
    <AppLayout
      mode={mode}
      title={score?.metadata.title}
      onModeToggle={handleModeToggle}
      onLoadExample={loadExample}
    >
      {mode === 'edit' ? (
        /* ===== 编辑模式 ===== */
        <div className="h-full flex flex-col md:flex-row">
          {/* 左侧：编辑器 */}
          <div className="flex-1 border-r border-barline min-h-0">
            <Editor value={source} onChange={setSource} />
          </div>

          {/* 右侧：预览 */}
          <div className="flex-1 overflow-auto p-4 min-h-0">
            {score ? (
              <ScoreView
                score={score}
                currentNoteIndex={-1}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-played">
                {parseErrors.length > 0 ? (
                  <div className="space-y-2">
                    {parseErrors.map((err, i) => (
                      <div key={i} className="text-error text-sm">
                        行 {err.position.line}: {err.message}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>输入简谱文本以预览</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ===== 演奏模式 ===== */
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto p-6">
            {score ? (
              <ScoreView
                score={score}
                currentNoteIndex={currentNoteIndex}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-played">
                <p>没有可播放的曲谱，请先编辑</p>
              </div>
            )}
          </div>

          {/* 播放控制栏 */}
          <PlayerBar
            status={playbackStatus}
            tempo={tempo}
            isLoading={isLoading}
            onPlay={play}
            onPause={pause}
            onStop={stop}
            onTempoChange={setTempo}
          />
        </div>
      )}
    </AppLayout>
  );
};

export default App;
