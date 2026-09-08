import React from 'react';
import { Volume2, VolumeX, Backpack, Map, RotateCcw, Award, Zap } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export default function Navbar({ 
  currentStageId, 
  totalStages, 
  playerLevel, 
  playerExp, 
  maxExp,
  unlockedSkillsCount, 
  isMuted, 
  onToggleMute, 
  onOpenInventory, 
  onOpenMap,
  onResetProgress 
}) {
  const expPercent = Math.min(100, Math.floor((playerExp / maxExp) * 100));

  return (
    <header className="shrink-0 bg-slate-900/95 border-b border-cyan-500/40 px-3 py-1.5 shadow-md shadow-cyan-950/40 z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Game Title & Stage Badge */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm border border-cyan-300 shrink-0 text-xs">
            ⚡
          </div>
          <div>
            <h1 className="font-extrabold text-xs sm:text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-yellow-300 to-pink-500 leading-tight">
              SỬ ĐỊA CHIẾN KỶ
            </h1>
            <p className="text-[9px] sm:text-[10px] text-cyan-400/80 font-mono tracking-wider uppercase leading-none hidden sm:block">
              Mật Mã Thi Vào 10
            </p>
          </div>

          <div className="ml-1 bg-slate-800/80 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1 shrink-0">
            <Award className="w-3 h-3 text-yellow-400" />
            <span className="text-[11px] font-bold text-yellow-300">Ải {currentStageId}/{totalStages}</span>
          </div>
        </div>

        {/* Center: EXP Level Bar */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 w-52 shrink-0">
          <div className="flex items-center gap-0.5 bg-gradient-to-r from-purple-600 to-pink-600 px-1.5 py-0.5 rounded text-[10px] font-black text-white shrink-0">
            <Zap className="w-3 h-3" /> LV.{playerLevel}
          </div>
          <div className="w-full">
            <div className="flex justify-between text-[9px] text-slate-400 font-mono mb-0.5">
              <span>EXP</span>
              <span>{playerExp}/{maxExp}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => { soundFx.playClick(); onOpenMap(); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-700 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition active:scale-95 shadow-sm"
            title="Lộ Trình Vào 10 (Stage Map)"
          >
            <Map className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Lộ Trình</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); onOpenInventory(); }}
            className="relative flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/60 hover:bg-purple-700 text-purple-200 border border-purple-500/40 text-xs font-semibold transition active:scale-95 shadow-sm"
            title="Túi Đồ Tri Thức (Skill Deck)"
          >
            <Backpack className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Túi Đồ</span>
            {unlockedSkillsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                {unlockedSkillsCount}
              </span>
            )}
          </button>

          <button
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
            title={isMuted ? "Bật Âm Thanh" : "Tắt Âm Thanh"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
          </button>

          <button
            onClick={() => {
              if (window.confirm("Bạn có chắc chắn muốn chơi lại từ Màn 1 không?")) {
                soundFx.playClick();
                onResetProgress();
              }
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-600 transition active:scale-95"
            title="Chơi lại từ đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
