import React, { useState } from 'react';
import { 
  Trophy, 
  Coins, 
  Shield, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Layers, 
  Calculator, 
  Clock, 
  AlertCircle,
  TrendingUp,
  MapPin,
  ChevronRight
} from 'lucide-react';

interface HowToPlayRulesProps {
  onGoToLobby: () => void;
  onOpenDeposit: () => void;
}

export const HowToPlayRules: React.FC<HowToPlayRulesProps> = ({
  onGoToLobby,
  onOpenDeposit,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'basics' | 'win_place' | 'exposure' | 'terms'>('basics');
  const [calcStake, setCalcStake] = useState<number>(500);
  const [calcWinOdds, setCalcWinOdds] = useState<number>(3.50);
  const [calcPlaceOdds, setCalcPlaceOdds] = useState<number>(1.65);

  const estimatedWinPayout = Math.round(calcStake * calcWinOdds);
  const estimatedWinProfit = estimatedWinPayout - calcStake;
  const estimatedPlacePayout = Math.round(calcStake * calcPlaceOdds);
  const estimatedPlaceProfit = estimatedPlacePayout - calcStake;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#091510] p-4 sm:p-5 rounded-2xl border border-emerald-900/50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#18160c] border border-[#e5b869]/50 flex items-center justify-center text-[#e5b869]">
              <Trophy className="w-4 h-4 text-[#e5b869]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Official Horse Racing Guide & Rules
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Master WIN & PLACE betting, live multiplier odds, exposure calculations, and exchange rules
          </p>
        </div>

        <button
          onClick={onGoToLobby}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e5b869] hover:from-[#c5a028] hover:to-[#d4af37] text-black font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(229,184,105,0.4)] transition cursor-pointer self-start sm:self-auto"
        >
          <span>Go to Match Lobby</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Rules Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 bg-[#091510] p-1.5 rounded-2xl border border-emerald-900/50 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('basics')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'basics'
              ? 'bg-[#18160c] border border-[#e5b869]/70 text-[#e5b869] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>1. How to Bet (3 Steps)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('win_place')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'win_place'
              ? 'bg-[#18160c] border border-[#e5b869]/70 text-[#e5b869] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-[#e5b869]" />
          <span>2. WIN vs PLACE & Calculator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('exposure')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'exposure'
              ? 'bg-[#18160c] border border-[#e5b869]/70 text-[#e5b869] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>3. Wallet & Exposure Mechanics</span>
        </button>

        <button
          onClick={() => setActiveSubTab('terms')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'terms'
              ? 'bg-[#18160c] border border-[#e5b869]/70 text-[#e5b869] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>4. Race Statuses & FAQs</span>
        </button>
      </div>

      {/* ---------------- SUB-TAB 1: 3-Step Quick Start ---------------- */}
      {activeSubTab === 'basics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
            <span className="text-4xl font-black text-slate-800 absolute top-3 right-4 select-none">
              01
            </span>
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Select a Live Fixture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Navigate to the <strong>Match Lobby</strong> to see active fixtures (e.g. <em>The Star Future Cup</em>, <em>Bangalore Derby</em>). Each race displays distance, track going, time, and verified field runners.
            </p>
          </div>

          <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
            <span className="text-4xl font-black text-slate-800 absolute top-3 right-4 select-none">
              02
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Choose WIN or PLACE</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click any horse's <strong>Win Odds</strong> (e.g. <code>2.50</code>) if you expect 1st place, or <strong>Place Odds</strong> (e.g. <code>1.40</code>) to win if the horse finishes anywhere in the <strong>Top 3</strong>.
            </p>
          </div>

          <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition">
            <span className="text-4xl font-black text-slate-800 absolute top-3 right-4 select-none">
              03
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Instant Auto Settlement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once the official race photo verdict is announced, our automated settlement engine instantly credits payouts directly into your liquid wallet balance.
            </p>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 2: WIN vs PLACE & Interactive Calculator ---------------- */}
      {activeSubTab === 'win_place' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* WIN Card */}
            <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-xs uppercase">
                  WIN Market
                </span>
                <span className="text-xs text-slate-400">Target: <strong>1st Place Only</strong></span>
              </div>
              <h3 className="text-base font-bold text-white">How WIN Bets Work</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your horse must cross the finish line in <strong>first place</strong>. Higher risk yields higher payout multipliers.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs text-amber-300">
                Formula: Payout = Stake × Win Odds
              </div>
            </div>

            {/* PLACE Card */}
            <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase">
                  PLACE Market
                </span>
                <span className="text-xs text-slate-400">Target: <strong>Top 3 Finishers</strong></span>
              </div>
              <h3 className="text-base font-bold text-white">How PLACE Bets Work</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your horse must finish in the <strong>Top 3 (1st, 2nd, or 3rd place)</strong>. Offers significantly higher win probability!
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 font-mono text-xs text-emerald-300">
                Formula: Payout = Stake × Place Odds
              </div>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-white text-base">Interactive Payout Calculator</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Your Stake Amount (₹)</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={calcStake}
                  onChange={(e) => setCalcStake(Math.max(10, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs text-amber-400 font-semibold mb-1">WIN Odds (₹100)</label>
                <input
                  type="number"
                  min="1.05"
                  step="0.05"
                  value={calcWinOdds}
                  onChange={(e) => setCalcWinOdds(Math.max(1.01, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs text-emerald-400 font-semibold mb-1">PLACE Odds (₹100)</label>
                <input
                  type="number"
                  min="1.02"
                  step="0.05"
                  value={calcPlaceOdds}
                  onChange={(e) => setCalcPlaceOdds(Math.max(1.01, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Payout Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">If Horse Wins (1st):</span>
                <p className="text-xl font-black text-amber-400 font-mono">₹{estimatedWinPayout.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-400">Net Profit: <strong className="text-emerald-400">+₹{estimatedWinProfit.toLocaleString('en-IN')}</strong></p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">If Horse Places (Top 3):</span>
                <p className="text-xl font-black text-emerald-400 font-mono">₹{estimatedPlacePayout.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-400">Net Profit: <strong className="text-emerald-400">+₹{estimatedPlaceProfit.toLocaleString('en-IN')}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 3: Exposure & Wallet ---------------- */}
      {activeSubTab === 'exposure' && (
        <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">Understanding Balance vs Active Exposure</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                Liquid Balance
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Your available funds ready for withdrawal or placing new wagers on any open market.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                Active Exposure
              </h4>
              <p className="text-slate-400 leading-relaxed">
                When you place a bet, your stake is safely locked in <strong>Exposure</strong> until the race results. Once resulted, the full winnings (stake + profit) are credited back instantly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 4: FAQs & Official Rules ---------------- */}
      {activeSubTab === 'terms' && (
        <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Official Rules & Status Guide</h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <p className="font-bold text-emerald-400">🟢 OPEN (Live Betting)</p>
              <p className="text-slate-400">Markets are live and open for all punters. Multiplier odds update in real time.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <p className="font-bold text-amber-400">🔒 CLOSED (Underway)</p>
              <p className="text-slate-400">Horses have entered the gate or race is in progress. Betting is locked.</p>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <p className="font-bold text-blue-400">🏆 RESULTED (Official Verdict)</p>
              <p className="text-slate-400">Winning horses are officially confirmed by turf stewards. Winnings are auto-settled and credited instantly.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
