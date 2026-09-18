import React, { useState, useEffect, useRef } from 'react';
import { Horse, Race } from '../types';
import { SilkIcon } from './SilkIcon';
import { soundManager } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Trophy, 
  Flame, 
  Flag, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Zap,
  FastForward
} from 'lucide-react';

interface RaceSimulatorProps {
  race: Race;
  onRaceFinished?: (winnerId: string, placeIds: string[]) => void;
  autoStart?: boolean;
}

interface RunnerState {
  horse: Horse;
  progress: number; // 0 to 100%
  lane: number;
  speed: number;
  stamina: number;
  rank: number;
  finished: boolean;
  finishTime?: number;
}

export const RaceSimulator: React.FC<RaceSimulatorProps> = ({
  race,
  onRaceFinished,
  autoStart = false,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);
  const [commentary, setCommentary] = useState<string>('Horses are loading into the starting gates...');
  const [runners, setRunners] = useState<RunnerState[]>([]);
  const [podium, setPodium] = useState<Horse[]>([]);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const finishOrderRef = useRef<Horse[]>([]);

  // Initialize runners from race horses
  const initRunners = () => {
    const list: RunnerState[] = race.horses.map((horse, idx) => {
      // Lower odds = slightly higher baseline speed & stamina
      const winOdd = horse.win_odds || 4.0;
      const baseSpeed = Math.max(12, 22 - Math.log(winOdd) * 4);
      return {
        horse,
        progress: 0,
        lane: idx + 1,
        speed: baseSpeed + (Math.random() * 3 - 1.5),
        stamina: 80 + Math.random() * 20,
        rank: idx + 1,
        finished: false,
      };
    });
    setRunners(list);
    setIsFinished(false);
    setPodium([]);
    finishOrderRef.current = [];
    setCommentary(`Gate open for ${race.name} at ${race.venue}! (${race.distance})`);
  };

  useEffect(() => {
    initRunners();
  }, [race.id]);

  useEffect(() => {
    if (autoStart && !isRunning && !isFinished) {
      handleStart();
    }
  }, [autoStart]);

  const handleStart = () => {
    if (isFinished) {
      initRunners();
    }
    soundManager.playRaceBugle();
    setIsRunning(true);
    setCommentary('AND THEY ARE OFF! Spectacular break from the stalls!');
    lastTimeRef.current = performance.now();
  };

  const handlePause = () => {
    setIsRunning(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  const handleReset = () => {
    handlePause();
    initRunners();
  };

  // Main Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const commentaryTemplates = [
      (lead: string, chaser?: string) => `${lead} sets a furious pace along the rail!`,
      (lead: string, chaser?: string) => `${chaser || 'The challenger'} challenging on the outside of ${lead}!`,
      (lead: string, chaser?: string) => `Approaching the 400m bend, ${lead} holding a slim lead!`,
      (lead: string, chaser?: string) => `THE HOME STRAIGHT! Jockeys going for the whip!`,
      (lead: string, chaser?: string) => `Neck and neck! ${lead} and ${chaser || 'the field'} digging deep!`,
      (lead: string, chaser?: string) => `${lead} powers toward the wire with unbelievable acceleration!`,
    ];

    let commentaryStep = 0;

    const tick = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setRunners((prevRunners) => {
        let allFinished = true;
        const updated = prevRunners.map((r) => {
          if (r.finished) return r;

          allFinished = false;
          // Fluctuating acceleration / surges
          const surge = (Math.random() - 0.48) * 6;
          // Fatigue near end unless top horse
          const fatigue = r.progress > 75 ? (100 - r.stamina) * 0.05 : 0;
          const currentSpeed = Math.max(8, r.speed + surge - fatigue);

          // Calculate new progress (0 to 100)
          const step = currentSpeed * delta * 1.8 * speedMultiplier;
          const newProgress = Math.min(100, r.progress + step);

          const finishedNow = newProgress >= 100;
          if (finishedNow && !r.finished) {
            finishOrderRef.current.push(r.horse);
          }

          return {
            ...r,
            progress: newProgress,
            finished: finishedNow,
          };
        });

        // Calculate live ranks
        const sorted = [...updated].sort((a, b) => b.progress - a.progress);
        const ranked = updated.map((r) => {
          const rank = sorted.findIndex((s) => s.horse.id === r.horse.id) + 1;
          return { ...r, rank };
        });

        // Dynamic Commentary updates
        const leader = sorted[0]?.horse.name || 'The leader';
        const second = sorted[1]?.horse.name || 'the field';
        const avgProg = sorted.reduce((acc, s) => acc + s.progress, 0) / sorted.length;

        if (avgProg > 20 && commentaryStep === 0) {
          commentaryStep = 1;
          setCommentary(commentaryTemplates[0](leader));
        } else if (avgProg > 40 && commentaryStep === 1) {
          commentaryStep = 2;
          setCommentary(commentaryTemplates[1](leader, second));
        } else if (avgProg > 65 && commentaryStep === 2) {
          commentaryStep = 3;
          setCommentary(commentaryTemplates[2](leader));
        } else if (avgProg > 85 && commentaryStep === 3) {
          commentaryStep = 4;
          setCommentary(commentaryTemplates[3](leader));
        }

        if (allFinished) {
          setIsRunning(false);
          setIsFinished(true);
          const top3 = finishOrderRef.current.slice(0, 3);
          setPodium(top3);
          setCommentary(`🏁 PHOTO FINISH! Winner: #${top3[0]?.horse_no} ${top3[0]?.name}!`);
          soundManager.playWinPayout();
          triggerConfetti();

          if (onRaceFinished && top3.length > 0) {
            onRaceFinished(top3[0].id, top3.slice(1).map((h) => h.id));
          }
        }

        return ranked;
      });

      if (isRunning) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, speedMultiplier]);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-[#0c1322] border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden relative">
      
      {/* Top Controls & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Flame className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Live Turf Visualizer & Simulator
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold uppercase tracking-wider border border-emerald-500/30">
                2D Track
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {race.distance} • {race.going} • {race.horses.length} Runners
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeedMultiplier(speedMultiplier === 1 ? 2 : 1)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
              speedMultiplier === 2 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Simulation Speed"
          >
            <FastForward className="w-3.5 h-3.5" />
            {speedMultiplier}x Speed
          </button>

          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isFinished ? 'Re-Run Race' : 'Start Race'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Commentary Broadcast Ticker */}
      <div className="mb-4 px-3 py-2 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center gap-2.5 shadow-inner">
        <span className="relative flex h-2.5 w-2.5">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 shrink-0">
          DERBY RADIO:
        </span>
        <p className="text-xs font-semibold text-slate-200 truncate">
          {commentary}
        </p>
      </div>

      {/* 2D Turf Course Simulation Canvas Area */}
      <div className="relative rounded-xl border border-emerald-900/60 bg-[#071d13] p-3 sm:p-4 overflow-hidden select-none">
        
        {/* Track Markings & Furlongs */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Distance Markers at Top */}
        <div className="flex justify-between text-[10px] font-mono text-emerald-400/60 pb-1.5 mb-2 border-b border-emerald-800/40">
          <span>START GATES</span>
          <span>800m</span>
          <span>600m</span>
          <span>400m (Turn)</span>
          <span>200m</span>
          <span className="font-bold text-amber-300">FINISH POST 🏁</span>
        </div>

        {/* Finish Line Post Visual */}
        <div className="absolute top-8 bottom-0 right-10 w-1 bg-gradient-to-b from-amber-400 via-white to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] z-10 flex flex-col justify-between items-center py-1">
          <div className="w-3 h-3 bg-amber-400 rounded-full shadow" />
          <div className="w-3 h-3 bg-amber-400 rounded-full shadow" />
        </div>

        {/* Lanes & Running Horses */}
        <div className="space-y-2 relative z-0">
          {runners.map((runner) => {
            const isLeader = runner.rank === 1 && runner.progress > 5 && !isFinished;
            return (
              <div
                key={runner.horse.id}
                className="relative flex items-center h-10 rounded-lg bg-emerald-950/40 border border-emerald-900/40 px-2 group hover:bg-emerald-900/30 transition"
              >
                {/* Lane / Stall Number */}
                <div className="w-6 shrink-0 text-center font-mono font-bold text-xs text-emerald-300">
                  {runner.horse.horse_no}
                </div>

                {/* Track Lane Rail */}
                <div className="relative flex-1 h-full flex items-center mr-10">
                  
                  {/* Progress indicator trail */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-emerald-500/20"
                    style={{ width: `${runner.progress}%` }}
                  />

                  {/* Animated Galloping Horse & Silk */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 flex items-center gap-1.5 z-20"
                    style={{ left: `calc(${runner.progress * 0.92}%)` }}
                  >
                    {/* Running Horse Icon & Silk */}
                    <div className="relative group cursor-pointer flex items-center">
                      <SilkIcon
                        color={runner.horse.silk_color}
                        number={runner.horse.horse_no}
                        size="sm"
                      />
                      <span className="text-base sm:text-lg ml-0.5 filter drop-shadow">
                        🏇
                      </span>

                      {/* Leader Crown Badge */}
                      {isLeader && (
                        <span className="absolute -top-3 left-2 text-xs animate-bounce">
                          👑
                        </span>
                      )}
                    </div>

                    {/* Name Pill */}
                    <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[10px] font-bold text-white shadow">
                      <span className="truncate max-w-[90px]">{runner.horse.name}</span>
                      <span className="text-amber-400 font-mono">#{runner.rank}</span>
                    </div>
                  </div>
                </div>

                {/* Live Odds & Finish Tag */}
                <div className="w-16 shrink-0 text-right">
                  {runner.finished ? (
                    <span className="text-[11px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {runner.rank === 1 ? '🥇 1st' : runner.rank === 2 ? '🥈 2nd' : runner.rank === 3 ? '🥉 3rd' : `${runner.rank}th`}
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {runner.horse.win_odds.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Podium Results Banner when Finished */}
      {isFinished && podium.length > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 border border-amber-500/30 animate-fade-in">
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              Official Race Placement
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* 2nd Place */}
            {podium[1] && (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700">
                <div className="text-lg">🥈</div>
                <div className="text-xs font-bold text-slate-200 truncate mt-1">
                  {podium[1].name}
                </div>
                <div className="text-[10px] text-slate-400">
                  J: {podium[1].jockey}
                </div>
              </div>
            )}

            {/* 1st Place */}
            {podium[0] && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/50 shadow-lg scale-105">
                <div className="text-2xl">🥇</div>
                <div className="text-xs sm:text-sm font-black text-amber-300 truncate mt-1">
                  {podium[0].name}
                </div>
                <div className="text-[11px] font-bold text-emerald-400 font-mono">
                  WINNER ({podium[0].win_odds.toFixed(2)})
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {podium[2] && (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700">
                <div className="text-lg">🥉</div>
                <div className="text-xs font-bold text-slate-200 truncate mt-1">
                  {podium[2].name}
                </div>
                <div className="text-[10px] text-slate-400">
                  J: {podium[2].jockey}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
