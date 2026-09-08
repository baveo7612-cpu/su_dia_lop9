import React, { useEffect } from 'react';
import { Skull, RotateCcw, Map, AlertCircle, BookOpen } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export default function DefeatModal({ 
  isOpen, 
  stage, 
  onRetry, 
  onOpenMap 
}) {
  useEffect(() => {
    if (isOpen) {
      soundFx.playWrong();
    }
  }, [isOpen]);

  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-red-500 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/90 text-center box-glow-red overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Defeat Skull Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 p-0.5 shadow-xl shadow-red-600/50 mb-4 animate-pulse">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border-2 border-red-500">
            <Skull className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-400 text-glow-red tracking-wide">
          HIỆP SĨ BỊ HẠ CỤC!
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 mb-5">
          Sinh Lực HP đã về 0 tại Màn {stage.stage_id}! Hãy ôn lại kiến thức và tiếp tục chiến đấu.
        </p>

        {/* Knowledge Review Explanation Box */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-red-500/40 mb-6 text-left relative overflow-hidden shadow-inner">
          <div className="flex items-center gap-2 mb-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>ON LẠI KIẾN THỨC MÀN {stage.stage_id}:</span>
          </div>

          <p className="text-xs sm:text-sm text-amber-200 leading-relaxed font-medium">
            💡 {stage.explanation}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => { soundFx.playClick(); onOpenMap(); }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-extrabold flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
          >
            <Map className="w-4 h-4 text-cyan-400" />
            Xem Bản Đồ
          </button>

          <button
            onClick={() => { soundFx.playClick(); onRetry(); }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-red-600/50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử Lại Màn Này</span>
          </button>
        </div>
      </div>
    </div>
  );
}
