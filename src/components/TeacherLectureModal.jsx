import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Pause, Play, RotateCcw, FastForward, GraduationCap, BookOpen, SkipForward, Loader2 } from 'lucide-react';
import { teacherSpeech } from '../utils/teacherSpeech';
import { getDeepLecture } from '../data/lectures';
import { soundFx } from '../utils/soundEffects';

export default function TeacherLectureModal({ 
  isOpen, 
  stage, 
  onRetry, 
  onSkipNext 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressState, setProgressState] = useState({
    currentIndex: 0,
    totalSentences: 1,
    progressPercent: 0,
    currentSentenceText: '',
    sentences: [],
    isLoading: false,
    statusMessage: ''
  });

  const activeSentenceRef = useRef(null);

  // Auto-scroll active sentence into view
  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [progressState.currentIndex]);

  // Prepare lecture transcript on modal open (do NOT autoplay audio to comply with browser Autoplay Policy)
  useEffect(() => {
    if (isOpen && stage) {
      const lectureText = getDeepLecture(
        stage.stage_id, 
        stage.stage_title, 
        stage.boss_name, 
        stage.explanation, 
        stage.question
      );

      const sentences = teacherSpeech.loadLecture(lectureText);
      setIsPlaying(false);
      setIsPaused(false);
      setProgressState({
        currentIndex: 0,
        totalSentences: sentences.length,
        progressPercent: 0,
        currentSentenceText: sentences[0] || '',
        sentences: sentences,
        isLoading: false,
        statusMessage: ''
      });
    } else {
      teacherSpeech.stop();
      setIsPlaying(false);
      setIsPaused(false);
    }

    return () => {
      teacherSpeech.stop();
    };
  }, [isOpen, stage?.stage_id]);

  if (!isOpen || !stage) return null;

  // USER GESTURE CLICK: Start audio speech explicitly
  const handleStartSpeech = () => {
    soundFx.playClick();
    const lectureText = getDeepLecture(
      stage.stage_id, 
      stage.stage_title, 
      stage.boss_name, 
      stage.explanation, 
      stage.question
    );

    teacherSpeech.startSpeaking(
      (progress) => {
        setIsPlaying(true);
        setIsPaused(false);
        setProgressState(progress);
      },
      () => {
        setIsPlaying(false);
        setIsPaused(false);
      },
      (errorMsg) => {
        setIsPlaying(false);
        setIsPaused(false);
      }
    );
  };

  const handleTogglePause = () => {
    if (isPlaying) {
      if (isPaused) {
        teacherSpeech.resume();
        setIsPaused(false);
      } else {
        teacherSpeech.pause();
        setIsPaused(true);
      }
    } else {
      handleStartSpeech();
    }
  };

  const handleStopSpeech = () => {
    teacherSpeech.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleRetry = () => {
    soundFx.playClick();
    teacherSpeech.stop();
    onRetry();
  };

  const handleSkipNext = () => {
    soundFx.playClick();
    teacherSpeech.stop();
    onSkipNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-6 shadow-2xl shadow-amber-500/30 text-slate-100 box-glow-gold overflow-hidden flex flex-col max-h-[85vh]">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/30 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                LỚP HỌC ĐẶC BIỆT • BÀI GIẢNG CHUYÊN SÂU ZALO AI
              </span>
              <h2 className="text-sm sm:text-lg font-black text-amber-200 tracking-wide text-glow-gold mt-0.5">
                BÍ KÍP TỪ CÔ GIÁO SỬ - ĐỊA
              </h2>
            </div>
          </div>

          {/* Audio Visualizer Waves */}
          <div className="flex items-end gap-1 h-5 px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying && !isPaused ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'
                }`}
                style={{
                  height: isPlaying && !isPaused ? `${Math.sin(i * 1.5) * 10 + 12}px` : '5px',
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Teacher Avatar & User Gesture Audio Start Button */}
        <div className="bg-slate-950/90 rounded-2xl p-3 border border-amber-500/40 mb-3 shrink-0 shadow-inner">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className={`absolute -inset-1 rounded-full blur-sm opacity-75 animate-pulse ${
                  isPlaying && !isPaused ? 'bg-amber-400' : 'bg-indigo-500'
                }`} />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-900 to-purple-950 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-lg">
                  👩‍🏫
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-amber-300">
                  Ôn lại kiến thức: {stage.stage_title}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Ải #{stage.stage_id} • Giọng Nữ Bắc Zalo AI Chuẩn Sư Phạm
                </p>
              </div>
            </div>

            {/* Audio Start / Toggle Button */}
            <div className="flex items-center gap-2">
              {!isPlaying ? (
                <button
                  onClick={handleStartSpeech}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider transition transform active:scale-95 shadow-lg shadow-amber-500/40 animate-pulse border-2 border-white"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>🔊 BẮT ĐẦU NGHE CÔ GIẢNG BÀI</span>
                </button>
              ) : progressState.isLoading ? (
                <button
                  disabled
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/90 text-slate-950 font-black text-xs uppercase tracking-wider opacity-90 cursor-wait border-2 border-white shadow-md animate-pulse"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>⏳ Đang tải giọng cô giáo...</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleTogglePause}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition active:scale-95 shadow-md font-bold"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>▶ Tiếp Tục</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>🔒 Tạm Dừng</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleStopSpeech}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition"
                    title="Bỏ qua âm thanh"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Audio Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-amber-300">
              <span>
                {progressState.isLoading ? '⏳ ĐANG TẢI GIỌNG ZALO AI...' : 'TIẾN TRÌNH BÀI GIẢNG'}
              </span>
              <span>
                {isPlaying ? progressState.currentIndex + 1 : 0} / {progressState.totalSentences || 1} Câu ({isPlaying ? progressState.progressPercent : 0}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-amber-500/30 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-300 shadow shadow-amber-400/50"
                style={{ width: `${isPlaying ? progressState.progressPercent : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Immersive Scrollable Lecture Transcript */}
        <div className="flex-1 overflow-y-auto bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30 space-y-2 shadow-inner mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span>NỘI DUNG BÀI GIẢNG NGUYÊN BẢN (VỪA NGHE VỪA ĐỌC THEO):</span>
          </div>

          {progressState.sentences && progressState.sentences.length > 0 ? (
            progressState.sentences.map((sentence, idx) => {
              const isActive = isPlaying && idx === progressState.currentIndex;
              return (
                <p
                  key={idx}
                  ref={isActive ? activeSentenceRef : null}
                  className={`text-xs sm:text-sm leading-relaxed p-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/20 border-l-4 border-amber-400 text-amber-100 font-bold box-glow-gold'
                      : 'text-slate-300 hover:text-slate-100 opacity-80'
                  }`}
                >
                  {isActive && <span className="mr-1 text-amber-400 font-black">▶</span>}
                  {sentence}
                </p>
              );
            })
          ) : (
            <p className="text-xs text-amber-200 leading-relaxed font-medium">
              💡 {stage.explanation}
            </p>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 shrink-0">
          <button
            onClick={handleRetry}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🔄 THỬ THÁCH LẠI (XÁO ĐÁP ÁN)</span>
          </button>

          <button
            onClick={handleSkipNext}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
          >
            <span>⏩ TẠM QUA ẢI TIẾP</span>
            <FastForward className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
