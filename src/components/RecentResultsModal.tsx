import React from 'react';
import { Race } from '../types';
import { 
  X, 
  Award, 
  Trophy, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';

interface RecentResultsModalProps {
  races: Race[];
  isOpen: boolean;
  onClose: () => void;
  onSelectRace: (raceId: string) => void;
}

export const RecentResultsModal: React.FC<RecentResultsModalProps> = ({
  races,
  isOpen,
  onClose,
  onSelectRace,
}) => {
  if (!isOpen) return null;

  const resultedRaces = races.filter((r) => r.status === 'RESULTED');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Recent Race Results</h3>
              <p className="text-[11px] text-slate-400">Official verdicts, dividends & winning odds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {resultedRaces.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/50 rounded-xl p-6">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No resulted races yet today</p>
              <p className="text-xs text-slate-500 mt-1">
                Once races are closed and resulted in the admin panel, results will appear here.
              </p>
            </div>
          ) : (
            resultedRaces.map((race) => {
              const winner = race.horses.find((h) => h.id === race.winner_horse_id);
              const second = race.place_horses_ids?.[1]
                ? race.horses.find((h) => h.id === race.place_horses_ids?.[1])
                : null;
              const third = race.place_horses_ids?.[2]
                ? race.horses.find((h) => h.id === race.place_horses_ids?.[2])
                : null;

              return (
                <div
                  key={race.id}
                  className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="text-amber-400 font-bold">{race.venue}</span>
                        <span>•</span>
                        <span>{race.race_time}</span>
                      </div>
                      <h4 className="font-bold text-white text-base mt-0.5">{race.name}</h4>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onSelectRace(race.id);
                      }}
                      className="flex items-center gap-1 text-xs text-amber-400 font-semibold hover:underline cursor-pointer"
                    >
                      <span>Full Race Card</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Placings podium */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {winner && (
                      <div className="bg-slate-900 rounded-lg p-2.5 border border-amber-500/30 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                          1st
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-white truncate">#{winner.horse_no} {winner.name}</p>
                          <p className="text-[11px] text-amber-400 font-mono">Win: {winner.win_odds.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                    {second && (
                      <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-700 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                          2nd
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-white truncate">#{second.horse_no} {second.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Place: {second.place_odds.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                    {third && (
                      <div className="bg-slate-900 rounded-lg p-2.5 border border-slate-700 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-800 text-amber-200 font-black text-[10px] flex items-center justify-center shrink-0">
                          3rd
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-white truncate">#{third.horse_no} {third.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">Place: {third.place_odds.toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
