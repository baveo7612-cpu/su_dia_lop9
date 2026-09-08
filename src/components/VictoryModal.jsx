import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, ArrowRight, Backpack, Star, Zap, Heart } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export default function VictoryModal({ 
  isOpen, 
  stage, 
  onNextStage, 
  onOpenInventory, 
  isFinalStage 
}) {
  useEffect(() => {
    if (isOpen) {
      soundFx.playVictory();
      // Fire confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen || !stage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-yellow-500/40 text-center box-glow-gold overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Icon Badge */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 p-0.5 shadow-xl shadow-yellow-500/50 mb-4 animate-bounce">
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border-2 border-yellow-400">
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-400 text-glow-gold tracking-wide">
          {isFinalStage ? "🎉 ĐẠI THẮNG THI VÀO 10!" : "CHIẾN THẮNG MÀN NÀY!"}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-mono mt-1 mb-5">
          Đã hạ gục hoàn toàn <span className="text-red-400 font-bold">{stage.boss_name}</span> tại Màn {stage.stage_id}!
        </p>

        {/* Skill Unlocked Reward Card Box */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-yellow-500/50 mb-6 text-left relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 bg-yellow-950/80 px-2 py-0.5 rounded border border-yellow-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> THẺ KỸ NĂNG MỚI
            </span>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center font-bold text-2xl text-slate-950 border border-white shadow">
              🏆
            </div>
            <div>
              <h4 className="font-extrabold text-base text-yellow-300">
                {stage.reward_skill}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Đã thêm vào Túi Đồ Tri Thức
              </p>
            </div>
          </div>

          {/* Knowledge Explanation Summary */}
          {stage.explanation && (
            <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-amber-200 leading-relaxed font-medium bg-slate-900/60 p-2.5 rounded-lg border border-amber-500/20">
              <span className="text-yellow-400 font-bold block mb-1">💡 BÍ KÍP GIẢI THÍCH KIẾN THỨC:</span>
              {stage.explanation}
            </div>
          )}

          {/* Reward Stats Gain */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center font-mono text-xs">
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">EXP</span>
              <span className="text-cyan-400 font-bold">+100 EXP</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HỒI MP</span>
              <span className="text-blue-400 font-bold">+50 MP</span>
            </div>
            <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HỒI HP</span>
              <span className="text-emerald-400 font-bold">+20 HP</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => { soundFx.playClick(); onOpenInventory(); }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 text-xs font-extrabold flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
          >
            <Backpack className="w-4 h-4 text-pink-400" />
            Xem Túi Đồ
          </button>

          {!isFinalStage && (
            <button
              onClick={() => { soundFx.playClick(); onNextStage(); }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-yellow-500/40"
            >
              <span>Màn Tiếp Theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
