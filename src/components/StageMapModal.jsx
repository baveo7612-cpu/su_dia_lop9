import React from 'react';
import { X, Map, CheckCircle2, Lock, Star, Flame, Snowflake, Play } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export default function StageMapModal({ 
  isOpen, 
  onClose, 
  allStages, 
  currentStageId, 
  clearedStages, 
  onSelectStage 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-cyan-500/60 rounded-2xl shadow-2xl shadow-cyan-950/90 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              <Map className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl text-cyan-200 tracking-wide text-glow-cyan">
                LỘ TRÌNH THI VÀO 10 (STAGE MAP)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Hành trình chinh phục 40 ải Lịch Sử & Địa Lý • Đã hoàn thành: <span className="text-emerald-400 font-bold">{clearedStages.length} / {allStages.length}</span> Màn
              </p>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-900 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Stage Tree */}
        <div className="p-6 overflow-y-auto space-y-8">
          {/* Chapter 1: Lịch Sử */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-500/40">
              <Flame className="w-5 h-5 text-red-500" />
              <h3 className="font-extrabold text-base sm:text-lg text-red-300 tracking-wide">
                CHƯƠNG I: LỊCH SỬ VIỆT NAM (MÀN 1 - 20)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {allStages.slice(0, 20).map((stg) => {
                const isCleared = clearedStages.includes(stg.stage_id);
                const isCurrent = stg.stage_id === currentStageId;
                const isUnlocked = isCleared || isCurrent || stg.stage_id <= (Math.max(...clearedStages, 0) + 1);

                return (
                  <button
                    key={stg.stage_id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      soundFx.playClick();
                      onSelectStage(stg.stage_id);
                      onClose();
                    }}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between h-28 ${
                      isCurrent
                        ? 'bg-cyan-950/90 border-cyan-400 text-white animate-pulse box-glow-cyan'
                        : isCleared
                        ? 'bg-slate-900 border-emerald-500/70 text-slate-200 hover:bg-slate-800'
                        : isUnlocked
                        ? 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-cyan-400'
                        : 'bg-slate-950/50 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        #{stg.stage_id}
                      </span>
                      {isCleared ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs line-clamp-2 leading-snug">
                        {stg.stage_title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        Trùm: {stg.boss_name}
                      </p>
                    </div>

                    {isCleared && (
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter 2: Địa Lý */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-cyan-500/40">
              <Snowflake className="w-5 h-5 text-cyan-400" />
              <h3 className="font-extrabold text-base sm:text-lg text-cyan-300 tracking-wide">
                CHƯƠNG II: ĐỊA LÝ CÁC VÙNG KINH TẾ (MÀN 21 - 40)
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {allStages.slice(20, 40).map((stg) => {
                const isCleared = clearedStages.includes(stg.stage_id);
                const isCurrent = stg.stage_id === currentStageId;
                const isUnlocked = isCleared || isCurrent || stg.stage_id <= (Math.max(...clearedStages, 0) + 1);

                return (
                  <button
                    key={stg.stage_id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      soundFx.playClick();
                      onSelectStage(stg.stage_id);
                      onClose();
                    }}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 flex flex-col justify-between h-28 ${
                      isCurrent
                        ? 'bg-cyan-950/90 border-cyan-400 text-white animate-pulse box-glow-cyan'
                        : isCleared
                        ? 'bg-slate-900 border-emerald-500/70 text-slate-200 hover:bg-slate-800'
                        : isUnlocked
                        ? 'bg-slate-900/90 border-slate-700 text-slate-300 hover:border-cyan-400'
                        : 'bg-slate-950/50 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        #{stg.stage_id}
                      </span>
                      {isCleared ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isCurrent ? (
                        <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-xs line-clamp-2 leading-snug">
                        {stg.stage_title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        Trùm: {stg.boss_name}
                      </p>
                    </div>

                    {isCleared && (
                      <div className="flex items-center gap-0.5 text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400" />
                        <Star className="w-3 h-3 fill-yellow-400" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-cyan-500/30 flex justify-end">
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md transition"
          >
            Đóng Bản Đồ
          </button>
        </div>
      </div>
    </div>
  );
}
