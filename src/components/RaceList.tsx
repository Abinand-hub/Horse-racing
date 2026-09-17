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
  filterStatus: 'all' | 'upcoming' | 'live' | 'resulted';
  onChangeFilter: (status: 'all' | 'upcoming' | 'live' | 'resulted') => void;
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
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [showAllNewRacing, setShowAllNewRacing] = useState(false);

  // Dynamically extract active centers from today's races
  const activeCentersWithRaces = useMemo(() => {
    const centerMap = new Map<string, { id: string; name: string; count: number; hasLive: boolean }>();
    
    races.forEach((r) => {
      const venueName = r.venue ? r.venue.trim().toUpperCase() : 'MAIN TURF';
      const centerKey = (r.center_id || venueName).toLowerCase();
      
      if (!centerMap.has(centerKey)) {
        centerMap.set(centerKey, {
          id: r.center_id || centerKey,
          name: venueName,
          count: 0,
          hasLive: false,
        });
      }
      const entry = centerMap.get(centerKey)!;
      entry.count += 1;
      if (r.status === 'LIVE' || r.status === 'OPEN_FOR_BETTING') {
        entry.hasLive = true;
      }
    });

    return Array.from(centerMap.values());
  }, [races]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRaces = races.filter((race) => {
    const matchesSearch =
      race.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.horses.some((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.jockey.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCenter !== 'all') {
      const centerNameKey = selectedCenter.replace('cntr_', '').toLowerCase();
      const matchesCenter = 
        race.center_id === selectedCenter || 
        (race.venue && race.venue.toLowerCase().includes(centerNameKey));
      if (!matchesCenter) return false;
    }

    if (filterStatus === 'upcoming') {
      return race.status === 'UPCOMING' || race.status === 'OPEN' || race.status === 'OPEN_FOR_BETTING' || race.status === 'DRAFT';
    }
    if (filterStatus === 'live') {
      return race.status === 'LIVE' || race.status === 'OPEN_FOR_BETTING';
    }
    if (filterStatus === 'resulted') {
      return race.status === 'RESULTED' || race.status === 'CLOSED';
    }
    return true;
  });

  const getStatusBadge = (status: RaceStatus) => {
    switch (status) {
      case 'LIVE':
      case 'OPEN_FOR_BETTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            🟢 LIVE / OPEN FOR BETTING
          </span>
        );
      case 'OPEN':
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            ⏱ Upcoming
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 text-xs font-bold uppercase tracking-wider">
            📝 Draft
          </span>
        );
      case 'CLOSED':
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            Betting Closed
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
    <div className="space-y-4 sm:space-y-5">
      
      {/* ---------------- ACTIVE CENTER / TODAY'S RACE CARD BANNER ---------------- */}
      {activeCentersWithRaces.length > 1 ? (
        // Multi-center day (Rare occasion: 2+ centers hosting races today)
        <div className="space-y-2 bg-[#06100b] p-3 rounded-2xl border border-emerald-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-black">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Today's Active Race Centers ({activeCentersWithRaces.length} Venues):</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <button
              id="center-tab-all"
              onClick={() => {
                soundManager.playClick();
                setSelectedCenter('all');
              }}
              className={`px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${
                selectedCenter === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[1.02]'
                  : 'bg-[#091510] text-slate-300 border-emerald-950 hover:text-white'
              }`}
            >
              <span>ALL VENUES</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950/40 text-slate-300">
                {races.length}
              </span>
            </button>
            {activeCentersWithRaces.map((cntr) => {
              const isSelected = selectedCenter === cntr.id;
              return (
                <button
                  key={cntr.id}
                  id={`center-tab-${cntr.id}`}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedCenter(cntr.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[1.02]'
                      : cntr.hasLive
                      ? 'bg-[#0b1c14] text-emerald-300 border-emerald-500/50 hover:bg-[#10291d]'
                      : 'bg-[#091510] text-slate-300 border-emerald-950 hover:text-white'
                  }`}
                >
                  {cntr.hasLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                  <span>{cntr.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-slate-950/40 text-slate-950 font-black' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {cntr.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        // Standard single center race day banner (Bangalore / Mysore / etc.)
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#06140e] via-[#091b13] to-[#040c08] border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
              <MapPin className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>{activeCentersWithRaces[0]?.name || (races[0]?.venue ? races[0].venue.toUpperCase() : 'TURF CLUB')}</span>
                  <span className="text-emerald-400">•</span>
                  <span className="text-[#e5b869]">TODAY'S RACE CARD</span>
                </h2>
                {activeCentersWithRaces[0]?.hasLive && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/60 text-[9px] font-black uppercase animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Betting In-Play
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeCentersWithRaces[0]?.count || races.length} Fixtures Scheduled for today • Live Decimal Odds & Pre-Post Betting Open
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-mono font-bold text-xs">
              {races.length} Races Today
            </span>
          </div>
        </div>
      )}

      {/* ---------------- TOP BANNER / SEARCH BAR ---------------- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-emerald-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search runners, jockeys, race numbers (e.g. Speed Princess, Mysore)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#091510] border border-emerald-900/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition shadow-inner"
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
        <div className="flex items-center gap-1.5 bg-[#091510] p-1.5 rounded-2xl border border-emerald-900/50 text-xs font-bold overflow-x-auto scrollbar-none shadow-inner">
          <button
            id="tab-filter-upcoming"
            onClick={() => {
              soundManager.playClick();
              onChangeFilter('upcoming');
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === 'upcoming'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#e5b869] text-black font-black shadow-[0_0_12px_rgba(229,184,105,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Upcoming ({races.filter((r) => r.status === 'UPCOMING' || r.status === 'OPEN' || r.status === 'DRAFT').length})</span>
          </button>

          <button
            id="tab-filter-live"
            onClick={() => {
              soundManager.playClick();
              onChangeFilter('live');
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === 'live'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse'
                : 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/40'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>🔴 Live & Open ({races.filter((r) => r.status === 'LIVE' || r.status === 'OPEN_FOR_BETTING').length})</span>
          </button>

          <button
            id="tab-filter-resulted"
            onClick={() => {
              soundManager.playClick();
              onChangeFilter('resulted');
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === 'resulted'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#e5b869] text-black font-black shadow-[0_0_12px_rgba(229,184,105,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Completed ({races.filter((r) => r.status === 'RESULTED' || r.status === 'CLOSED').length})</span>
          </button>

          <button
            id="tab-filter-all"
            onClick={() => {
              soundManager.playClick();
              onChangeFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-[#d4af37] to-[#e5b869] text-black font-black shadow-[0_0_12px_rgba(229,184,105,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <span>All Races ({races.length})</span>
          </button>
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
                      {race.status === 'LIVE' ? (
                        <span className="px-3 py-1 rounded-full bg-rose-600/95 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse border border-rose-400/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          🔴 Live In-Play
                        </span>
                      ) : race.status === 'UPCOMING' || race.status === 'OPEN' || race.status === 'DRAFT' ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow border border-emerald-400/30">
                          <Clock className="w-3 h-3 text-emerald-200" />
                          Upcoming
                        </span>
                      ) : race.status === 'RESULTED' ? (
                        <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow border border-blue-400/30">
                          <CheckCircle2 className="w-3 h-3 text-blue-200" />
                          Official Result
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-600/80 text-white font-bold text-[10px] uppercase border border-amber-400/30">
                          Closed
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

          {/* Section 2: Screen 2 - Center Race List View (Sequence of Races) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-emerald-900/40">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                  {selectedCenter !== 'all' ? (
                    <>
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <span>{RACE_CENTERS_MASTER.find(c => c.id === selectedCenter)?.name || 'Center'} - Today's Race Fixtures</span>
                    </>
                  ) : filterStatus === 'live' ? (
                    <>
                      <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                      <span>Live In-Play Races</span>
                    </>
                  ) : filterStatus === 'resulted' ? (
                    <>
                      <Trophy className="w-5 h-5 text-[#e5b869]" />
                      <span>Completed Races</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <span>Upcoming Races (Center Schedule)</span>
                    </>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedCenter !== 'all'
                    ? 'Only 1 active race is open for live betting at a time. Click any race to inspect runners.'
                    : 'Select a race center above or filter by live / upcoming'}
                </p>
              </div>

              <div className="text-xs text-emerald-400 font-bold self-start sm:self-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{filteredRaces.length} Races on Card</span>
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-slate-500">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-semibold">Loading race fixtures...</p>
              </div>
            ) : filteredRaces.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
                <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">No races found for this selection</p>
                <p className="text-xs text-slate-500 mt-1">Try selecting "ALL CENTERS" or switching tabs.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredRaces.map((race) => {
                  const winnerHorse = race.winner_horse_id
                    ? race.horses.find((h) => h.id === race.winner_horse_id)
                    : null;
                  const isActiveBetting = (race.status === 'OPEN_FOR_BETTING' || race.status === 'LIVE') && !race.is_suspended;

                  return (
                    <div
                      key={race.id}
                      id={`race-card-${race.id}`}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectRace(race.id);
                      }}
                      className={`group rounded-3xl p-4 sm:p-5 transition-all duration-200 shadow-xl cursor-pointer ${
                        isActiveBetting
                          ? 'border-2 border-emerald-500/90 shadow-[0_0_24px_rgba(16,185,129,0.35)] bg-gradient-to-r from-emerald-950/60 via-[#07170e] to-[#07100a] scale-[1.01]'
                          : 'border border-slate-800/80 bg-[#091510]/70 opacity-85 hover:opacity-100 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Main Title & Format */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            {race.race_no && (
                              <span className={`px-2.5 py-0.5 rounded-lg font-mono font-black text-[11px] border ${
                                isActiveBetting
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                                  : 'bg-slate-900 text-slate-300 border-slate-700'
                              }`}>
                                RACE #{race.race_no}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[#e5b869] font-black bg-[#1a170b] px-2.5 py-0.5 rounded-lg border border-[#e5b869]/40">
                              <MapPin className="w-3.5 h-3.5" />
                              {race.venue}
                            </span>
                            <span className="text-emerald-900">•</span>
                            <span className="text-slate-300 font-mono font-semibold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {race.race_time} - {race.date_str || 'Today'}
                            </span>
                            {race.distance && (
                              <>
                                <span className="text-emerald-900">•</span>
                                <span className="text-emerald-400 font-mono font-semibold">{race.distance}</span>
                              </>
                            )}
                          </div>

                          <h3 className={`text-base sm:text-lg font-black transition ${
                            isActiveBetting ? 'text-white' : 'text-slate-200 group-hover:text-white'
                          }`}>
                            {race.name}
                          </h3>

                          {race.status === 'RESULTED' && winnerHorse && (
                            <p className="text-xs text-blue-300 flex items-center gap-1.5">
                              <Trophy className="w-3.5 h-3.5 text-[#e5b869]" />
                              Winner: <strong>#{winnerHorse.horse_no || winnerHorse.serial_no} {winnerHorse.name}</strong>
                            </p>
                          )}
                        </div>

                        {/* Status & Action Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-900/30">
                          <div className="text-left sm:text-right">
                            <div className="text-xs text-slate-400 mb-1">
                              Runners: <span className="text-white font-mono font-bold">{race.horses.length}</span>
                            </div>
                            {getStatusBadge(race.status)}
                          </div>

                          <button
                            id={`race-view-btn-${race.id}`}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
                              isActiveBetting
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black shadow-emerald-950/60 animate-pulse'
                                : 'bg-[#0e241b] hover:bg-[#133024] text-emerald-300 hover:text-white border border-emerald-800/60'
                            }`}
                          >
                            <span>{isActiveBetting ? '⚡ BET NOW' : 'View Card'}</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                          </button>
                        </div>
                      </div>

                      {/* Quick Runners & Odds Strip */}
                      {race.horses.length > 0 && race.status !== 'RESULTED' && (
                        <div className="mt-3 pt-3 border-t border-emerald-900/40 flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
                          <span className="text-[10px] uppercase font-black text-slate-500 whitespace-nowrap">
                            Field Preview:
                          </span>
                          {race.horses.slice(0, 4).map((h) => (
                            <div
                              key={h.id}
                              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border whitespace-nowrap ${
                                isActiveBetting 
                                  ? 'bg-slate-950 border-emerald-500/40' 
                                  : 'bg-slate-950/70 border-slate-800'
                              }`}
                            >
                              <SilkIcon
                                color={h.silk_color}
                                number={h.horse_no || h.serial_no}
                                size="sm"
                              />
                              <span className="font-bold text-slate-200 truncate max-w-[100px]">
                                {h.name}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-md font-bold font-mono text-[11px] border ${
                                isActiveBetting
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-black'
                                  : 'bg-[#101e17] text-[#e5b869] border-[#e5b869]/30 font-bold'
                              }`}>
                                {formatOdds(h.win_odds, oddsFormat)}
                              </span>
                            </div>
                          ))}
                          {race.horses.length > 4 && (
                            <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap pl-1">
                              +{race.horses.length - 4} more runners
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
          <div className="rounded-3xl bg-slate-900 border-2 border-emerald-900/60 p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Live Market Movers
              </h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Speed Princess</p>
                  <p className="text-[11px] text-slate-400">Bangalore Race 3</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  ↓ 2.50 (Steamer 🔥)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Royal Commander</p>
                  <p className="text-[11px] text-slate-400">Mumbai Race 5</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-mono font-bold">
                  ↑ 3.75 (Drifter)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
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
          <div className="rounded-3xl bg-gradient-to-br from-[#1a0c10] via-slate-900 to-slate-900 border-2 border-red-500/40 p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Turf Expert Daily Pick
              </h3>
            </div>
            <p className="text-xs text-slate-300">
              Form rating confidence score <strong>94%</strong> on good turf track conditions.
            </p>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-red-500/30 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">Bangalore Derby</span>
                <span className="text-xs font-mono font-bold text-emerald-400">Odds 2.50</span>
              </div>
              <p className="text-xs font-bold text-amber-300">#1 Speed Princess (J: Kumar)</p>
              <p className="text-[11px] text-slate-400">Optimal barrier draw with top speed rating.</p>
            </div>
          </div>

          {/* Quick Racing Rules & Integrity */}
          <div className="rounded-3xl bg-slate-900 border-2 border-emerald-900/60 p-5 shadow-xl space-y-2.5 text-xs text-slate-400">
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
