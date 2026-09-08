import React from 'react';
import { Skull, Flame, Snowflake, ShieldAlert } from 'lucide-react';

export default function BossCard({ 
  bossName, 
  currentBossHp, 
  maxBossHp, 
  stageId,
  isHit,
  stageTitle
}) {
  const isHistory = stageId <= 20; // 1-20 History, 21-40 Geography
  const hpPercent = Math.max(0, Math.min(100, Math.floor((currentBossHp / maxBossHp) * 100)));

  const getBossEmoji = (name) => {
    if (name.includes('Pháp') || name.includes('Rơ-ve') || name.includes('Đờ Ca-xtơ-ri')) return '🕵️‍♂️';
    if (name.includes('Nhật')) return '🥷';
    if (name.includes('Mỹ') || name.includes('Thiết Sa')) return '🤖';
    if (name.includes('B-52')) return '✈️';
    if (name.includes('Pôn Pốt')) return '👹';
    if (name.includes('Fansipan') || name.includes('Sương Giá')) return '🏔️';
    if (name.includes('Thủy Quái') || name.includes('Sông')) return '🐉';
    if (name.includes('Hắc Long') || name.includes('Quảng Ninh')) return '🐉';
    if (name.includes('Gió Tây Nam') || name.includes('Viêm Ma')) return '🔥';
    if (name.includes('Thạch Nhũ')) return '🗿';
    if (name.includes('Hải Tặc')) return '🏴‍☠️';
    if (name.includes('Mãng Xà')) return '🐍';
    if (name.includes('Đô Thị')) return '🏙️';
    if (name.includes('Xâm Nhập Mặn') || name.includes('Đại Ma Vương')) return '👾';
    return '👺';
  };

  return (
    <div className={`relative bg-slate-900/90 rounded-xl p-2.5 sm:p-3 border transition-all duration-300 shadow-lg overflow-hidden flex items-center gap-3 ${
      isHistory 
        ? 'border-red-500/50 shadow-red-950/60' 
        : 'border-blue-500/50 shadow-blue-950/60'
    } ${isHit ? 'animate-shake filter brightness-125' : ''}`}>
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none ${
        isHistory ? 'bg-red-500/10' : 'bg-blue-500/10'
      }`} />

      {/* Boss Avatar */}
      <div className="relative shrink-0">
        <div className={`absolute -inset-1 rounded-full blur-xs opacity-75 animate-pulse ${
          isHistory ? 'bg-gradient-to-r from-red-600 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-blue-600'
        }`} />
        <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-950 border flex items-center justify-center text-2xl shadow-inner ${
          isHistory ? 'border-red-400' : 'border-cyan-400'
        }`}>
          {getBossEmoji(bossName)}
        </div>
        <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-0.5 rounded-full border border-slate-900 shadow">
          <Skull className="w-3 h-3" />
        </div>
      </div>

      {/* Info & Status Bar */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-1 leading-none">
          <div className="flex items-center gap-1.5 truncate">
            <h3 className={`font-extrabold text-xs sm:text-sm truncate ${
              isHistory ? 'text-red-300' : 'text-cyan-200'
            }`}>
              {bossName}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline truncate">
              • {stageTitle}
            </span>
          </div>

          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-wider flex items-center gap-0.5 shrink-0 ${
            isHistory ? 'bg-gradient-to-r from-red-600 to-amber-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600'
          }`}>
            {isHistory ? <Flame className="w-2.5 h-2.5" /> : <Snowflake className="w-2.5 h-2.5" />}
            {isHistory ? 'LỊCH SỬ' : 'ĐỊA LÝ'}
          </span>
        </div>

        {/* Boss HP Bar */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-extrabold leading-none mb-0.5">
            <span className="flex items-center gap-1 text-red-400">
              <ShieldAlert className="w-3 h-3" /> BOSS HP
            </span>
            <span className="font-mono text-red-300">{currentBossHp} / {maxBossHp}</span>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full p-0.5 border border-red-500/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-950/50" />
            <div 
              className={`h-full rounded-full transition-all duration-300 relative ${
                isHistory 
                  ? 'bg-gradient-to-r from-orange-600 via-red-600 to-rose-500' 
                  : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-400'
              }`}
              style={{ width: `${hpPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
