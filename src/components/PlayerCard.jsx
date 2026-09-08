import React from 'react';
import { Shield, Flame, Sparkles, Heart, Zap } from 'lucide-react';

export default function PlayerCard({ 
  playerHp, 
  maxHp = 100, 
  playerMp, 
  maxMp = 100, 
  level, 
  streakCount,
  activeShield,
  doubleDamage
}) {
  const hpPercent = Math.max(0, Math.min(100, Math.floor((playerHp / maxHp) * 100)));
  const mpPercent = Math.max(0, Math.min(100, Math.floor((playerMp / maxMp) * 100)));

  const getTitleRank = (lvl) => {
    if (lvl < 3) return "Tập Sự Ôn Thi";
    if (lvl < 6) return "Học Sinh Ưu Tú";
    if (lvl < 10) return "Chiến Sĩ Sử Địa";
    if (lvl < 15) return "Đại Sứ Lịch Sử";
    if (lvl < 20) return "Thượng Thủ Địa Lý";
    return "Thần Đồng Vào 10";
  };

  return (
    <div className="relative bg-slate-900/90 rounded-xl p-2.5 sm:p-3 border border-cyan-500/40 shadow-lg shadow-cyan-950/60 overflow-hidden flex items-center gap-3">
      {/* Background Pixel Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-transparent to-indigo-950/20 pointer-events-none" />

      {/* Hero Avatar Badge */}
      <div className="relative shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full blur-xs opacity-75 animate-pulse" />
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950 border border-cyan-400 flex items-center justify-center text-2xl shadow-inner">
          🦸‍♂️
        </div>

        {activeShield && (
          <div className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 p-1 rounded-full border border-white shadow animate-bounce" title="Khiên Bảo Vệ">
            <Shield className="w-3 h-3" />
          </div>
        )}
        {doubleDamage && (
          <div className="absolute -bottom-1 -left-1 bg-yellow-400 text-slate-950 p-1 rounded-full border border-white shadow animate-bounce" title="Gấp Đôi Sát Thương">
            <Flame className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Info & Status Bars */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Name, Level, Rank */}
        <div className="flex items-center justify-between gap-1 leading-none">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-extrabold text-xs sm:text-sm text-cyan-200 truncate">
              Hiệp Sĩ Học Sinh
            </span>
            <span className="text-[10px] text-cyan-400/80 font-mono hidden sm:inline truncate">
              • {getTitleRank(level)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {streakCount > 1 && (
              <span className="bg-gradient-to-r from-amber-500 to-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full border border-yellow-300 shadow flex items-center gap-0.5 animate-pulse">
                <Sparkles className="w-2.5 h-2.5" /> x{streakCount}
              </span>
            )}
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
              LV.{level}
            </span>
          </div>
        </div>

        {/* HP Bar */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-bold leading-none mb-0.5">
            <span className="flex items-center gap-1 text-emerald-400">
              <Heart className="w-3 h-3 fill-emerald-400" /> HP
            </span>
            <span className="font-mono text-emerald-300">{playerHp}/{maxHp}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full p-0.5 border border-emerald-500/40">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                hpPercent > 50 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400' 
                  : hpPercent > 20 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-400' 
                    : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* MP Bar */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-bold leading-none mb-0.5">
            <span className="flex items-center gap-1 text-cyan-400">
              <Zap className="w-3 h-3 fill-cyan-400" /> MP
            </span>
            <span className="font-mono text-cyan-300">{playerMp}/{maxMp}</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full p-0.5 border border-cyan-500/40">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${mpPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
