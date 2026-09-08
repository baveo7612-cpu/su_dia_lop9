import React, { useState, useEffect } from 'react';
import stagesData from './data/stages.json';
import { soundFx } from './utils/soundEffects';
import Navbar from './components/Navbar';
import PlayerCard from './components/PlayerCard';
import BossCard from './components/BossCard';
import BattleArena from './components/BattleArena';
import SkillInventoryModal from './components/SkillInventoryModal';
import StageMapModal from './components/StageMapModal';
import VictoryModal from './components/VictoryModal';
import DefeatModal from './components/DefeatModal';
import TeacherLectureModal from './components/TeacherLectureModal';

export default function App() {
  // Load saved progress from LocalStorage
  const loadSaved = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`su_dia_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentStageId, setCurrentStageId] = useState(() => loadSaved('currentStageId', 1));
  const [clearedStages, setClearedStages] = useState(() => loadSaved('clearedStages', []));
  const [unlockedSkills, setUnlockedSkills] = useState(() => loadSaved('unlockedSkills', []));
  const [playerLevel, setPlayerLevel] = useState(() => loadSaved('playerLevel', 1));
  const [playerExp, setPlayerExp] = useState(() => loadSaved('playerExp', 0));
  const [isMuted, setIsMuted] = useState(false);

  // Active Combat State
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMp, setPlayerMp] = useState(100);
  const [currentBossHp, setCurrentBossHp] = useState(100);
  const [streakCount, setStreakCount] = useState(0);

  // Skill Buff State
  const [activeShield, setActiveShield] = useState(false);
  const [doubleDamage, setDoubleDamage] = useState(false);
  const [eliminatedIndexes, setEliminatedIndexes] = useState([]);
  const [shuffleKey, setShuffleKey] = useState(0);

  // Modals & Visual Effects State
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [isDefeatOpen, setIsDefeatOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [bossIsHit, setBossIsHit] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Current Stage Object
  const stage = stagesData.find(s => s.stage_id === currentStageId) || stagesData[0];
  const maxExp = playerLevel * 100;

  // Initialize Stage HP & Reset Transient Combat State when Stage changes
  useEffect(() => {
    if (stage) {
      setCurrentBossHp(stage.boss_hp);
      setEliminatedIndexes([]);
      setActiveShield(false);
      setDoubleDamage(false);
    }
  }, [currentStageId]);

  // Save Progress to LocalStorage
  useEffect(() => {
    localStorage.setItem('su_dia_currentStageId', JSON.stringify(currentStageId));
    localStorage.setItem('su_dia_clearedStages', JSON.stringify(clearedStages));
    localStorage.setItem('su_dia_unlockedSkills', JSON.stringify(unlockedSkills));
    localStorage.setItem('su_dia_playerLevel', JSON.stringify(playerLevel));
    localStorage.setItem('su_dia_playerExp', JSON.stringify(playerExp));
  }, [currentStageId, clearedStages, unlockedSkills, playerLevel, playerExp]);

  // Handle Option Answer (Correct or Wrong)
  const handleAnswer = (isCorrect, chosenIndex) => {
    if (isCorrect) {
      soundFx.playSlash();

      // Critical Hit reduces Boss HP to 0 immediately!
      setCurrentBossHp(0);
      setBossIsHit(true);
      setScreenShake(true);

      setTimeout(() => {
        setBossIsHit(false);
        setScreenShake(false);
      }, 400);

      // Streak Increment & Sound
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      soundFx.playCorrect(newStreak);

      // EXP & MP Gain
      const newExp = playerExp + 100;
      if (newExp >= maxExp) {
        setPlayerLevel(prev => prev + 1);
        setPlayerExp(newExp - maxExp);
      } else {
        setPlayerExp(newExp);
      }

      setPlayerMp(prev => Math.min(100, prev + 15));
      setDoubleDamage(false);

      // Unlock stage & skill rewards
      if (!clearedStages.includes(stage.stage_id)) {
        setClearedStages(prev => [...prev, stage.stage_id]);
      }
      if (!unlockedSkills.includes(stage.reward_skill)) {
        setUnlockedSkills(prev => [...prev, stage.reward_skill]);
      }

      setPlayerHp(prev => Math.min(100, prev + 20));
      setPlayerMp(prev => Math.min(100, prev + 50));

      // Open Victory Modal after slash VFX
      setTimeout(() => {
        setIsVictoryOpen(true);
      }, 1000);
    } else {
      // Wrong Answer -> Deduct 20 HP & Trigger Teacher Lecture Modal
      setStreakCount(0);

      if (activeShield) {
        // Shield absorbs the hit!
        setActiveShield(false);
        soundFx.playClick();
      } else {
        // Deduct 20 HP
        const newHp = Math.max(0, playerHp - 20);
        setPlayerHp(newHp);

        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 400);

        if (newHp <= 0) {
          setIsDefeatOpen(true);
        } else {
          // Open AI Teacher Lecture Modal
          setTimeout(() => {
            setIsTeacherModalOpen(true);
          }, 600);
        }
      }
    }
  };

  // Handle Teacher Retry (Reshuffle options & reset question state)
  const handleTeacherRetry = () => {
    setIsTeacherModalOpen(false);
    setShuffleKey(prev => prev + 1);
  };

  // Handle Teacher Skip Next Stage
  const handleTeacherSkipNext = () => {
    setIsTeacherModalOpen(false);
    if (currentStageId < stagesData.length) {
      setCurrentStageId(prev => prev + 1);
    }
  };

  // Handle Using Active Battle Skills
  const handleUseSkill = (skillType) => {
    soundFx.playSkill();

    if (skillType === '5050') {
      if (playerMp < 20) return;
      setPlayerMp(prev => prev - 20);

      const wrongIndexes = stage.options
        .map((_, idx) => idx)
        .filter(idx => idx !== stage.correct_index);

      const shuffledWrong = wrongIndexes.sort(() => 0.5 - Math.random()).slice(0, 2);
      setEliminatedIndexes(shuffledWrong);
    } 
    else if (skillType === 'shield') {
      if (playerMp < 30) return;
      setPlayerMp(prev => prev - 30);
      setActiveShield(true);
    } 
    else if (skillType === 'doubleDamage') {
      if (playerMp < 40) return;
      setPlayerMp(prev => prev - 40);
      setDoubleDamage(true);
    } 
    else if (skillType === 'heal') {
      if (playerMp < 25) return;
      setPlayerMp(prev => prev - 25);
      setPlayerHp(prev => Math.min(100, prev + 30));
    }
  };

  // Next Stage Transition
  const handleNextStage = () => {
    setIsVictoryOpen(false);
    if (currentStageId < stagesData.length) {
      setCurrentStageId(prev => prev + 1);
    }
  };

  // Retry Current Stage
  const handleRetryStage = () => {
    setIsDefeatOpen(false);
    setPlayerHp(100);
    setPlayerMp(100);
    setCurrentBossHp(stage.boss_hp);
    setStreakCount(0);
  };

  // Select Stage from Map
  const handleSelectStage = (stageId) => {
    setCurrentStageId(stageId);
    setPlayerHp(100);
    setPlayerMp(100);
    setStreakCount(0);
  };

  // Reset Entire Game Progress
  const handleResetProgress = () => {
    localStorage.clear();
    setCurrentStageId(1);
    setClearedStages([]);
    setUnlockedSkills([]);
    setPlayerLevel(1);
    setPlayerExp(0);
    setPlayerHp(100);
    setPlayerMp(100);
    setCurrentBossHp(stagesData[0].boss_hp);
    setStreakCount(0);
  };

  return (
    <div className={`h-screen h-dvh max-h-screen max-h-dvh overflow-hidden bg-slate-950 text-slate-100 font-sans scanline bg-pixel-grid flex flex-col justify-between ${
      screenShake ? 'animate-shake' : ''
    }`}>
      {/* Top Header Navbar */}
      <Navbar
        currentStageId={currentStageId}
        totalStages={stagesData.length}
        playerLevel={playerLevel}
        playerExp={playerExp}
        maxExp={maxExp}
        unlockedSkillsCount={unlockedSkills.length}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(soundFx.toggleMute())}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onResetProgress={handleResetProgress}
      />

      {/* Main RPG Battle Area (Above-the-fold, Zero Scroll) */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-2 w-full flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
        {/* Top Compact Split: Student Hero (Left) vs Boss Hologram (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 shrink-0">
          <PlayerCard
            playerHp={playerHp}
            maxHp={100}
            playerMp={playerMp}
            maxMp={100}
            level={playerLevel}
            streakCount={streakCount}
            activeShield={activeShield}
            doubleDamage={doubleDamage}
          />

          <BossCard
            bossName={stage.boss_name}
            currentBossHp={currentBossHp}
            maxBossHp={stage.boss_hp}
            stageId={stage.stage_id}
            isHit={bossIsHit}
            stageTitle={stage.stage_title}
          />
        </div>

        {/* Central Question & Skill Arena */}
        <BattleArena
          stage={stage}
          playerHp={playerHp}
          playerMp={playerMp}
          onAnswer={handleAnswer}
          onUseSkill={handleUseSkill}
          streakCount={streakCount}
          activeShield={activeShield}
          doubleDamage={doubleDamage}
          eliminatedIndexes={eliminatedIndexes}
          shuffleKey={shuffleKey}
        />
      </main>

      {/* Footer Branding */}
      <footer className="shrink-0 bg-slate-950 border-t border-slate-800/80 py-1 text-center text-[10px] sm:text-xs text-slate-500 font-mono">
        <p>🎮 SỬ ĐỊA CHIẾN KỶ: MẬT MÃ THI VÀO 10 • Web Game RPG Ôn Thi Chuyển Cấp Lớp 9</p>
      </footer>

      {/* Modals */}
      <SkillInventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        unlockedSkills={unlockedSkills}
        allStages={stagesData}
      />

      <StageMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        allStages={stagesData}
        currentStageId={currentStageId}
        clearedStages={clearedStages}
        onSelectStage={handleSelectStage}
      />

      <TeacherLectureModal
        isOpen={isTeacherModalOpen}
        stage={stage}
        onRetry={handleTeacherRetry}
        onSkipNext={handleTeacherSkipNext}
      />

      <VictoryModal
        isOpen={isVictoryOpen}
        stage={stage}
        onNextStage={handleNextStage}
        onOpenInventory={() => {
          setIsVictoryOpen(false);
          setIsInventoryOpen(true);
        }}
        isFinalStage={currentStageId === stagesData.length}
      />

      <DefeatModal
        isOpen={isDefeatOpen}
        stage={stage}
        onRetry={handleRetryStage}
        onOpenMap={() => {
          setIsDefeatOpen(false);
          setIsMapOpen(true);
        }}
      />
    </div>
  );
}
