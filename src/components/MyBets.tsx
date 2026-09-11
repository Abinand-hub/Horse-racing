import React, { useState } from 'react';
import { Bet, BetStatus } from '../types';
import { OddsFormat, formatOdds } from '../utils/odds';
import { soundManager } from '../utils/audio';
import { 
  Trophy, 
  AlertCircle, 
  CheckCircle2, 
  Coins, 
  Calendar, 
  Clock, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface MyBetsProps {
  bets: Bet[];
  onSelectRace?: (raceId: string) => void;
  isLoading: boolean;
  oddsFormat?: OddsFormat;
  onGoToLobby?: () => void;
}

export const MyBets: React.FC<MyBetsProps> = ({ 
  bets, 
  onSelectRace, 
  isLoading,
  oddsFormat = 'DECIMAL',
  onGoToLobby
}) => {
  const [filter, setFilter] = useState<'ALL' | BetStatus>('ALL');

  const filteredBets = bets.filter((bet) => {
    if (filter === 'ALL') return true;
    return bet.status === filter;
  });

  const pendingCount = bets.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header with Title & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            My Contest Selections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Your live contested matches, runner selections, and placed bet slips
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold self-start sm:self-auto shadow-inner">
          {(['ALL', 'PENDING', 'WON', 'LOST'] as const).map((status) => (
            <button
              key={status}
              id={`mybets-filter-${status.toLowerCase()}`}
              onClick={() => {
                soundManager.playClick();
                setFilter(status);
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                filter === status
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status === 'PENDING' ? 'IN PLAY' : status}
              {status === 'PENDING' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400/30 text-amber-950 font-black rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bets List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">Loading your contest selections...</p>
        </div>
      ) : filteredBets.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800 p-8 shadow-inner space-y-3">
          <Coins className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No contest selections found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'ALL'
              ? 'You have not contested in any race yet. Choose a race from the Match Lobby to make your selections.'
              : `You do not have any ${filter === 'PENDING' ? 'in-play' : filter.toLowerCase()} selections.`}
          </p>
          {onGoToLobby && (
            <button
              onClick={onGoToLobby}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition cursor-pointer"
            >
              <span>Explore Match Lobby</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBets.map((bet) => (
            <div
              key={bet.id}
              id={`my-bet-card-${bet.id}`}
              className="bg-slate-900/90 hover:bg-slate-850 rounded-2xl border border-slate-800 p-4 sm:p-5 transition shadow-lg space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-black text-sm flex items-center justify-center font-mono shadow-inner">
                    #{bet.horse_no}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{bet.horse_name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{bet.race_name}</span>
                      <span>•</span>
                      <span className="text-amber-400 font-mono font-bold">{bet.venue}</span>
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {bet.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      In Play / Contesting
                    </span>
                  )}
                  {bet.status === 'WON' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
                      <Trophy className="w-3.5 h-3.5" />
                      WON (+₹{bet.payout?.toLocaleString('en-IN')})
                    </span>
                  )}
                  {bet.status === 'LOST' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Lost
                    </span>
                  )}
                </div>
              </div>

              {/* Bet Metrics Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl text-xs font-mono">
                <div>
                  <span className="text-slate-500 font-sans block text-[11px]">Bet Type</span>
                  <span className="font-bold text-slate-200">{bet.bet_type} (Market)</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block text-[11px]">Locked Odds</span>
                  <span className="font-bold text-amber-400">{formatOdds(bet.odds, oddsFormat)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block text-[11px]">Stake</span>
                  <span className="font-bold text-white">₹{bet.stake.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block text-[11px]">Potential Win</span>
                  <span className="font-bold text-emerald-400">₹{bet.potential_win.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Footer details */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Placed: {new Date(bet.placed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>

                {onSelectRace && (
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      onSelectRace(bet.race_id);
                    }}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer"
                  >
                    <span>View Race Card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
