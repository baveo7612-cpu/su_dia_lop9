import React from 'react';
import { X, Backpack, Sparkles, Flame, Snowflake, Shield, Award } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export default function SkillInventoryModal({ 
  isOpen, 
  onClose, 
  unlockedSkills, 
  allStages 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-purple-500/60 rounded-2xl shadow-2xl shadow-purple-950/90 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-900/60 text-pink-400 border border-purple-500/40">
              <Backpack className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg sm:text-xl text-purple-200 tracking-wide text-glow-cyan">
                TÚI ĐỒ TRI THỨC (SKILL DECK)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Bộ sưu tập Kỹ Năng đã mở khóa: <span className="text-yellow-400 font-bold">{unlockedSkills.length} / {allStages.length}</span> Thẻ Thần Bài
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

        {/* Modal Body: Grid of collected skill cards */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allStages.map((stage) => {
            const isUnlocked = unlockedSkills.includes(stage.reward_skill);
            const isHistory = stage.stage_id <= 20;

            return (
              <div
                key={stage.stage_id}
                className={`relative rounded-xl p-4 border-2 transition-all duration-300 ${
                  isUnlocked
                    ? isHistory
                      ? 'bg-gradient-to-br from-slate-900 via-red-950/40 to-slate-900 border-red-500/60 shadow-lg shadow-red-950/40 box-glow-red'
                      : 'bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40 box-glow-cyan'
                    : 'bg-slate-950/60 border-slate-800 opacity-50 grayscale'
                }`}
              >
                {/* Stage Badge & Category */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
                    isHistory ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {isHistory ? <Flame className="w-3 h-3 text-red-400" /> : <Snowflake className="w-3 h-3 text-cyan-400" />}
                    MÀN {stage.stage_id} • {isHistory ? 'LỊCH SỬ' : 'ĐỊA LÝ'}
                  </span>

                  {isUnlocked ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> ĐÃ SỞ HỮU
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">🔒 Khóa</span>
                  )}
                </div>

                {/* Skill Title & Icon */}
                <div className="flex items-start gap-3 my-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 border shadow ${
                    isUnlocked
                      ? isHistory
                        ? 'bg-red-900 text-yellow-300 border-red-400'
                        : 'bg-cyan-900 text-cyan-200 border-cyan-400'
                      : 'bg-slate-900 text-slate-600 border-slate-800'
                  }`}>
                    {isUnlocked ? (isHistory ? '⚔️' : '🌐') : '🔒'}
                  </div>

                  <div>
                    <h4 className={`font-black text-sm sm:text-base ${
                      isUnlocked ? (isHistory ? 'text-red-300' : 'text-cyan-200') : 'text-slate-500'
                    }`}>
                      {stage.reward_skill}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      Nguồn: {stage.stage_title}
                    </p>
                  </div>
                </div>

                {/* Skill Explanation Summary */}
                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  {isUnlocked ? stage.explanation : 'Vượt màn chơi để mở khóa bí kíp này!'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-purple-500/30 flex justify-end">
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md transition"
          >
            Đóng Túi Đồ
          </button>
        </div>
      </div>
    </div>
  );
}
