import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/soundEffects';
import { 
  Zap, 
  HelpCircle, 
  ShieldCheck, 
  Flame, 
  Heart, 
  AlertCircle, 
  Sparkles, 
  Swords, 
  BookOpen,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function BattleArena({
  stage,
  playerHp,
  playerMp,
  onAnswer,
  onUseSkill,
  streakCount,
  activeShield,
  doubleDamage,
  eliminatedIndexes,
  clueProvided,
  shuffleKey
}) {
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showClue, setShowClue] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState(null);
  const [slashVfx, setSlashVfx] = useState(false);
  const [praiseText, setPraiseText] = useState('');

  const getPraiseText = (streak) => {
    if (streak >= 5) return '🔥 BÁ ĐẠO SỬ ĐỊA!';
    if (streak >= 4) return '⚡ HÀO KHÍ THĂNG HOA!';
    if (streak >= 3) return '🌟 SIÊU XUẤT SẮC!';
    if (streak >= 2) return '✨ THÁNH ÔN THI!';
    return '🎯 CHÍNH XÁC!';
  };

  useEffect(() => {
    if (!stage) return;
    const mapped = stage.options.map((optText, index) => ({
      text: optText,
      originalIndex: index,
      isCorrect: index === stage.correct_index
    }));

    const shuffled = [...mapped];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setShuffledOptions(shuffled);
    setSelectedOption(null);
    setShowClue(false);
  }, [stage?.stage_id, shuffleKey]);

  if (!stage) return null;

  const handleOptionClick = (option) => {
    if (selectedOption !== null) return;
    if (eliminatedIndexes.includes(option.originalIndex)) return;

    setSelectedOption(option.originalIndex);

    if (option.isCorrect) {
      setSlashVfx(true);
      setFloatingDamage(`-${stage.boss_hp} HP! CRITICAL HIT!`);
      setPraiseText(getPraiseText(streakCount + 1));

      setTimeout(() => {
        setSlashVfx(false);
        setFloatingDamage(null);
        onAnswer(true, option.originalIndex);
      }, 1000);
    } else {
      soundFx.playWrong();
      if (!activeShield) {
        setShowClue(true);
      }
      setTimeout(() => {
        onAnswer(false, option.originalIndex);
      }, activeShield ? 600 : 1200);
    }
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col justify-between gap-2 max-w-5xl mx-auto w-full">
      {/* Visual Slash & Floating Text Overlay */}
      {slashVfx && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="text-red-500 font-black text-5xl sm:text-7xl transform -rotate-12 animate-slash filter drop-shadow-[0_0_20px_rgba(255,0,0,0.9)]">
            ⚔️ CRITICAL SLASH!
          </div>
        </div>
      )}

      {floatingDamage && (
        <div className="absolute top-2 right-4 z-50 pointer-events-none animate-floatDamage">
          <span className="font-mono font-black text-2xl sm:text-3xl text-yellow-300 drop-shadow-[0_0_12px_rgba(255,215,0,1)] bg-slate-950/90 px-3 py-1 rounded-xl border border-yellow-400">
            {floatingDamage}
          </span>
        </div>
      )}

      {/* Active Battle Skills Bar (Compact Row) */}
      <div className="shrink-0 bg-slate-900/90 rounded-xl px-2.5 py-1 border border-indigo-500/40 shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-300 uppercase tracking-wider shrink-0">
          <Swords className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Tuyệt Chiêu:</span>
        </div>

        <div className="flex items-center gap-1.5 justify-end w-full sm:w-auto">
          {/* Skill 1: 50/50 */}
          <button
            onClick={() => onUseSkill('5050')}
            disabled={playerMp < 20 || eliminatedIndexes.length > 0}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed border border-blue-400/40 text-blue-200 shadow transition active:scale-95"
            title="Loại bỏ 2 đáp án sai (Tốn 20 MP)"
          >
            <HelpCircle className="w-3 h-3 text-cyan-300" />
            <span>50/50</span>
            <span className="text-[9px] bg-slate-950 px-1 rounded text-cyan-400 font-mono">20MP</span>
          </button>

          {/* Skill 2: Shield */}
          <button
            onClick={() => onUseSkill('shield')}
            disabled={playerMp < 30 || activeShield}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-cyan-900 to-teal-900 hover:from-cyan-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-400/40 text-cyan-200 shadow transition active:scale-95"
            title="Né 1 câu trả lời sai (Tốn 30 MP)"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            <span>Khiên Né</span>
            <span className="text-[9px] bg-slate-950 px-1 rounded text-cyan-400 font-mono">30MP</span>
          </button>

          {/* Skill 3: Critical Strike */}
          <button
            onClick={() => onUseSkill('doubleDamage')}
            disabled={playerMp < 40 || doubleDamage}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-amber-900 to-red-900 hover:from-amber-700 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-400/40 text-amber-200 shadow transition active:scale-95"
            title="Gấp đôi sát thương (Tốn 40 MP)"
          >
            <Flame className="w-3 h-3 text-yellow-300" />
            <span>Hỏa Công</span>
            <span className="text-[9px] bg-slate-950 px-1 rounded text-yellow-400 font-mono">40MP</span>
          </button>

          {/* Skill 4: Heal HP */}
          <button
            onClick={() => onUseSkill('heal')}
            disabled={playerMp < 25 || playerHp >= 100}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-gradient-to-r from-emerald-900 to-green-900 hover:from-emerald-700 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-400/40 text-emerald-200 shadow transition active:scale-95"
            title="Hồi 30 Sinh Lực HP (Tốn 25 MP)"
          >
            <Heart className="w-3 h-3 text-emerald-300" />
            <span>+30 HP</span>
            <span className="text-[9px] bg-slate-950 px-1 rounded text-emerald-400 font-mono">25MP</span>
          </button>
        </div>
      </div>

      {/* Central Question & Answer Arena Card */}
      <div className="flex-1 min-h-0 relative bg-slate-900/95 rounded-2xl p-3 sm:p-4 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col justify-between">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Stage Header Line */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-xs">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <span className="font-extrabold text-xs sm:text-sm text-cyan-300 truncate">
              MÀN {stage.stage_id}: {stage.stage_title}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 shrink-0">
            <span>Thưởng:</span>
            <span className="text-yellow-300 font-bold">{stage.reward_skill}</span>
          </div>
        </div>

        {/* Question Text Box (Center Focus) */}
        <div className="my-2 flex-1 min-h-0 flex items-center bg-slate-950/90 p-3 sm:p-4 rounded-xl border border-indigo-500/40 text-slate-100 font-semibold text-sm sm:text-base leading-relaxed shadow-inner overflow-y-auto">
          <div>
            <span className="text-cyan-400 font-black mr-2 bg-cyan-950/80 px-2 py-0.5 rounded text-xs border border-cyan-500/30">
              CÂU HỎI
            </span>
            {stage.question}
          </div>
        </div>

        {/* 4 Shuffled Answer Options (2x2 Grid, min-h-[46px] to 52px) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
          {shuffledOptions.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D
            const isEliminated = eliminatedIndexes.includes(option.originalIndex);
            const isChosen = selectedOption === option.originalIndex;
            
            let btnStyle = "bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-slate-700/90 hover:border-cyan-400 hover:text-white";
            
            if (selectedOption !== null) {
              if (option.isCorrect) {
                btnStyle = "bg-emerald-950/95 border-emerald-400 text-emerald-100 font-bold box-glow-cyan";
              } else if (isChosen) {
                btnStyle = "bg-red-950/95 border-red-500 text-red-100 animate-pulse font-bold";
              } else {
                btnStyle = "bg-slate-900/60 border-slate-800 text-slate-500 opacity-40";
              }
            } else if (isEliminated) {
              btnStyle = "bg-slate-950/40 border-slate-800 text-slate-600 line-through opacity-30 cursor-not-allowed";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null || isEliminated}
                className={`relative flex items-center gap-2.5 px-3 py-2 min-h-[46px] sm:min-h-[50px] rounded-xl border-2 text-left transition-all duration-150 shadow-md ${btnStyle} active:scale-[0.99] touch-manipulation`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 border ${
                  selectedOption !== null && option.isCorrect
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                    : selectedOption !== null && isChosen
                    ? 'bg-red-600 text-white border-red-300'
                    : 'bg-slate-950 text-cyan-400 border-cyan-500/40'
                }`}>
                  {letter}
                </span>

                <span className="font-sans text-xs sm:text-sm font-medium leading-snug flex-1 line-clamp-2">
                  {option.text}
                </span>

                {selectedOption !== null && option.isCorrect && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                {selectedOption !== null && isChosen && !option.isCorrect && (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Clue popup if wrong answer */}
        {showClue && (
          <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-red-950/95 via-slate-900 to-amber-950/95 border border-red-500/60 shadow-lg animate-flashRed text-slate-200 shrink-0">
            <div className="flex items-center gap-1.5 text-red-400 font-extrabold text-xs uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
              <span>BÍ KÍP ÔN THI:</span>
            </div>
            <p className="text-[11px] sm:text-xs leading-tight text-amber-200 font-medium">
              💡 {stage.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
