import React, { useState } from 'react';
import { Bet, BetType, Horse, Race } from '../types';
import { SilkIcon } from './SilkIcon';
import { RaceSimulator } from './RaceSimulator';
import { OddsFormat, formatOdds } from '../utils/odds';
import { soundManager } from '../utils/audio';
import { 
  ArrowLeft, 
  Heart, 
  Search, 
  Clock, 
  MapPin, 
  Trophy, 
  Star, 
  Sparkles, 
  Play, 
  Flame, 
  Layers, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Info,
  DollarSign
} from 'lucide-react';

interface RaceDetailProps {
  race: Race;
  onBack: () => void;
  onSelectBet: (horse: Horse, betType: BetType, odds: number) => void;
  userBetsForRace: Bet[];
  onOpenMyBets: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  oddsFormat?: OddsFormat;
}

export const RaceDetail: React.FC<RaceDetailProps> = ({
  race,
  onBack,
  onSelectBet,
  userBetsForRace,
  onOpenMyBets,
  onOpenAuth,
  isLoggedIn,
  oddsFormat = 'DECIMAL',
}) => {
  const [activeTab, setActiveTab] = useState<'runners' | 'simulator' | 'insights' | 'mybets'>('runners');
  const [isFavorite, setIsFavorite] = useState(false);

  const winnerHorse = race.winner_horse_id
    ? race.horses.find((h) => h.id === race.winner_horse_id)
    : null;

  const placeHorses = race.place_horses_ids
    ? race.place_horses_ids
        .map((id) => race.horses.find((h) => h.id === id))
        .filter(Boolean) as Horse[]
    : [];

  const isOpen = race.status === 'OPEN';

  const handleOddsClick = (horse: Horse, betType: BetType, odds: number) => {
    soundManager.playChip();
    if (!isLoggedIn) {
      onOpenAuth();
      return;
    }
    onSelectBet(horse, betType, odds);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* ---------------- TOP BAR NAVIGATION ---------------- */}
      <div className="flex items-center justify-between gap-3">
        <button
          id="back-to-races-btn"
          onClick={() => {
            soundManager.playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs sm:text-sm font-bold transition shadow cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Races</span>
        </button>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          {race.status === 'OPEN' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Betting Open
            </span>
          )}
          {race.status === 'CLOSED' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              Betting Closed / Running
            </span>
          )}
          {race.status === 'RESULTED' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              Official Result
            </span>
          )}
        </div>
      </div>

      {/* ---------------- RACE HEADER BANNER (SRS Spec) ---------------- */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-black bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                <MapPin className="w-3.5 h-3.5" />
                {race.venue}
              </span>
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {race.race_time} • {race.date_str}
              </span>
              {race.distance && (
                <span className="text-slate-300 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 font-mono font-bold">
                  Distance: {race.distance}
                </span>
              )}
              {race.going && (
                <span className="text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-800/40 font-medium">
                  Track: {race.going}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {race.name}
            </h1>

            {race.class_grade && (
              <p className="text-xs sm:text-sm text-slate-400">
                Grade: {race.class_grade}
              </p>
            )}
          </div>

          {/* Quick stats on PC */}
          <div className="flex items-center gap-4 bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 self-start lg:self-auto shadow-inner">
            <div className="text-center px-2">
              <p className="text-[11px] text-slate-500 uppercase font-bold">Runners</p>
              <p className="text-xl font-black text-white font-mono">{race.horses.length}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-2">
              <p className="text-[11px] text-slate-500 uppercase font-bold">My Bets</p>
              <p className="text-xl font-black text-amber-400 font-mono">{userBetsForRace.length}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center px-2">
              <p className="text-[11px] text-slate-500 uppercase font-bold">Pool Est.</p>
              <p className="text-xl font-black text-emerald-400 font-mono">₹2.5L</p>
            </div>
          </div>
        </div>

        {/* Official Placements if RESULTED */}
        {race.status === 'RESULTED' && (
          <div className="mt-5 p-4 rounded-2xl bg-blue-950/50 border border-blue-800/80 shadow-md">
            <div className="flex items-center gap-2 mb-3 text-blue-300 font-bold text-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Official Placing & Settled Results</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {winnerHorse && (
                <div className="bg-slate-900 rounded-xl p-3 border border-amber-500/50 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
                    1st
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-bold text-white truncate">#{winnerHorse.horse_no} {winnerHorse.name}</p>
                    <p className="text-[11px] text-slate-400">Jockey: {winnerHorse.jockey}</p>
                  </div>
                </div>
              )}
              {placeHorses[1] && (
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center">
                    2nd
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-bold text-white truncate">#{placeHorses[1].horse_no} {placeHorses[1].name}</p>
                    <p className="text-[11px] text-slate-400">Jockey: {placeHorses[1].jockey}</p>
                  </div>
                </div>
              )}
              {placeHorses[2] && (
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center">
                    3rd
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-bold text-white truncate">#{placeHorses[2].horse_no} {placeHorses[2].name}</p>
                    <p className="text-[11px] text-slate-400">Jockey: {placeHorses[2].jockey}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------------- TABS: RUNNERS & ODDS / 2D SIMULATOR / AI INSIGHTS / MY BETS ---------------- */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 gap-2 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            id="tab-runners-btn"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('runners');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'runners'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4-Column Odds Table</span>
            <span className="px-2 py-0.2 bg-black/40 rounded-full text-[11px] font-mono">
              {race.horses.length}
            </span>
          </button>

          <button
            id="tab-simulator-btn"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('simulator');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>2D Turf Track Simulator</span>
          </button>

          <button
            id="tab-insights-btn"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('insights');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>DerbyAI Form Insights</span>
          </button>

          <button
            id="tab-mybets-race-btn"
            onClick={() => {
              soundManager.playClick();
              setActiveTab('mybets');
            }}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'mybets'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Bets on Race ({userBetsForRace.length})</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Click any Win or Place odds box to open the Bet Slip popup</span>
        </div>
      </div>

      {/* ---------------- TAB 1: 4-COLUMN ODDS TABLE (EXACT SRS SPEC) ---------------- */}
      {activeTab === 'runners' && (
        <div className="space-y-4">
          
          {!isOpen && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {race.status === 'CLOSED'
                  ? 'This race is currently closed for betting. Odds are locked while runners compete.'
                  : 'This race has been officially resulted. Payouts have been distributed to winning accounts.'}
              </span>
            </div>
          )}

          {/* TABLE - 4 COLUMNS: No | Horse Name | Win Odds | Place Odds */}
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-xs font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-3 sm:px-5 w-16 text-center">No</th>
                    <th className="py-4 px-4 sm:px-6">Horse Name & Info</th>
                    <th className="py-4 px-3 sm:px-6 text-center w-36 sm:w-48">
                      <div className="flex flex-col items-center">
                        <span className="text-white font-black text-sm">Win Odds</span>
                        <span className="text-[10px] text-amber-400 lowercase font-medium">must finish 1st</span>
                      </div>
                    </th>
                    <th className="py-4 px-3 sm:px-6 text-center w-36 sm:w-48">
                      <div className="flex flex-col items-center">
                        <span className="text-white font-black text-sm">Place Odds</span>
                        <span className="text-[10px] text-emerald-400 lowercase font-medium">top 3 finish</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {race.horses.map((horse) => {
                    const isWinner = race.winner_horse_id === horse.id;
                    const isPlaced = race.place_horses_ids?.includes(horse.id);

                    return (
                      <tr
                        key={horse.id}
                        id={`horse-row-${horse.id}`}
                        className={`hover:bg-slate-850/80 transition ${
                          isWinner ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        {/* Column 1: No */}
                        <td className="py-4 px-3 sm:px-5 text-center align-middle">
                          <div className="inline-flex items-center justify-center w-9 h-9 rounded-2xl font-black text-sm bg-slate-950 border border-slate-800 text-amber-400 shadow-inner font-mono">
                            {horse.horse_no}
                          </div>
                        </td>

                        {/* Column 2: Horse Name */}
                        <td className="py-4 px-4 sm:px-6 align-middle">
                          <div className="flex items-center gap-3.5">
                            <SilkIcon
                              color={horse.silk_color}
                              number={horse.horse_no}
                              size="md"
                            />

                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-white text-base tracking-tight hover:text-rose-400 transition">
                                  {horse.name}
                                </span>
                                {isWinner && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow">
                                    <Trophy className="w-3 h-3" /> Winner
                                  </span>
                                )}
                                {!isWinner && isPlaced && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-[10px] uppercase">
                                    Placed
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                                <span>J: <strong className="text-slate-200">{horse.jockey}</strong></span>
                                <span>•</span>
                                <span>T: <strong className="text-slate-300">{horse.trainer}</strong></span>
                                {horse.form && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-400 font-mono font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                                      Form: {horse.form}
                                    </span>
                                  </>
                                )}
                                {horse.weight && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-500 font-mono">{horse.weight}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Column 3: Win Odds (Clickable Button) */}
                        <td className="py-4 px-3 sm:px-6 text-center align-middle">
                          <button
                            id={`win-odds-btn-${horse.id}`}
                            disabled={!isOpen}
                            onClick={() => handleOddsClick(horse, 'WIN', horse.win_odds)}
                            className={`w-full py-3 px-4 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
                              isOpen
                                ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 hover:scale-[1.02]'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'
                            }`}
                          >
                            <span className="block text-base tracking-tight font-black font-mono">
                              {formatOdds(horse.win_odds, oddsFormat)}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider block font-bold opacity-90">
                              WIN
                            </span>
                          </button>
                        </td>

                        {/* Column 4: Place Odds (Clickable Button) */}
                        <td className="py-4 px-3 sm:px-6 text-center align-middle">
                          <button
                            id={`place-odds-btn-${horse.id}`}
                            disabled={!isOpen}
                            onClick={() => handleOddsClick(horse, 'PLACE', horse.place_odds)}
                            className={`w-full py-3 px-4 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
                              isOpen
                                ? 'bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/40 hover:border-emerald-500 shadow-emerald-500/10 hover:scale-[1.02]'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 opacity-60'
                            }`}
                          >
                            <span className="block text-base tracking-tight font-black font-mono">
                              {formatOdds(horse.place_odds, oddsFormat)}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider block font-bold opacity-90">
                              PLACE
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 2: 2D TURF SIMULATOR ---------------- */}
      {activeTab === 'simulator' && (
        <div className="animate-in fade-in">
          <RaceSimulator race={race} />
        </div>
      )}

      {/* ---------------- TAB 3: AI INSIGHTS ---------------- */}
      {activeTab === 'insights' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-black text-white">DerbyAI Computerized Form Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-1.5">
              <span className="text-xs font-black uppercase text-amber-400">🔥 Primary Recommendation (Favorite)</span>
              <h4 className="text-sm font-bold text-white">#{race.horses[0]?.horse_no} {race.horses[0]?.name}</h4>
              <p className="text-slate-400">Jockey: {race.horses[0]?.jockey} • Trainer: {race.horses[0]?.trainer}</p>
              <p className="text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800 mt-2">
                Fastest closing split in trial gallops. High strike rate jockey aboard.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-rose-500/30 space-y-1.5">
              <span className="text-xs font-black uppercase text-rose-400">⚡ Value Proposition (Each-Way)</span>
              <h4 className="text-sm font-bold text-white">#{race.horses[1]?.horse_no} {race.horses[1]?.name}</h4>
              <p className="text-slate-400">Jockey: {race.horses[1]?.jockey} • Odds: {formatOdds(race.horses[1]?.place_odds || 2.0, oddsFormat)}</p>
              <p className="text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800 mt-2">
                High consistency rating in top-3 placings across standard distances.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: MY BETS FOR THIS RACE ---------------- */}
      {activeTab === 'mybets' && (
        <div className="space-y-4">
          {userBetsForRace.length === 0 ? (
            <div className="text-center py-14 bg-slate-900/70 rounded-3xl border border-slate-800 p-6 shadow-inner">
              <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200">No bets placed on this race yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Click any Win or Place odds from the table above to open the Bet Slip.
              </p>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab('runners');
                }}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-xs hover:bg-rose-500 transition cursor-pointer"
              >
                View 4-Column Odds Table
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {userBetsForRace.map((bet) => (
                <div
                  key={bet.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-black text-xs flex items-center justify-center font-mono">
                        #{bet.horse_no}
                      </span>
                      <h4 className="font-bold text-white text-base">{bet.horse_name}</h4>
                    </div>

                    {bet.status === 'PENDING' && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-black">
                        PENDING
                      </span>
                    )}
                    {bet.status === 'WON' && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black">
                        WON (+₹{bet.payout?.toLocaleString('en-IN')})
                      </span>
                    )}
                    {bet.status === 'LOST' && (
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black">
                        LOST
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-2xl text-xs font-mono">
                    <div>
                      <p className="text-slate-500 font-sans text-[11px]">Type</p>
                      <p className="font-bold text-slate-200">{bet.bet_type}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-sans text-[11px]">Locked Odds</p>
                      <p className="font-bold text-amber-400">{formatOdds(bet.odds, oddsFormat)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-sans text-[11px]">Stake</p>
                      <p className="font-bold text-white">₹{bet.stake.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800">
                    <span className="text-slate-400">Potential Return:</span>
                    <span className="font-black text-emerald-400 font-mono text-base">₹{bet.potential_win.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
