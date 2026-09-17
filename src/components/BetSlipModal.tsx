import React, { useState, useEffect } from 'react';
import { BetSlipState, User } from '../types';
import { SilkIcon } from './SilkIcon';
import { OddsFormat, formatOdds } from '../utils/odds';
import { soundManager } from '../utils/audio';
import { 
  X, 
  Wallet, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface BetSlipModalProps {
  betSlip: BetSlipState | null;
  user: User | null;
  onClose: () => void;
  onSubmitBet: (params: {
    race_id: string;
    horse_id: string;
    bet_type: 'WIN' | 'PLACE';
    odds: number;
    stake: number;
  }) => Promise<void>;
  onOpenDeposit: () => void;
  oddsFormat?: OddsFormat;
}

export const BetSlipModal: React.FC<BetSlipModalProps> = ({
  betSlip,
  user,
  onClose,
  onSubmitBet,
  onOpenDeposit,
  oddsFormat = 'DECIMAL',
}) => {
  if (!betSlip) return null;

  const [stake, setStake] = useState<number>(500);
  const [betType, setBetType] = useState<'WIN' | 'PLACE'>(betSlip.bet_type);
  const [currentOdds, setCurrentOdds] = useState<number>(betSlip.odds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [progress, setProgress] = useState<number>(0);
  const [stepText, setStepText] = useState<string>('Verifying market liquidity...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBetType(betSlip.bet_type);
    setCurrentOdds(betSlip.bet_type === 'WIN' ? betSlip.horse.win_odds : betSlip.horse.place_odds);
    setStake(500);
    setError(null);
    setIsSubmitting(false);
    setCountdown(3);
    setProgress(0);
  }, [betSlip]);

  const handleTypeToggle = (type: 'WIN' | 'PLACE') => {
    soundManager.playClick();
    setBetType(type);
    setCurrentOdds(type === 'WIN' ? betSlip.horse.win_odds : betSlip.horse.place_odds);
    setError(null);
  };

  const userBalance = user?.balance ?? 0;
  const potentialPayout = Math.round(stake * currentOdds);
  const netProfit = Math.max(0, potentialPayout - stake);
  const isInsufficientBalance = stake > userBalance;

  const quickStakes = [100, 250, 500, 1000, 2500, 5000];

  const handlePlaceBet = async () => {
    if (stake <= 0) {
      setError('Please enter a valid stake amount (min ₹10)');
      return;
    }
    if (isInsufficientBalance) {
      setError(`Insufficient balance. Current balance is ₹${userBalance.toLocaleString()}`);
      return;
    }
    if (betSlip.race.status === 'CLOSED') {
      setError('This race is currently closed / running.');
      return;
    }
    if (betSlip.race.status === 'RESULTED') {
      setError('This race has already resulted. Payouts have been distributed.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setCountdown(3);
      setProgress(10);
      setStepText('Connecting to Turf Exchange...');

      // 3-second realistic betting delay simulation with countdown updates
      await new Promise<void>((resolve, reject) => {
        let elapsed = 0;
        const totalTime = 3000;
        const intervalTime = 100;

        const timer = setInterval(() => {
          elapsed += intervalTime;
          const currentProgress = Math.min(100, Math.round((elapsed / totalTime) * 100));
          setProgress(currentProgress);

          const remainingSeconds = Math.max(1, Math.ceil((totalTime - elapsed) / 1000));
          setCountdown(remainingSeconds);

          if (elapsed < 1000) {
            setStepText('Checking market liquidity & odds stability...');
          } else if (elapsed < 2000) {
            setStepText(`Locking ${betType} odds at ${currentOdds.toFixed(2)}...`);
          } else {
            setStepText('Registering ticket on blockchain ledger...');
          }

          if (elapsed >= totalTime) {
            clearInterval(timer);
            resolve();
          }
        }, intervalTime);
      });

      // Submit bet after 3-second delay
      await onSubmitBet({
        race_id: betSlip.race.id,
        horse_id: betSlip.horse.id,
        bet_type: betType,
        odds: currentOdds,
        stake,
      });

      soundManager.playBetPlaced();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to place bet');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#091510] border-2 border-emerald-500/70 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 3-Second Processing Overlay when submitting */}
        {isSubmitting && (
          <div className="absolute inset-0 z-30 bg-[#040e08]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-150">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-emerald-950"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-emerald-400 transition-all duration-100 ease-linear"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-2xl font-black text-white">{countdown}s</span>
                <span className="text-[9px] uppercase font-bold text-emerald-400">Delay</span>
              </div>
            </div>

            <div className="space-y-1 max-w-xs">
              <h4 className="text-base font-black text-white flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Matching Bet with Exchange...
              </h4>
              <p className="text-xs text-emerald-300/80 font-mono animate-pulse">
                {stepText}
              </p>
            </div>

            <div className="w-full max-w-xs bg-slate-900 rounded-full h-2 overflow-hidden border border-emerald-900">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-[#e5b869] h-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-400">
              Securing stake of <strong className="text-white font-mono">₹{stake.toLocaleString()}</strong> on #{betSlip.horse.horse_no} {betSlip.horse.name}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-extrabold text-white text-base tracking-tight">Interactive Bet Slip</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-amber-400 font-mono font-bold border border-slate-700">
              {betSlip.race.venue}
            </span>
          </div>
          <button
            id="close-betslip-btn"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Race & Horse Selection Card */}
          <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-2.5 shadow-inner">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="font-semibold text-slate-300">{betSlip.race.name}</span>
              <span className="text-amber-400 font-mono font-bold">{betSlip.race.race_time}</span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <SilkIcon
                  color={betSlip.horse.silk_color}
                  number={betSlip.horse.horse_no}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-400 font-mono">#{betSlip.horse.horse_no}</span>
                    <h4 className="font-bold text-white text-sm sm:text-base">{betSlip.horse.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Jockey: <strong className="text-slate-300">{betSlip.horse.jockey}</strong>
                  </p>
                </div>
              </div>

              {/* Locked Odds Display */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Locked Odds</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {formatOdds(currentOdds, oddsFormat)}
                </span>
              </div>
            </div>
          </div>

          {/* Bet Type Selector: WIN vs PLACE */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Bet Market
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="betslip-win-type-btn"
                onClick={() => handleTypeToggle('WIN')}
                className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm border transition flex flex-col items-center cursor-pointer ${
                  betType === 'WIN'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>WIN (1st Only)</span>
                <span className="text-[11px] font-mono font-bold opacity-90">
                  {formatOdds(betSlip.horse.win_odds, oddsFormat)}
                </span>
              </button>

              <button
                type="button"
                id="betslip-place-type-btn"
                onClick={() => handleTypeToggle('PLACE')}
                className={`py-3 px-3 rounded-2xl font-black text-xs sm:text-sm border transition flex flex-col items-center cursor-pointer ${
                  betType === 'PLACE'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>PLACE (Top 3)</span>
                <span className="text-[11px] font-mono font-bold opacity-90">
                  {formatOdds(betSlip.horse.place_odds, oddsFormat)}
                </span>
              </button>
            </div>
          </div>

          {/* Stake Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300 uppercase tracking-wider">
                Stake Amount (₹)
              </label>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Available:</span>
                <strong className="text-white font-mono">₹{userBalance.toLocaleString()}</strong>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">
                ₹
              </span>
              <input
                id="betslip-stake-input"
                type="number"
                min="10"
                step="50"
                value={stake || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setStake(val);
                  setError(null);
                }}
                className={`w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-950 border text-xl font-black text-white font-mono focus:outline-none transition shadow-inner ${
                  isInsufficientBalance
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-800 focus:border-amber-500'
                }`}
                placeholder="Enter stake amount"
              />
            </div>

            {/* Quick Stake Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {quickStakes.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  id={`stake-chip-${amt}`}
                  onClick={() => {
                    soundManager.playChip();
                    setStake(amt);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border transition cursor-pointer ${
                    stake === amt
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
              {userBalance > 0 && (
                <button
                  type="button"
                  id="stake-chip-max"
                  onClick={() => {
                    soundManager.playChip();
                    setStake(userBalance);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold font-mono border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer"
                >
                  MAX (₹{userBalance})
                </button>
              )}
            </div>
          </div>

          {/* Insufficient balance warning / Deposit prompt */}
          {isInsufficientBalance && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Insufficient balance for this stake</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onOpenDeposit();
                }}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition text-[11px] whitespace-nowrap cursor-pointer"
              >
                Deposit
              </button>
            </div>
          )}

          {/* Potential Return Summary Card */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Stake:</span>
              <span className="text-white font-mono font-bold">₹{stake.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Net Profit:</span>
              <span className="text-emerald-400 font-mono font-bold">+₹{netProfit.toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-800/80 my-1" />
            <div className="flex items-center justify-between text-sm sm:text-base">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Total Return:
              </span>
              <span className="font-black text-emerald-400 font-mono text-lg sm:text-xl">
                ₹{potentialPayout.toLocaleString()}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="p-5 bg-slate-950 border-t border-slate-800">
          <button
            id="confirm-place-bet-btn"
            type="button"
            disabled={isSubmitting || isInsufficientBalance || stake <= 0}
            onClick={handlePlaceBet}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
              isSubmitting || isInsufficientBalance || stake <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-amber-500/25 active:scale-95 cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Confirming Order...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Place Bet • ₹{stake.toLocaleString()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
