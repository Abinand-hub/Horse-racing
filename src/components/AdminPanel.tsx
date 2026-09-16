import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { soundManager } from '../utils/audio';
import { Banner, Bet, Horse, Race, RaceStatus, User } from '../types';
import { 
  Shield, 
  Trophy, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Upload, 
  Users, 
  Coins, 
  ArrowLeft, 
  RefreshCw, 
  Sliders, 
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  X,
  FileText,
  MapPin,
  Clock,
  RotateCcw,
  Flame,
  Play
} from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
  races: Race[];
  banners: Banner[];
  onRefreshData: () => Promise<void>;
}

// Preset matching the user's handwritten race sheet
const HORSE_IMAGE_PRESETS = [
  { id: 'action', url: '/images/race_action.jpg', label: 'Galloping Action (Golden Hour)' },
  { id: 'jockey', url: '/images/jockey_hero.jpg', label: 'Jockey Silk Hero' },
  { id: 'runner', url: '/images/horse_runner.jpg', label: 'Dark Turf Thoroughbred' },
];

const HANDWRITTEN_SHEET_PRESET = {
  name: 'The Star Future Cup',
  race_no: 7,
  venue: 'Bangalore Turf Club',
  race_time: '1:45 PM',
  distance: '1600m',
  going: 'Good',
  class_grade: 'Grade 2 • 3yo Terms',
  horses: [
    { serial_no: 1, gate_no: 5, name: 'Speed Princess', jockey: 'Kumar', trainer: 'Srikant', win_odds: 2.50, place_odds: 1.40, silk_color: '#dc2626' },
    { serial_no: 2, gate_no: 2, name: 'Royal Commander', jockey: 'Suraj Narredu', trainer: 'S. Padmanabhan', win_odds: 3.75, place_odds: 1.90, silk_color: '#2563eb' },
    { serial_no: 3, gate_no: 4, name: 'Golden Arrow', jockey: 'A. Sandesh', trainer: 'Prasanna Kumar', win_odds: 10.0, place_odds: 2.50, silk_color: '#16a34a' },
    { serial_no: 4, gate_no: 1, name: 'Thunder Bolt', jockey: 'P. Trevor', trainer: 'P. Shroff', win_odds: 8.0, place_odds: 1.75, silk_color: '#d97706' },
    { serial_no: 5, gate_no: 3, name: 'Mystic Star', jockey: 'C. S. Jodha', trainer: 'Dallas Todywalla', win_odds: 6.0, place_odds: 1.25, silk_color: '#7c3aed' },
    { serial_no: 6, gate_no: 6, name: 'Silver Lining', jockey: 'Neeraj Rawal', trainer: 'Imtiaz Sait', win_odds: 25.0, place_odds: 4.0, silk_color: '#0891b2' },
    { serial_no: 7, gate_no: 7, name: 'Fire Blade', jockey: 'Imran Chisty', trainer: 'Narendra Lagad', win_odds: 5.0, place_odds: 2.0, silk_color: '#e11d48' },
  ],
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBack,
  races,
  banners,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'races' | 'odds' | 'add_race' | 'banners' | 'users' | 'bets'>('races');
  const [adminRaceFilter, setAdminRaceFilter] = useState<'all' | 'upcoming' | 'live' | 'resulted'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [allBets, setAllBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Settlement dialog state
  const [settlingRace, setSettlingRace] = useState<Race | null>(null);
  const [winnerHorseId, setWinnerHorseId] = useState<string>('');
  const [secondHorseId, setSecondHorseId] = useState<string>('');
  const [thirdHorseId, setThirdHorseId] = useState<string>('');

  // Add Race Form state (Manual Entry)
  const [newRaceName, setNewRaceName] = useState(HANDWRITTEN_SHEET_PRESET.name);
  const [newRaceNo, setNewRaceNo] = useState<number | string>(HANDWRITTEN_SHEET_PRESET.race_no);
  const [newVenue, setNewVenue] = useState(HANDWRITTEN_SHEET_PRESET.venue);
  const [newTime, setNewTime] = useState(HANDWRITTEN_SHEET_PRESET.race_time);
  const [newDistance, setNewDistance] = useState(HANDWRITTEN_SHEET_PRESET.distance);
  const [newGoing, setNewGoing] = useState(HANDWRITTEN_SHEET_PRESET.going);
  const [newClassGrade, setNewClassGrade] = useState(HANDWRITTEN_SHEET_PRESET.class_grade);
  const [newRaceImage, setNewRaceImage] = useState('/images/race_action.jpg');
  const [newRaceStatus, setNewRaceStatus] = useState<RaceStatus>('UPCOMING');
  const [newHorses, setNewHorses] = useState([...HANDWRITTEN_SHEET_PRESET.horses]);

  // Edit Race Modal state (Manual Edit)
  const [editingRace, setEditingRace] = useState<Race | null>(null);
  const [editRaceName, setEditRaceName] = useState('');
  const [editRaceNo, setEditRaceNo] = useState<number | string>('');
  const [editVenue, setEditVenue] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDistance, setEditDistance] = useState('');
  const [editGoing, setEditGoing] = useState('');
  const [editClassGrade, setEditClassGrade] = useState('');
  const [editRaceImage, setEditRaceImage] = useState('/images/race_action.jpg');
  const [editRaceStatus, setEditRaceStatus] = useState<RaceStatus>('UPCOMING');
  const [editHorses, setEditHorses] = useState<any[]>([]);

  // Add Banner Form state
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImg, setNewBannerImg] = useState('https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80');
  const [newBannerLink, setNewBannerLink] = useState('#deposit');
  const [newBannerTag, setNewBannerTag] = useState('WEEKEND SPECIAL');

  // User Balance Adjustment state
  const [balanceModalUser, setBalanceModalUser] = useState<User | null>(null);
  const [balanceModalAmount, setBalanceModalAmount] = useState<string>('1000');
  const [balanceModalType, setBalanceModalType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [balanceModalDesc, setBalanceModalDesc] = useState<string>('');

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, usersData, betsData] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminAllBets(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setAllBets(betsData);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAdjustUserBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!balanceModalUser) return;
    const amount = Number(balanceModalAmount);
    if (isNaN(amount) || amount <= 0) {
      setActionMessage('Please enter a valid amount');
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.adjustUserBalance(balanceModalUser.id, amount, balanceModalType, balanceModalDesc);
      setActionMessage(res.message);
      setBalanceModalUser(null);
      setBalanceModalAmount('1000');
      setBalanceModalDesc('');
      await loadAdminData();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to adjust user balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (raceId: string, status: RaceStatus) => {
    try {
      await api.updateRaceStatus(raceId, status);
      soundManager.playClick();
      setActionMessage(`⚡ Race status updated to ${status}`);
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to update status');
      setTimeout(() => setActionMessage(null), 3500);
    }
  };

  const handleOpenSettle = (race: Race) => {
    setSettlingRace(race);
    setWinnerHorseId(race.horses[0]?.id || '');
    setSecondHorseId(race.horses[1]?.id || '');
    setThirdHorseId(race.horses[2]?.id || '');
  };

  const handleExecuteSettlement = async () => {
    if (!settlingRace || !winnerHorseId) return;
    try {
      setIsLoading(true);
      const placeIds = [winnerHorseId, secondHorseId, thirdHorseId].filter(Boolean);
      const res = await api.settleRace(settlingRace.id, winnerHorseId, placeIds);
      soundManager.playWinPayout();
      setActionMessage(res.message || 'Race settled and payouts distributed!');
      setSettlingRace(null);
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to settle race');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOdds = async (horseId: string, winOdds: number, placeOdds: number) => {
    try {
      await api.updateHorseOdds(horseId, winOdds, placeOdds);
      soundManager.playChip();
      setActionMessage('Odds updated live!');
      await onRefreshData();
      setTimeout(() => setActionMessage(null), 2500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to update odds');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleMakeMatchLive = async (race: Race) => {
    try {
      setIsLoading(true);
      await api.updateRaceStatus(race.id, 'LIVE');
      soundManager.playRaceBugle();
      setActionMessage(`⚡ Race "${race.name}" is now LIVE! Visible in Live Races on user page.`);
      await onRefreshData();
      await loadAdminData();
      setAdminRaceFilter('live');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to make race live');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMakeMatchUpcoming = async (race: Race) => {
    try {
      setIsLoading(true);
      await api.updateRaceStatus(race.id, 'UPCOMING');
      soundManager.playClick();
      setActionMessage(`⏱ Race "${race.name}" moved to Upcoming Races.`);
      await onRefreshData();
      await loadAdminData();
      setAdminRaceFilter('upcoming');
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to update status');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishRace = async (raceId: string) => {
    try {
      setIsLoading(true);
      await api.updateRaceStatus(raceId, 'UPCOMING');
      soundManager.playBetPlaced();
      setActionMessage('🚀 Race published to Upcoming Races! Visible on user page.');
      await onRefreshData();
      await loadAdminData();
      setAdminRaceFilter('upcoming');
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to publish race');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRaceName.trim()) {
      setActionMessage('⚠️ Please provide a race name');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    const finalStatus = newRaceStatus || 'UPCOMING';
    try {
      setIsLoading(true);
      await api.createRace({
        name: newRaceName.trim(),
        race_no: newRaceNo ? Number(newRaceNo) : undefined,
        venue: newVenue || 'Bangalore Turf Club',
        race_time: newTime || '14:30',
        date_str: 'Today, 5th Sep',
        distance: newDistance || '1400M',
        going: newGoing || 'Good',
        class_grade: newClassGrade || 'Grade 1 • Terms',
        status: finalStatus,
        image_url: newRaceImage || '/images/race_action.jpg',
        horses: newHorses,
      });
      if (finalStatus === 'LIVE') {
        soundManager.playRaceBugle();
        setActionMessage(`⚡ Race "${newRaceName}" published directly to LIVE RACES with ${newHorses.length} runners!`);
        setAdminRaceFilter('live');
      } else {
        soundManager.playBetPlaced();
        setActionMessage(`⏱ Race "${newRaceName}" published to UPCOMING RACES with ${newHorses.length} runners!`);
        setAdminRaceFilter('upcoming');
      }
      await onRefreshData();
      await loadAdminData();
      handleClearForm();
      setActiveTab('races');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to publish race');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (race: Race) => {
    setEditingRace(race);
    setEditRaceName(race.name);
    setEditRaceNo(race.race_no || '');
    setEditVenue(race.venue);
    setEditTime(race.race_time);
    setEditDistance(race.distance);
    setEditGoing(race.going || 'Good');
    setEditClassGrade(race.class_grade || 'Grade 1 • Terms');
    setEditRaceImage(race.image_url || '/images/race_action.jpg');
    setEditRaceStatus(race.status || 'OPEN');
    setEditHorses(
      race.horses.map((h, i) => ({
        id: h.id,
        serial_no: h.serial_no || h.horse_no || i + 1,
        gate_no: h.gate_no !== undefined ? h.gate_no : (i + 1),
        name: h.name,
        jockey: h.jockey,
        trainer: h.trainer,
        win_odds: h.win_odds,
        place_odds: h.place_odds,
        silk_color: h.silk_color || '#dc2626',
        form: h.form || '1-1-2-1',
        weight: h.weight || '56.0 kg',
      }))
    );
  };

  const handleSaveEditRace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRace) return;
    if (!editRaceName.trim() || !editTime.trim()) {
      setActionMessage('⚠️ Race name and time are required');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    try {
      setIsLoading(true);
      await api.updateRace(editingRace.id, {
        name: editRaceName,
        race_no: editRaceNo ? Number(editRaceNo) : undefined,
        venue: editVenue,
        race_time: editTime,
        date_str: editingRace.date_str || 'Today, 5th Sep',
        distance: editDistance,
        going: editGoing,
        class_grade: editClassGrade,
        image_url: editRaceImage,
        status: editRaceStatus,
        horses: editHorses,
      });
      soundManager.playChip();
      setActionMessage(`✅ Race "${editRaceName}" updated successfully!`);
      setEditingRace(null);
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to update race');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRace = async (raceId: string, raceName: string) => {
    if (!window.confirm(`Are you sure you want to delete the race fixture "${raceName}"?`)) return;
    try {
      setIsLoading(true);
      await api.deleteRace(raceId);
      setActionMessage(`🗑️ Race fixture "${raceName}" deleted successfully!`);
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to delete race');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPreset = () => {
    setNewRaceName(HANDWRITTEN_SHEET_PRESET.name);
    setNewRaceNo(HANDWRITTEN_SHEET_PRESET.race_no);
    setNewVenue(HANDWRITTEN_SHEET_PRESET.venue);
    setNewTime(HANDWRITTEN_SHEET_PRESET.race_time);
    setNewDistance(HANDWRITTEN_SHEET_PRESET.distance);
    setNewGoing(HANDWRITTEN_SHEET_PRESET.going);
    setNewClassGrade(HANDWRITTEN_SHEET_PRESET.class_grade);
    setNewHorses([...HANDWRITTEN_SHEET_PRESET.horses]);
    soundManager.playChip();
    setActionMessage('✨ Loaded 7 runners from handwritten sheet preset!');
    setTimeout(() => setActionMessage(null), 2500);
  };

  const handleClearForm = () => {
    setNewRaceName('');
    setNewRaceNo('');
    setNewVenue('Bangalore Turf Club');
    setNewTime('');
    setNewDistance('');
    setNewGoing('Good');
    setNewHorses([
      { serial_no: 1, gate_no: 1, name: '', jockey: '', trainer: '', win_odds: 3.0, place_odds: 1.5, silk_color: '#dc2626' }
    ]);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle || !newBannerImg) {
      setActionMessage('⚠️ Title and Image URL are required');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    try {
      setIsLoading(true);
      await api.createBanner({
        title: newBannerTitle,
        subtitle: newBannerSubtitle,
        image_url: newBannerImg,
        link: newBannerLink,
        tag: newBannerTag,
      });
      soundManager.playChip();
      setActionMessage('🎉 Promotional Banner added!');
      setNewBannerTitle('');
      setNewBannerSubtitle('');
      await onRefreshData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to add banner');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await api.deleteBanner(id);
      setActionMessage('Banner removed');
      await onRefreshData();
      setTimeout(() => setActionMessage(null), 2000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to delete banner');
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Are you sure you want to reset all platform data to initial state?')) return;
    try {
      setIsLoading(true);
      await api.resetDemo();
      await onRefreshData();
      await loadAdminData();
      setActionMessage('Platform data reset to factory demo state!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to reset demo');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                DerbyBet Management Suite
              </h1>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Manage races, live odds, declare winners with auto bet settlements & banners
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="admin-reset-demo-btn"
            onClick={handleResetDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Banner */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <p className="text-xs text-slate-400">Total Bettors</p>
            <p className="text-xl font-black text-white mt-0.5">{stats.totalUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <p className="text-xs text-slate-400">Platform Bets</p>
            <p className="text-xl font-black text-indigo-400 mt-0.5">{stats.totalBets}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <p className="text-xs text-slate-400">Total Turnover</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">₹{stats.totalVolume.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
            <p className="text-xs text-slate-400">Pending Bets In-Play</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{stats.pendingBetsCount}</p>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none text-xs font-bold">
        <button
          id="admin-tab-races"
          onClick={() => setActiveTab('races')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === 'races'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Races & Settlement
        </button>

        <button
          id="admin-tab-odds"
          onClick={() => setActiveTab('odds')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === 'odds'
              ? 'bg-rose-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-rose-400" />
          <span>Live Odds Editor ({races.filter((r) => r.status === 'LIVE').length})</span>
        </button>

        <button
          id="admin-tab-add-race"
          onClick={() => setActiveTab('add_race')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === 'add_race'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Add New Race
        </button>

        <button
          id="admin-tab-banners"
          onClick={() => setActiveTab('banners')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === 'banners'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Manage Banners ({banners.length})
        </button>

        <button
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          All Users ({users.length})
        </button>

        <button
          id="admin-tab-bets"
          onClick={() => setActiveTab('bets')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === 'bets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Global Bets Book ({allBets.length})
        </button>
      </div>

      {/* TAB 1: Races & Settlement */}
      {activeTab === 'races' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Race Control & Status Dispatch</h2>
              <p className="text-xs text-slate-400">Manage upcoming races, launch LIVE races, or declare official results</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('add_race')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Race Fixture</span>
              </button>
            </div>
          </div>

          {/* Sub-Filter Tabs: Upcoming Races, Live Races, Completed Races, All */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none text-xs font-bold">
            <button
              onClick={() => {
                soundManager.playClick();
                setAdminRaceFilter('upcoming');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                adminRaceFilter === 'upcoming'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>⏱ Upcoming Races ({races.filter((r) => r.status === 'UPCOMING' || r.status === 'OPEN' || r.status === 'DRAFT').length})</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setAdminRaceFilter('live');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                adminRaceFilter === 'live'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md animate-pulse'
                  : 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>🔴 Live Races ({races.filter((r) => r.status === 'LIVE').length})</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setAdminRaceFilter('resulted');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                adminRaceFilter === 'resulted'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>🏁 Completed Races ({races.filter((r) => r.status === 'RESULTED' || r.status === 'CLOSED').length})</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setAdminRaceFilter('all');
              }}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                adminRaceFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>All Races ({races.length})</span>
            </button>
          </div>

          <div className="space-y-4">
            {races
              .filter((race) => {
                if (adminRaceFilter === 'upcoming') {
                  return race.status === 'UPCOMING' || race.status === 'OPEN' || race.status === 'DRAFT';
                }
                if (adminRaceFilter === 'live') {
                  return race.status === 'LIVE';
                }
                if (adminRaceFilter === 'resulted') {
                  return race.status === 'RESULTED' || race.status === 'CLOSED';
                }
                return true;
              })
              .map((race) => (
              <div
                key={race.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3 shadow-sm hover:border-slate-700 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Race Image Thumbnail */}
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0 shadow-md">
                      <img
                        src={race.image_url || '/images/race_action.jpg'}
                        alt={race.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/race_action.jpg';
                        }}
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-center text-[9px] font-bold text-slate-300 py-0.5 backdrop-blur-xs">
                        {race.distance}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs flex-wrap">
                        {race.race_no && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-black text-[11px] border border-indigo-500/30">
                            RACE #{race.race_no}
                          </span>
                        )}
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {race.venue}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {race.race_time}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{race.date_str || 'Today'}</span>
                        {race.going && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400">Going: {race.going}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-white">
                          {race.name}
                        </h3>
                        {race.status === 'LIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-black uppercase tracking-wider animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            🔴 LIVE IN-PLAY
                          </span>
                        ) : race.status === 'UPCOMING' || race.status === 'OPEN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            ⏱ UPCOMING MATCH
                          </span>
                        ) : race.status === 'DRAFT' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50 text-[11px] font-bold uppercase tracking-wider">
                            📝 DRAFT (HIDDEN)
                          </span>
                        ) : race.status === 'CLOSED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold uppercase tracking-wider">
                            🔒 CLOSED / RUNNING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold uppercase tracking-wider">
                            🏆 RESULTED & SETTLED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status & Action controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Make Match Live Button */}
                    {race.status !== 'LIVE' && race.status !== 'RESULTED' && (
                      <button
                        id={`make-live-btn-${race.id}`}
                        onClick={() => handleMakeMatchLive(race)}
                        disabled={isLoading}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-red-950/40 border border-red-400/40 animate-pulse active:scale-95"
                        title="Make this match LIVE immediately on the user page!"
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-200" />
                        <span>▶ Make Match LIVE</span>
                      </button>
                    )}

                    {/* If LIVE: Settle Button + Move to Upcoming Button */}
                    {race.status === 'LIVE' && (
                      <>
                        <button
                          id={`settle-live-race-btn-${race.id}`}
                          onClick={() => handleOpenSettle(race)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-950/40 border border-amber-300/50"
                          title="Declare official winner and settle all bets"
                        >
                          <Trophy className="w-3.5 h-3.5 text-black" />
                          <span>🏁 Settle & Declare Winner</span>
                        </button>
                        <button
                          id={`move-upcoming-btn-${race.id}`}
                          onClick={() => handleMakeMatchUpcoming(race)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                          title="Move match back to upcoming"
                        >
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Move to Upcoming</span>
                        </button>
                      </>
                    )}

                    {race.status === 'RESULTED' && (
                      <button
                        id={`re-settle-btn-${race.id}`}
                        onClick={() => handleOpenSettle(race)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Trophy className="w-3.5 h-3.5 text-blue-400" />
                        <span>View / Re-Settle</span>
                      </button>
                    )}

                    <button
                      id={`edit-race-btn-${race.id}`}
                      onClick={() => handleOpenEdit(race)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      id={`delete-race-btn-${race.id}`}
                      onClick={() => handleDeleteRace(race.id, race.name)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition cursor-pointer"
                      title="Delete race fixture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Runners Preview Table */}
                <div className="bg-slate-950/70 rounded-xl border border-slate-800/80 p-3 overflow-x-auto">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span>Field Runners ({race.horses.length} entries)</span>
                    <span className="text-slate-500 font-mono">S.No | Gate | Horse | Jockey | Trainer | Win / Place</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {race.horses.map((horse, idx) => (
                      <div
                        key={horse.id || idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] bg-indigo-500/20 text-indigo-300 shrink-0">
                            {horse.serial_no || horse.horse_no}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-amber-400 font-mono font-bold shrink-0">
                            G:{horse.gate_no !== undefined ? horse.gate_no : (horse.serial_no || horse.horse_no)}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-white truncate">{horse.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              J: {horse.jockey} • T: {horse.trainer}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2 font-mono">
                          <span className="text-amber-400 font-bold block text-[11px]">{horse.win_odds.toFixed(2)}</span>
                          <span className="text-emerald-400 text-[10px] block">{horse.place_odds.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Live Odds Editor (Only LIVE In-Play Matches) */}
      {activeTab === 'odds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-400" />
                <span>Live Odds Editor</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  🔴 LIVE ONLY ({races.filter((r) => r.status === 'LIVE').length})
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Modify Win and Place odds in real time for in-play races currently running
              </p>
            </div>
          </div>

          {(() => {
            const liveRaces = races.filter((r) => r.status === 'LIVE');

            if (liveRaces.length === 0) {
              return (
                <div className="p-8 sm:p-12 text-center bg-[#091510] rounded-2xl border border-emerald-900/50 space-y-3 shadow-xl">
                  <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto animate-pulse">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <h3 className="text-base font-black text-white">No Live Races In-Play Right Now</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Live Odds Editor strictly manages in-play races. Go to <strong>Races & Settlement</strong> and click <strong>"▶ Make Race LIVE"</strong> on any upcoming race to start editing live odds here.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setActiveTab('races');
                      setAdminRaceFilter('upcoming');
                    }}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e5b869] text-black font-black text-xs transition cursor-pointer shadow-lg active:scale-95"
                  >
                    <span>View Upcoming Races to Make Live</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              );
            }

            return (
              <div className="space-y-6">
                {liveRaces.map((race) => (
                  <div key={race.id} className="bg-slate-900 rounded-2xl border border-rose-500/40 p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        {race.race_no && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-black text-[11px] border border-rose-500/30">
                            R#{race.race_no}
                          </span>
                        )}
                        <h3 className="font-bold text-white text-sm">
                          {race.name} ({race.venue} • {race.race_time})
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase font-black tracking-wider animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        LIVE IN-PLAY
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {race.horses.map((horse) => (
                        <div
                          key={horse.id}
                          className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between font-bold text-white">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300 font-mono">
                                S.{horse.serial_no || horse.horse_no}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-amber-400 font-mono">
                                Gate {horse.gate_no !== undefined ? horse.gate_no : (horse.serial_no || horse.horse_no)}
                              </span>
                              <span className="truncate">{horse.name}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-400 truncate">
                            <span>Jockey: <strong className="text-slate-200">{horse.jockey}</strong></span>
                            <span className="mx-1">•</span>
                            <span>Trainer: <strong className="text-slate-200">{horse.trainer}</strong></span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Win Odds (₹100)</label>
                              <input
                                type="number"
                                step="0.05"
                                min="1.05"
                                defaultValue={horse.win_odds}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (val > 1 && val !== horse.win_odds) {
                                    handleUpdateOdds(horse.id, val, horse.place_odds);
                                  }
                                }}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Place Odds (₹100)</label>
                              <input
                                type="number"
                                step="0.05"
                                min="1.02"
                                defaultValue={horse.place_odds}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (val > 1 && val !== horse.place_odds) {
                                    handleUpdateOdds(horse.id, horse.win_odds, val);
                                  }
                                }}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-400"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 3: Add New Race (Full Manual Entry Form) */}
      {activeTab === 'add_race' && (
        <form onSubmit={handleCreateRace} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Manual Race & Runner Entry
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter race details and all horse fields (Serial No, Gate No, Horse Name, Jockey, Trainer) manually
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadPreset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer"
                title="Fill 7 horses directly from the handwritten Star Future Cup sheet"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Fill Handwritten Sheet</span>
              </button>

              <button
                type="button"
                onClick={handleClearForm}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Race Master Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Name of the Race <span className="text-rose-400">*</span>
              </label>
              <input
                id="new-race-name"
                type="text"
                required
                value={newRaceName}
                onChange={(e) => setNewRaceName(e.target.value)}
                placeholder="e.g. The Star Future Cup"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Race Number
              </label>
              <input
                id="new-race-no"
                type="number"
                value={newRaceNo}
                onChange={(e) => setNewRaceNo(e.target.value)}
                placeholder="e.g. 7"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Time <span className="text-rose-400">*</span>
              </label>
              <input
                id="new-race-time"
                type="text"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 1:45 PM"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Distance <span className="text-rose-400">*</span>
              </label>
              <input
                id="new-race-distance"
                type="text"
                required
                value={newDistance}
                onChange={(e) => setNewDistance(e.target.value)}
                placeholder="e.g. 1600m"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Venue
              </label>
              <input
                id="new-race-venue"
                type="text"
                required
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                placeholder="e.g. Bangalore Turf Club"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Going (Track condition)
              </label>
              <select
                value={newGoing}
                onChange={(e) => setNewGoing(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Good">Good</option>
                <option value="Soft">Soft</option>
                <option value="Firm">Firm</option>
                <option value="Heavy">Heavy</option>
                <option value="Yielding">Yielding</option>
              </select>
            </div>
          </div>

          {/* Horse Race Action Image Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              Race Banner & Fixture Horse Image <span className="text-rose-400">*</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Select an authentic horse racing image to show on the user fixture card and live betting page:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {HORSE_IMAGE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setNewRaceImage(preset.url)}
                  className={`relative rounded-xl overflow-hidden border-2 text-left transition cursor-pointer group ${
                    newRaceImage === preset.url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-24 object-cover" />
                  <div className="p-2 bg-slate-950/90 text-xs">
                    <p className="font-bold text-white text-[11px] truncate">{preset.label}</p>
                  </div>
                  {newRaceImage === preset.url && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow">
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Publishing Mode */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-white">Publishing Target & Status:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setNewRaceStatus('UPCOMING')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                  newRaceStatus === 'UPCOMING' || newRaceStatus === 'OPEN'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-md'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xl">⏱️</span>
                <div>
                  <p className="font-bold text-xs text-white">Upcoming Races</p>
                  <p className="text-[10px] text-slate-400">Scheduled race open in Upcoming tab</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewRaceStatus('LIVE')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                  newRaceStatus === 'LIVE'
                    ? 'border-red-500 bg-red-500/15 text-white shadow-md animate-pulse'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xl">🔴</span>
                <div>
                  <p className="font-bold text-xs text-white">Publish LIVE Now</p>
                  <p className="text-[10px] text-slate-400">In-play live race in Live Races tab</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNewRaceStatus('DRAFT')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                  newRaceStatus === 'DRAFT'
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xl">📝</span>
                <div>
                  <p className="font-bold text-xs text-white">Save as DRAFT</p>
                  <p className="text-[10px] text-slate-400">Hidden from user page until published</p>
                </div>
              </button>
            </div>
          </div>

          {/* Runners Manual Entry Table */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  Runners Entry List ({newHorses.length} Horses)
                </label>
                <p className="text-[11px] text-slate-400">
                  Enter Serial No, Gate No (Draw), Horse Name, Jockey Name, and Trainer Name
                </p>
              </div>

              <button
                type="button"
                id="add-runner-row-btn"
                onClick={() => {
                  const nextSerial = newHorses.length + 1;
                  setNewHorses([
                    ...newHorses,
                    {
                      serial_no: nextSerial,
                      gate_no: nextSerial,
                      name: '',
                      jockey: '',
                      trainer: '',
                      win_odds: 3.5,
                      place_odds: 1.6,
                      silk_color: '#3b82f6',
                    },
                  ]);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Runner Row</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {newHorses.map((horse, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-2.5 items-center text-xs"
                >
                  {/* Serial Number (S.No) */}
                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">S.No</label>
                    <input
                      type="number"
                      required
                      value={horse.serial_no}
                      onChange={(e) => {
                        const updated = [...newHorses];
                        updated[idx].serial_no = parseInt(e.target.value) || 0;
                        setNewHorses(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-center text-xs"
                      placeholder="S.No"
                    />
                  </div>

                  {/* Gate Number (Draw) */}
                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-[10px] text-amber-400 font-semibold mb-0.5">Gate</label>
                    <input
                      type="text"
                      required
                      value={horse.gate_no}
                      onChange={(e) => {
                        const updated = [...newHorses];
                        updated[idx].gate_no = e.target.value;
                        setNewHorses(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold text-center text-xs"
                      placeholder="Gate"
                    />
                  </div>

                  {/* Horse Name */}
                  <div className="col-span-2 sm:col-span-3">
                    <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">
                      Name of the Horse <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={horse.name}
                      onChange={(e) => {
                        const updated = [...newHorses];
                        updated[idx].name = e.target.value;
                        setNewHorses(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold text-xs"
                      placeholder="Horse Name"
                    />
                  </div>

                  {/* Jockey Name */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">
                      Jockey Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={horse.jockey}
                      onChange={(e) => {
                        const updated = [...newHorses];
                        updated[idx].jockey = e.target.value;
                        setNewHorses(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                      placeholder="Jockey"
                    />
                  </div>

                  {/* Trainer Name */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">
                      Trainer Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={horse.trainer}
                      onChange={(e) => {
                        const updated = [...newHorses];
                        updated[idx].trainer = e.target.value;
                        setNewHorses(updated);
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                      placeholder="Trainer"
                    />
                  </div>

                  {/* Win Odds */}
                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-[10px] text-amber-400 font-semibold mb-0.5">Win</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={horse.win_odds}
                      onChange={(e) => {
                        const updated = [...newHorses];
                        updated[idx].win_odds = parseFloat(e.target.value) || 1.05;
                        setNewHorses(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold font-mono text-center text-xs"
                      placeholder="Win"
                    />
                  </div>

                  {/* Place Odds */}
                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-[10px] text-emerald-400 font-semibold mb-0.5">Place</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      value={horse.place_odds}
                      onChange={(e) => {
                        const updated = [...newHorses];
                        updated[idx].place_odds = parseFloat(e.target.value) || 1.02;
                        setNewHorses(updated);
                      }}
                      className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold font-mono text-center text-xs"
                      placeholder="Place"
                    />
                  </div>

                  {/* Actions / Delete Row */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end sm:justify-center pt-1 sm:pt-0">
                    <button
                      type="button"
                      disabled={newHorses.length <= 1}
                      onClick={() => {
                        if (newHorses.length <= 1) return;
                        setNewHorses(newHorses.filter((_, i) => i !== idx));
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-700/60 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      title="Remove runner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden text-[10px] text-rose-400 font-semibold">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Total Runners to be created: <strong className="text-white">{newHorses.length}</strong>
            </span>

            <button
              type="submit"
              id="submit-create-race-btn"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Race Card & Runners</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: Manage Banners */}
      {activeTab === 'banners' && (
        <div className="space-y-5">
          <form onSubmit={handleAddBanner} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3 max-w-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              Upload New Advertisement Banner
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Banner Headline</label>
                <input
                  type="text"
                  required
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  placeholder="e.g. Pune Derby Day 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subtitle / Promo Pitch</label>
                <input
                  type="text"
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  placeholder="e.g. Place your bets early for highest multiplier odds"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL (Unsplash or direct asset)</label>
                <input
                  type="url"
                  required
                  value={newBannerImg}
                  onChange={(e) => setNewBannerImg(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tag</label>
                  <input
                    type="text"
                    value={newBannerTag}
                    onChange={(e) => setNewBannerTag(e.target.value)}
                    placeholder="e.g. SPECIAL OFFER"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Link Target</label>
                  <input
                    type="text"
                    value={newBannerLink}
                    onChange={(e) => setNewBannerLink(e.target.value)}
                    placeholder="e.g. /race/race_blr_01 or #deposit"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Add Banner to Slider
            </button>
          </form>

          {/* Existing Banners */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm">Active Banners</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {banners.map((banner) => (
                <div key={banner.id} className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group">
                  <img src={banner.image_url} alt={banner.title} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {banner.tag}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{banner.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{banner.subtitle}</p>
                    <p className="text-[11px] text-indigo-400 font-mono mt-1">Link: {banner.link}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: All Users & Wallet Operations */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Registered Users & Wallet Balances</h2>
              <p className="text-xs text-slate-400">View user exposure, approve transaction adjustments, credit or debit balances</p>
            </div>
            <span className="text-xs text-slate-400">{users.length} Users</span>
          </div>

          <div className="overflow-x-auto scrollbar-none rounded-xl border border-slate-800/80">
            <table className="w-full min-w-[650px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Balance</th>
                  <th className="py-2.5 px-3">Exposure</th>
                  <th className="py-2.5 px-3">Registered</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-3 font-bold text-white">@{u.username}</td>
                    <td className="py-3 px-3 text-slate-300">{u.phone}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">₹{u.balance.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-rose-400">₹{u.exposure.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setBalanceModalUser(u);
                            setBalanceModalType('CREDIT');
                            setBalanceModalAmount('1000');
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-bold text-[10px] transition cursor-pointer border border-emerald-500/30"
                        >
                          + Credit
                        </button>
                        <button
                          onClick={() => {
                            setBalanceModalUser(u);
                            setBalanceModalType('DEBIT');
                            setBalanceModalAmount('500');
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold text-[10px] transition cursor-pointer border border-rose-500/30"
                        >
                          - Debit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Balance Adjustment Modal */}
          {balanceModalUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-400" />
                    <span>{balanceModalType === 'CREDIT' ? 'Credit Balance' : 'Debit Balance'}</span>
                  </h3>
                  <button
                    onClick={() => setBalanceModalUser(null)}
                    className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                  <p className="text-slate-400">User: <strong className="text-white">@{balanceModalUser.username}</strong></p>
                  <p className="text-slate-400">Current Balance: <strong className="text-emerald-400 font-mono">₹{balanceModalUser.balance.toLocaleString()}</strong></p>
                </div>

                <form onSubmit={handleAdjustUserBalance} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={balanceModalAmount}
                      onChange={(e) => setBalanceModalAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Reason / Note (Optional)</label>
                    <input
                      type="text"
                      value={balanceModalDesc}
                      onChange={(e) => setBalanceModalDesc(e.target.value)}
                      placeholder="e.g. Approved Deposit / Bonus / Adjustment"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setBalanceModalUser(null)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        balanceModalType === 'CREDIT'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      Confirm {balanceModalType === 'CREDIT' ? 'Credit' : 'Debit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: Global Bets Book */}
      {activeTab === 'bets' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Platform Bets Ledger (Audit Trail)</h2>
            <span className="text-xs text-slate-400">{allBets.length} Bets Placed</span>
          </div>

          <div className="overflow-x-auto scrollbar-none rounded-xl border border-slate-800/80">
            <table className="w-full min-w-[700px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Bettor</th>
                  <th className="py-2.5 px-3">Race</th>
                  <th className="py-2.5 px-3">Runner</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Odds</th>
                  <th className="py-2.5 px-3">Stake</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allBets.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(b.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">@{b.username || b.user_id}</td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-[120px] truncate">{b.race_name}</td>
                    <td className="py-2.5 px-3 font-bold text-white">#{b.horse_no} {b.horse_name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[10px]">
                        {b.bet_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{b.odds.toFixed(2)}</td>
                    <td className="py-2.5 px-3 font-mono text-white">₹{b.stake.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'WON'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : b.status === 'LOST'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {b.payout ? `+₹${b.payout.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CORE FEATURE: RACE SETTLEMENT DIALOG */}
      {settlingRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Declare Official Verdict</h3>
              </div>
              <button
                onClick={() => setSettlingRace(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-amber-400 font-semibold">{settlingRace.venue}</p>
              <h4 className="text-base font-bold text-white">{settlingRace.name}</h4>
              <p className="text-xs text-slate-400">
                Selecting the official 1st, 2nd, and 3rd place horses will automatically settle all pending WIN and PLACE bets, transfer winnings to user balances, release exposures, and log transactions!
              </p>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              {/* 1st Place / Winner */}
              <div>
                <label className="block text-amber-400 font-bold mb-1 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  1st Place (WINNER) - Pays all WIN and PLACE bets:
                </label>
                <select
                  id="settle-winner-select"
                  value={winnerHorseId}
                  onChange={(e) => setWinnerHorseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  {settlingRace.horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      S.#{h.serial_no || h.horse_no} [Gate {h.gate_no !== undefined ? h.gate_no : (h.serial_no || h.horse_no)}] {h.name} | Jockey: {h.jockey} | Trainer: {h.trainer} [Win: {h.win_odds.toFixed(2)}]
                    </option>
                  ))}
                </select>
              </div>

              {/* 2nd Place */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  2nd Place - Pays PLACE bets:
                </label>
                <select
                  id="settle-second-select"
                  value={secondHorseId}
                  onChange={(e) => setSecondHorseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {settlingRace.horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      S.#{h.serial_no || h.horse_no} [Gate {h.gate_no !== undefined ? h.gate_no : (h.serial_no || h.horse_no)}] {h.name} | Jockey: {h.jockey} | Trainer: {h.trainer} [Place: {h.place_odds.toFixed(2)}]
                    </option>
                  ))}
                </select>
              </div>

              {/* 3rd Place */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  3rd Place - Pays PLACE bets:
                </label>
                <select
                  id="settle-third-select"
                  value={thirdHorseId}
                  onChange={(e) => setThirdHorseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                >
                  {settlingRace.horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      S.#{h.serial_no || h.horse_no} [Gate {h.gate_no !== undefined ? h.gate_no : (h.serial_no || h.horse_no)}] {h.name} | Jockey: {h.jockey} | Trainer: {h.trainer} [Place: {h.place_odds.toFixed(2)}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettlingRace(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                id="execute-settle-btn"
                disabled={isLoading || !winnerHorseId}
                onClick={handleExecuteSettlement}
                className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Confirm & Settle Payouts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE FEATURE: EDIT RACE & RUNNERS MODAL */}
      {editingRace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-white text-base">Edit Race & Runners</h3>
                  <p className="text-xs text-slate-400">Update race info or change serial numbers, gate numbers, horse names, jockeys, and trainers</p>
                </div>
              </div>
              <button
                onClick={() => setEditingRace(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRace} className="space-y-4">
              {/* Race Master Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Name of the Race <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editRaceName}
                    onChange={(e) => setEditRaceName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Race Number</label>
                  <input
                    type="number"
                    value={editRaceNo}
                    onChange={(e) => setEditRaceNo(e.target.value)}
                    placeholder="e.g. 7"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Distance <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editDistance}
                    onChange={(e) => setEditDistance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Venue</label>
                  <input
                    type="text"
                    required
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Status (User Visibility)</label>
                  <select
                    value={editRaceStatus}
                    onChange={(e) => setEditRaceStatus(e.target.value as RaceStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="UPCOMING">⏱ UPCOMING (Visible in Upcoming Races)</option>
                    <option value="LIVE">🔴 LIVE IN-PLAY (Active Live Race)</option>
                    <option value="OPEN">🟢 OPEN (Pre-Race Betting)</option>
                    <option value="DRAFT">📝 DRAFT (Hidden from Users)</option>
                    <option value="CLOSED">🔒 CLOSED / RUNNING</option>
                    <option value="RESULTED">🏆 RESULTED & SETTLED</option>
                  </select>
                </div>
              </div>

              {/* Edit Image Selector */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Race Fixture Image
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {HORSE_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setEditRaceImage(preset.url)}
                      className={`relative rounded-xl overflow-hidden border-2 text-left transition cursor-pointer group ${
                        editRaceImage === preset.url
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-20 object-cover" />
                      <div className="p-1.5 bg-slate-950/90 text-[11px] font-bold text-white truncate">
                        {preset.label}
                      </div>
                      {editRaceImage === preset.url && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Runners Manual Edit Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">
                    Runners Field ({editHorses.length} Runners)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const nextSNo = editHorses.length + 1;
                      setEditHorses([
                        ...editHorses,
                        {
                          id: `h_new_${Date.now()}_${nextSNo}`,
                          serial_no: nextSNo,
                          gate_no: nextSNo,
                          name: '',
                          jockey: '',
                          trainer: '',
                          win_odds: 4.0,
                          place_odds: 1.8,
                          silk_color: '#3b82f6',
                        },
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Runner</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editHorses.map((horse, idx) => (
                    <div
                      key={horse.id || idx}
                      className="bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-2.5 items-center text-xs"
                    >
                      {/* Serial Number */}
                      <div className="col-span-1 sm:col-span-1">
                        <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">S.No</label>
                        <input
                          type="number"
                          required
                          value={horse.serial_no}
                          onChange={(e) => {
                            const updated = [...editHorses];
                            updated[idx].serial_no = parseInt(e.target.value) || 0;
                            setEditHorses(updated);
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-center text-xs"
                        />
                      </div>

                      {/* Gate Number */}
                      <div className="col-span-1 sm:col-span-1">
                        <label className="block text-[10px] text-amber-400 font-semibold mb-0.5">Gate</label>
                        <input
                          type="text"
                          required
                          value={horse.gate_no}
                          onChange={(e) => {
                            const updated = [...editHorses];
                            updated[idx].gate_no = e.target.value;
                            setEditHorses(updated);
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold text-center text-xs"
                        />
                      </div>

                      {/* Name of the Horse */}
                      <div className="col-span-2 sm:col-span-3">
                        <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">
                          Name of the Horse <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={horse.name}
                          onChange={(e) => {
                            const updated = [...editHorses];
                            updated[idx].name = e.target.value;
                            setEditHorses(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold text-xs"
                        />
                      </div>

                      {/* Name of the Jockey */}
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">
                          Name of the Jockey <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={horse.jockey}
                          onChange={(e) => {
                            const updated = [...editHorses];
                            updated[idx].jockey = e.target.value;
                            setEditHorses(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                        />
                      </div>

                      {/* Name of the Trainer */}
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">
                          Name of the Trainer <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={horse.trainer}
                          onChange={(e) => {
                            const updated = [...editHorses];
                            updated[idx].trainer = e.target.value;
                            setEditHorses(updated);
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                        />
                      </div>

                      {/* Win Odds */}
                      <div className="col-span-1 sm:col-span-1">
                        <label className="block text-[10px] text-amber-400 font-semibold mb-0.5">Win</label>
                        <input
                          type="number"
                          step="0.05"
                          required
                          value={horse.win_odds}
                          onChange={(e) => {
                            const updated = [...editHorses];
                            updated[idx].win_odds = parseFloat(e.target.value) || 1.05;
                            setEditHorses(updated);
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold font-mono text-center text-xs"
                        />
                      </div>

                      {/* Place Odds */}
                      <div className="col-span-1 sm:col-span-1">
                        <label className="block text-[10px] text-emerald-400 font-semibold mb-0.5">Place</label>
                        <input
                          type="number"
                          step="0.05"
                          required
                          value={horse.place_odds}
                          onChange={(e) => {
                            const updated = [...editHorses];
                            updated[idx].place_odds = parseFloat(e.target.value) || 1.02;
                            setEditHorses(updated);
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold font-mono text-center text-xs"
                        />
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-end sm:justify-center pt-1 sm:pt-0">
                        <button
                          type="button"
                          disabled={editHorses.length <= 1}
                          onClick={() => {
                            if (editHorses.length <= 1) return;
                            setEditHorses(editHorses.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-700/60 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                          title="Remove runner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sm:hidden text-[10px] text-rose-400 font-semibold">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Action Controls */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRace(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
