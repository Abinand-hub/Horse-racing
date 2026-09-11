import React, { useState } from 'react';
import { Horse, Race, RaceStatus } from '../types';
import { SilkIcon } from './SilkIcon';
import { OddsFormat, formatOdds } from '../utils/odds';
import { soundManager } from '../utils/audio';
import { 
  Heart, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Star, 
  Search, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  Sliders,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Zap,
  Layers,
  Calendar, 
  ShieldCheck
} from 'lucide-react';

interface RaceListProps {
  races: Race[];
  onSelectRace: (raceId: string) => void;
  filterStatus: 'all' | 'upcoming' | 'open' | 'resulted';
  onChangeFilter: (status: 'all' | 'upcoming' | 'open' | 'resulted') => void;
  isLoading: boolean;
  oddsFormat?: OddsFormat;
  onOpenSearch?: () => void;
}

export const RaceList: React.FC<RaceListProps> = ({
  races,
  onSelectRace,
  filterStatus,
  onChangeFilter,
  isLoading,
  oddsFormat = 'DECIMAL',
}) => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<string>('all');
  const [showAllNewRacing, setShowAllNewRacing] = useState(false);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const uniqueVenues: string[] = Array.from(new Set(races.map((r) => r.venue))).filter(Boolean) as string[];

  const filteredRaces = races.filter((race) => {
    const matchesSearch =
      race.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.horses.some((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.jockey.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedVenue !== 'all' && race.venue.toLowerCase() !== selectedVenue.toLowerCase()) {
      return false;
    }

    if (filterStatus === 'upcoming') {
      return race.status === 'OPEN' || race.status === 'CLOSED';
    }
    if (filterStatus === 'open') {
      return race.status === 'OPEN';
    }
    if (filterStatus === 'resulted') {
      return race.status === 'RESULTED';
    }
    return true;
  });

  const getStatusBadge = (status: RaceStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Open
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            Closed / Running
          </span>
        );
      case 'RESULTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Resulted
          </span>
        );
    }
  };

  const raceImages = [
    '/images/race_action.jpg',
    '/images/jockey_hero.jpg',
    '/images/horse_runner.jpg',
  ];

  return (
    <div className="space-y-6">
      
      {/* ---------------- TOP BANNER / SEARCH BAR (Responsive for PC / Laptop / Mobile) ---------------- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search upcoming races (e.g. Bangalore Derby, Pune, Mumbai)..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#091510] border border-emerald-900/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#e5b869]/70 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#091510] p-1.5 rounded-2xl border border-emerald-900/50 text-xs font-bold overflow-x-auto scrollbar-none shadow-inner">
          {(['all', 'upcoming', 'open', 'resulted'] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                soundManager.playClick();
                onChangeFilter(status);
              }}
              className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#e5b869] text-black font-black shadow-[0_0_12px_rgba(229,184,105,0.4)]'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              {status === 'all' ? `All Races (${races.length})` : status === 'upcoming' ? 'Upcoming' : status === 'open' ? 'Live Open' : 'Settled Results'}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- PC & LAPTOP DUAL COLUMN LAYOUT ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Main Races List (8 cols on PC) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: "New Racing" Visual Feature Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                Featured Racing Fixtures
              </h2>
              <button
                onClick={() => setShowAllNewRacing(!showAllNewRacing)}
                className="text-xs font-bold text-slate-400 hover:text-rose-400 transition cursor-pointer"
              >
                {showAllNewRacing ? 'Show Less' : 'See All'}
              </button>
            </div>

            {/* Horizontal carousel on mobile / 2-column grid on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(showAllNewRacing ? filteredRaces : filteredRaces.slice(0, 2)).map((race, index) => {
                const bgImg = raceImages[index % raceImages.length];
                const isFav = !!favorites[race.id];

                return (
                  <div
                    key={`feat-${race.id}`}
                    onClick={() => {
                      soundManager.playClick();
                      onSelectRace(race.id);
                    }}
                    className="relative h-[200px] sm:h-[220px] rounded-3xl overflow-hidden cursor-pointer group border border-white/10 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-rose-500/40"
                  >
                    <img
                      src={bgImg}
                      alt={race.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-[0.70]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

                    <div className="absolute top-3.5 right-3.5 z-10">
                      <button
                        onClick={(e) => toggleFavorite(race.id, e)}
                        className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition border ${
                          isFav
                            ? 'bg-rose-500/40 text-rose-400 border-rose-500/60'
                            : 'bg-black/50 text-white/80 border-white/10 hover:bg-black/80'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="absolute top-3.5 left-3.5 z-10">
                      {race.status === 'OPEN' ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Live Betting
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-black/70 text-slate-300 font-bold text-[10px] uppercase border border-white/10">
                          {race.status}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 space-y-1.5">
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight drop-shadow truncate">
                        {race.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          {race.venue}
                        </span>
                        <span className="font-mono text-amber-300 font-bold">
                          {race.distance || '1400m'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/10">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {race.race_time} - {race.date_str}
                        </span>
                        <span className="text-rose-400 font-bold">
                          {race.horses.length} Runners →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: SRS Mandated "Upcoming Races" List View */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Upcoming Races (List View)
                </h2>
                <p className="text-xs text-slate-400">
                  SRS Format: <span className="text-slate-300 font-mono">Venue - Race Name - Time - Date</span>
                </p>
              </div>

              {uniqueVenues.length > 0 && (
                <select
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Tracks</option>
                  {uniqueVenues.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              )}
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-slate-500">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold">Loading race fixtures...</p>
              </div>
            ) : filteredRaces.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">No races found</p>
                <p className="text-xs text-slate-500 mt-1">Try changing filter status or clear search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRaces.map((race) => {
                  const winnerHorse = race.winner_horse_id
                    ? race.horses.find((h) => h.id === race.winner_horse_id)
                    : null;

                  return (
                    <div
                      key={race.id}
                      id={`race-card-${race.id}`}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectRace(race.id);
                      }}
                      className="group bg-[#091510]/95 hover:bg-[#0c1c15] rounded-3xl border border-emerald-900/40 hover:border-[#e5b869]/60 p-4 sm:p-5 transition-all duration-200 shadow-xl cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Main Title & Format */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-[#e5b869] font-black bg-[#1a170b] px-2.5 py-0.5 rounded-lg border border-[#e5b869]/30">
                              <MapPin className="w-3.5 h-3.5" />
                              {race.venue}
                            </span>
                            <span className="text-emerald-900">•</span>
                            <span className="text-slate-300 font-mono font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {race.race_time} - {race.date_str}
                            </span>
                            {race.distance && (
                              <>
                                <span className="text-emerald-900">•</span>
                                <span className="text-emerald-400 font-mono font-semibold">{race.distance}</span>
                              </>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#e5b869] transition">
                            {race.name}
                          </h3>

                          {race.status === 'RESULTED' && winnerHorse && (
                            <p className="text-xs text-blue-300 flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-[#e5b869]" />
                              Winner: <strong>#{winnerHorse.horse_no} {winnerHorse.name}</strong>
                            </p>
                          )}
                        </div>

                        {/* Status & View Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-900/30">
                          <div className="text-left sm:text-right">
                            <div className="text-xs text-slate-400 mb-1">
                              Runners: <span className="text-white font-mono font-bold">{race.horses.length}</span>
                            </div>
                            {getStatusBadge(race.status)}
                          </div>

                          <button
                            id={`race-view-btn-${race.id}`}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#0e241b] border border-emerald-700/40 group-hover:bg-gradient-to-r group-hover:from-[#d4af37] group-hover:to-[#e5b869] text-emerald-300 group-hover:text-black font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                          >
                            <span>Open Market</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Runners & Odds Strip */}
                      {race.horses.length > 0 && race.status !== 'RESULTED' && (
                        <div className="mt-3 pt-3 border-t border-emerald-900/30 flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                          <span className="text-[10px] uppercase font-black text-slate-500 whitespace-nowrap">
                            Top Runners:
                          </span>
                          {race.horses.slice(0, 4).map((h) => (
                            <div
                              key={h.id}
                              className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800/80 whitespace-nowrap"
                            >
                              <SilkIcon
                                color={h.silk_color}
                                number={h.horse_no}
                                size="sm"
                              />
                              <span className="font-bold text-slate-200 truncate max-w-[100px]">
                                {h.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-300 font-bold font-mono text-[11px] border border-rose-500/20">
                                {formatOdds(h.win_odds, oddsFormat)}
                              </span>
                            </div>
                          ))}
                          {race.horses.length > 4 && (
                            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap pl-1">
                              +{race.horses.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (PC & Laptop Sidebar - 4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Market Movers Card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Live Market Movers
              </h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Speed Princess</p>
                  <p className="text-[11px] text-slate-400">Bangalore Race 3</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  ↓ 2.50 (Steamer 🔥)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Royal Commander</p>
                  <p className="text-[11px] text-slate-400">Mumbai Race 5</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-mono font-bold">
                  ↑ 3.75 (Drifter)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Fire Blade</p>
                  <p className="text-[11px] text-slate-400">Pune Race 2</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  ↓ 5.00 (Backed)
                </span>
              </div>
            </div>
          </div>

          {/* Turf Expert Punter Insights Card */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1a0c10] via-slate-900 to-slate-900 border border-red-500/30 p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Turf Expert Daily Pick
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Form rating confidence score <strong>94%</strong> on good turf track conditions.
            </p>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-red-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">Bangalore Derby</span>
                <span className="text-xs font-mono font-bold text-emerald-400">Odds 2.50</span>
              </div>
              <p className="text-xs font-bold text-amber-300">#1 Speed Princess (J: Kumar)</p>
              <p className="text-[11px] text-slate-400">Optimal barrier draw with top speed rating.</p>
            </div>
          </div>

          {/* Quick Racing Rules & Integrity */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Exchange Rules</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px]">
              <li>WIN bets settle when horse finishes 1st.</li>
              <li>PLACE bets settle for Top 3 placings.</li>
              <li>Instant wallet credits upon official result declaration.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
