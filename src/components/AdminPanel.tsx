import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { soundManager } from '../utils/audio';
import { Banner, Bet, Horse, Race, RaceCenter, RaceDay, RaceStatus, User, DepositRequest, WithdrawalRequest, DepositStatus, WithdrawalStatus } from '../types';
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
  Play,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  CheckCheck,
  Eye,
  Smartphone,
  Building2,
  Timer,
  CreditCard,
  Banknote,
  Layers,
  Globe,
  CalendarCheck,
  Flag
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
  const [activeTab, setActiveTab] = useState<'races' | 'odds' | 'masters' | 'add_race' | 'banners' | 'users' | 'bets' | 'financials'>('races');
  const [adminRaceFilter, setAdminRaceFilter] = useState<'all' | 'upcoming' | 'live' | 'resulted'>('all');
  const [selectedCenterFilter, setSelectedCenterFilter] = useState<string>('all');
  
  // Masters: Level 1 (Centers) & Level 2 (Race Days) state
  const [raceCenters, setRaceCenters] = useState<RaceCenter[]>([]);
  const [raceDays, setRaceDays] = useState<RaceDay[]>([]);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterCode, setNewCenterCode] = useState('');
  const [newCenterCity, setNewCenterCity] = useState('');
  const [newDayCenterId, setNewDayCenterId] = useState('');
  const [newDayDate, setNewDayDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDayTitle, setNewDayTitle] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [allBets, setAllBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Financial requests state
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [financialSubTab, setFinancialSubTab] = useState<'DEPOSITS' | 'WITHDRAWALS'>('DEPOSITS');
  const [depositStatusFilter, setDepositStatusFilter] = useState<DepositStatus | 'ALL'>('ALL');
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<WithdrawalStatus | 'ALL'>('ALL');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [selectedOddsRaceId, setSelectedOddsRaceId] = useState<string>('');

  // Settlement dialog state (Dead Heat Enabled)
  const [settlingRace, setSettlingRace] = useState<Race | null>(null);
  const [settlePositions, setSettlePositions] = useState<Record<string, 1 | 2 | 3 | 0>>({});

  // Add Race Form state (Manual Entry)
  const [newRaceName, setNewRaceName] = useState(HANDWRITTEN_SHEET_PRESET.name);
  const [newRaceNo, setNewRaceNo] = useState<number | string>(HANDWRITTEN_SHEET_PRESET.race_no);
  const [newRaceCenterId, setNewRaceCenterId] = useState('cntr_bangalore');
  const [newRaceDayId, setNewRaceDayId] = useState('day_btc_today');
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
  const [editRaceCenterId, setEditRaceCenterId] = useState('');
  const [editRaceDayId, setEditRaceDayId] = useState('');
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

  // Clock timer for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Load Admin Data
  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, usersData, betsData, depositsData, withdrawalsData, centersData, daysData] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminAllBets(),
        api.getDepositRequests('ALL'),
        api.getWithdrawalRequests('ALL'),
        api.getRaceCenters(true),
        api.getRaceDays(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setAllBets(betsData);
      setDepositRequests(depositsData);
      setWithdrawalRequests(withdrawalsData);
      setRaceCenters(centersData);
      setRaceDays(daysData);
      if (!newDayCenterId && centersData.length > 0) {
        setNewDayCenterId(centersData[0].id);
      }
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Financial Handlers
  const handleApproveDeposit = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await api.approveDepositRequest(id);
      soundManager.playWinPayout();
      setActionMessage(`💰 ${res.message}`);
      await loadAdminData();
      await onRefreshData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to approve deposit');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectDeposit = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (optional):', 'UTR or payment screenshot could not be verified.');
    if (reason === null) return;
    try {
      setIsLoading(true);
      const res = await api.rejectDepositRequest(id, reason);
      setActionMessage(`❌ ${res.message}`);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to reject deposit');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveWithdrawalToInProgress = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await api.approveWithdrawalToInProgress(id);
      soundManager.playClick();
      setActionMessage(`⏳ ${res.message}`);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to approve withdrawal');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteWithdrawalToSuccessful = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await api.completeWithdrawalToSuccessful(id);
      soundManager.playWinPayout();
      setActionMessage(`✅ ${res.message}`);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to complete withdrawal');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    const reason = window.prompt('Enter rejection reason (Funds will be refunded to user):', 'Payout details invalid or bank rejected transfer.');
    if (reason === null) return;
    try {
      setIsLoading(true);
      const res = await api.rejectWithdrawalRequest(id, reason);
      setActionMessage(`↩️ ${res.message}`);
      await loadAdminData();
      await onRefreshData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to reject withdrawal');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    soundManager.playClick();
    setTimeout(() => setCopiedUtr(null), 2000);
  };

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
    const initialPositions: Record<string, 1 | 2 | 3 | 0> = {};
    if (race.position_1 && race.position_1.length > 0) {
      race.horses.forEach((h) => {
        if (race.position_1?.includes(h.id)) initialPositions[h.id] = 1;
        else if (race.position_2?.includes(h.id)) initialPositions[h.id] = 2;
        else if (race.position_3?.includes(h.id)) initialPositions[h.id] = 3;
        else initialPositions[h.id] = 0;
      });
    } else {
      race.horses.forEach((h, idx) => {
        if (idx === 0) initialPositions[h.id] = 1;
        else if (idx === 1) initialPositions[h.id] = 2;
        else if (idx === 2) initialPositions[h.id] = 3;
        else initialPositions[h.id] = 0;
      });
    }
    setSettlePositions(initialPositions);
  };

  const handleExecuteSettlement = async () => {
    if (!settlingRace) return;
    const p1 = Object.keys(settlePositions).filter((id) => settlePositions[id] === 1);
    const p2 = Object.keys(settlePositions).filter((id) => settlePositions[id] === 2);
    const p3 = Object.keys(settlePositions).filter((id) => settlePositions[id] === 3);

    if (p1.length === 0) {
      setActionMessage('⚠️ Please select at least one horse for 1st Place');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.settleRace(settlingRace.id, {
        position_1: p1,
        position_2: p2,
        position_3: p3,
      });
      soundManager.playWinPayout();
      setActionMessage(res.message || 'Race settled and payouts distributed!');
      setSettlingRace(null);
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 4500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to settle race');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  // Level 1: Add Race Center Handler
  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterName.trim() || !newCenterCode.trim()) {
      setActionMessage('Please enter center name and code');
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.createRaceCenter({
        name: newCenterName,
        code: newCenterCode,
        city: newCenterCity || newCenterName,
        is_active: true,
      });
      soundManager.playClick();
      setActionMessage(`🏟 ${res.message}`);
      setNewCenterName('');
      setNewCenterCode('');
      setNewCenterCity('');
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to create center');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCenter = async (center: RaceCenter) => {
    try {
      setIsLoading(true);
      await api.updateRaceCenter(center.id, { is_active: !center.is_active });
      soundManager.playClick();
      setActionMessage(`⚡ Center ${center.name} is now ${!center.is_active ? 'ACTIVE' : 'INACTIVE'}`);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to update center');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  // Level 2: Create Race Day Handler
  const handleCreateRaceDay = async (e: React.FormEvent) => {
    e.preventDefault();
    const center = raceCenters.find((c) => c.id === newDayCenterId);
    if (!center) {
      setActionMessage('Please select a valid Race Center');
      return;
    }
    try {
      setIsLoading(true);
      const title = newDayTitle.trim() || `${center.name} - ${newDayDate}`;
      const res = await api.createRaceDay({
        center_id: center.id,
        center_name: center.name,
        race_date: newDayDate,
        title,
        status: 'PUBLISHED',
      });
      soundManager.playClick();
      setActionMessage(`📅 ${res.message}`);
      setNewDayTitle('');
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to create race day');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishRaceDay = async (dayId: string) => {
    try {
      setIsLoading(true);
      const res = await api.publishRaceDay(dayId);
      soundManager.playClick();
      setActionMessage(`🚀 ${res.message}`);
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to publish race day');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  // Level 3: Open Race For Betting (Single active race per center/day)
  const handleOpenRaceForBetting = async (race: Race) => {
    try {
      setIsLoading(true);
      const res = await api.openRaceForBetting(race.id);
      soundManager.playClick();
      setActionMessage(`🟢 Race #${race.race_no || ''} "${race.name}" is now OPEN FOR BETTING! All other races in this center are closed.`);
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to open race for betting');
      setTimeout(() => setActionMessage(null), 3500);
    } finally {
      setIsLoading(false);
    }
  };

  // Temporary odds storage for live editing
  const [tempOdds, setTempOdds] = useState<Record<string, { win_odds: number | string; place_odds: number | string }>>({});

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

  const handleSuspendHorse = async (raceId: string, horseId: string) => {
    try {
      const updatedRace = await api.suspendHorse(raceId, horseId);
      soundManager.playClick();
      if (updatedRace) {
        const horse = updatedRace.horses.find((h) => h.id === horseId);
        setActionMessage(`🚫 Runner #${horse?.serial_no || horse?.horse_no} ${horse?.name} is SUSPENDED. Users see "Odds Changing".`);
      }
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to suspend runner');
    }
  };

  const handleResumeHorse = async (raceId: string, horseId: string) => {
    try {
      const current = tempOdds[horseId];
      const race = races.find((r) => r.id === raceId);
      const horse = race?.horses.find((h) => h.id === horseId);
      const winVal = current?.win_odds !== undefined && current.win_odds !== '' ? parseFloat(String(current.win_odds)) : horse?.win_odds;
      const placeVal = current?.place_odds !== undefined && current.place_odds !== '' ? parseFloat(String(current.place_odds)) : horse?.place_odds;

      const updatedRace = await api.resumeHorse(raceId, horseId, winVal, placeVal);
      soundManager.playChip();
      if (updatedRace) {
        const h = updatedRace.horses.find((item) => item.id === horseId);
        setActionMessage(`✅ Runner #${h?.serial_no || h?.horse_no} ${h?.name} RESUMED! Live Odds: WIN ${h?.win_odds}x, PLACE ${h?.place_odds}x`);
      }
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to resume runner');
    }
  };

  const handleSuspendAll = async (raceId: string) => {
    try {
      const updatedRace = await api.suspendAll(raceId);
      soundManager.playClick();
      if (updatedRace) {
        setActionMessage(`🚫 ALL RUNNERS in "${updatedRace.name}" SUSPENDED. Users see "Odds Changing" across all tiles.`);
      }
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to suspend all runners');
    }
  };

  const handleResumeAll = async (raceId: string) => {
    try {
      const race = races.find((r) => r.id === raceId);
      const oddsMap: Record<string, { win_odds?: number; place_odds?: number }> = {};
      race?.horses.forEach((h) => {
        const current = tempOdds[h.id];
        oddsMap[h.id] = {
          win_odds: current?.win_odds !== undefined && current.win_odds !== '' ? parseFloat(String(current.win_odds)) : h.win_odds,
          place_odds: current?.place_odds !== undefined && current.place_odds !== '' ? parseFloat(String(current.place_odds)) : h.place_odds,
        };
      });

      const updatedRace = await api.resumeAll(raceId, oddsMap);
      soundManager.playChip();
      if (updatedRace) {
        setActionMessage(`✅ ALL RUNNERS in "${updatedRace.name}" RESUMED! All new odds are now live on user screens.`);
      }
      await onRefreshData();
      await loadAdminData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionMessage(err.message || 'Failed to resume all runners');
    }
  };

  const handleToggleHorseSuspend = async (raceId: string, horseId: string) => {
    const race = races.find((r) => r.id === raceId);
    const horse = race?.horses.find((h) => h.id === horseId);
    if (horse?.is_suspended) {
      await handleResumeHorse(raceId, horseId);
    } else {
      await handleSuspendHorse(raceId, horseId);
    }
  };

  const handleToggleRaceSuspendAll = async (raceId: string, forceState?: boolean) => {
    const race = races.find((r) => r.id === raceId);
    const isAll = forceState !== undefined ? forceState : (race?.is_suspended || race?.horses.every((h) => h.is_suspended));
    if (isAll) {
      await handleSuspendAll(raceId);
    } else {
      await handleResumeAll(raceId);
    }
  };

  const handleMakeRaceLive = async (race: Race) => {
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

  const handleMakeRaceUpcoming = async (race: Race) => {
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
        center_id: newRaceCenterId || undefined,
        race_day_id: newRaceDayId || undefined,
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
    setEditRaceCenterId(race.center_id || '');
    setEditRaceDayId(race.race_day_id || '');
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
        center_id: editRaceCenterId || undefined,
        race_day_id: editRaceDayId || undefined,
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Total Bettors</p>
            <p className="text-lg sm:text-2xl font-black text-white mt-1 font-mono">{stats.totalUsers}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Platform Bets</p>
            <p className="text-lg sm:text-2xl font-black text-indigo-400 mt-1 font-mono">{stats.totalBets}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Total Turnover</p>
            <p className="text-lg sm:text-2xl font-black text-emerald-400 mt-1 font-mono truncate">₹{stats.totalVolume.toLocaleString()}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Pending Bets In-Play</p>
            <p className="text-lg sm:text-2xl font-black text-amber-400 mt-1 font-mono">{stats.pendingBetsCount}</p>
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
          id="admin-tab-masters"
          onClick={() => setActiveTab('masters')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === 'masters'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm font-black'
              : 'text-emerald-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Race Centers & Days ({(raceCenters || []).length})</span>
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
          <span>Live Odds Editor ({races.filter((r) => r.status === 'LIVE' || r.status === 'OPEN_FOR_BETTING').length})</span>
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
          id="admin-tab-financials"
          onClick={() => setActiveTab('financials')}
          className={`px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
            activeTab === 'financials'
              ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
              : 'text-amber-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>Financial Requests</span>
          {(depositRequests.filter(d => d.status === 'PENDING').length + withdrawalRequests.filter(w => w.status === 'PENDING' || w.status === 'IN_PROGRESS').length) > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeTab === 'financials' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
            }`}>
              {depositRequests.filter(d => d.status === 'PENDING').length + withdrawalRequests.filter(w => w.status === 'PENDING' || w.status === 'IN_PROGRESS').length}
            </span>
          )}
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
              <p className="text-xs text-slate-400">Manage upcoming races, activate LIVE races with 1-active race rule, or declare official results</p>
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

          {/* Sub-Filter: Center Selector Pills */}
          <div className="space-y-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
              <span className="flex items-center gap-1 text-emerald-400">
                <Globe className="w-3.5 h-3.5" />
                <span>Filter by Race Center:</span>
              </span>
              <span className="text-[10px] text-slate-500">Only 1 race can be OPEN per center at a time</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold pb-0.5">
              <button
                onClick={() => setSelectedCenterFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap text-xs ${
                  selectedCenterFilter === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                All Centers ({races.length})
              </button>
              {(raceCenters || []).map((cntr) => {
                const centerCount = (races || []).filter(r => 
                  r.center_id === cntr.id || (r.venue && r.venue.toLowerCase().includes(cntr.name.toLowerCase()))
                ).length;
                return (
                  <button
                    key={cntr.id}
                    onClick={() => setSelectedCenterFilter(cntr.id)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap text-xs flex items-center gap-1 ${
                      selectedCenterFilter === cntr.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-sm'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{cntr.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({centerCount})</span>
                  </button>
                );
              })}
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
              <span>⏱ Upcoming ({races.filter((r) => r.status === 'UPCOMING' || r.status === 'OPEN' || r.status === 'OPEN_FOR_BETTING' || r.status === 'DRAFT').length})</span>
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
              <span>🔴 Live & Open ({races.filter((r) => r.status === 'LIVE' || r.status === 'OPEN_FOR_BETTING').length})</span>
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
              <span>🏁 Completed ({races.filter((r) => r.status === 'RESULTED' || r.status === 'CLOSED').length})</span>
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
                if (selectedCenterFilter !== 'all') {
                  const matchesCenter = race.center_id === selectedCenterFilter || 
                    (race.venue && race.venue.toLowerCase().includes(selectedCenterFilter.replace('cntr_', '')));
                  if (!matchesCenter) return false;
                }
                if (adminRaceFilter === 'upcoming') {
                  return race.status === 'UPCOMING' || race.status === 'OPEN' || race.status === 'OPEN_FOR_BETTING' || race.status === 'DRAFT';
                }
                if (adminRaceFilter === 'live') {
                  return race.status === 'LIVE' || race.status === 'OPEN_FOR_BETTING';
                }
                if (adminRaceFilter === 'resulted') {
                  return race.status === 'RESULTED' || race.status === 'CLOSED';
                }
                return true;
              })
              .map((race) => (
              <div
                key={race.id}
                className={`bg-slate-900 rounded-2xl border p-4 sm:p-5 space-y-3 shadow-sm transition ${
                  race.status === 'OPEN_FOR_BETTING' || race.status === 'LIVE'
                    ? 'border-emerald-500/70 bg-gradient-to-br from-emerald-950/25 via-slate-900 to-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
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
                        {race.status === 'OPEN_FOR_BETTING' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[11px] font-black uppercase tracking-wider animate-pulse shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            🟢 OPEN FOR BETTING (LIVE)
                          </span>
                        ) : race.status === 'LIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[11px] font-black uppercase tracking-wider animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            🔴 LIVE IN-PLAY
                          </span>
                        ) : race.status === 'UPCOMING' || race.status === 'OPEN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            ⏱ UPCOMING RACE
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
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
                    {/* PRIMARY ACTION: OPEN FOR BETTING (Single Active Race) */}
                    {race.status !== 'OPEN_FOR_BETTING' && race.status !== 'RESULTED' && (
                      <button
                        id={`open-betting-btn-${race.id}`}
                        onClick={() => handleOpenRaceForBetting(race)}
                        disabled={isLoading}
                        className="col-span-2 sm:col-span-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 border border-emerald-400/40 active:scale-95"
                        title="Open this race for user betting (Automatically closes all other races in this center)"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-white" />
                        <span>▶ OPEN FOR BETTING</span>
                      </button>
                    )}

                    {/* Settle Button */}
                    {(race.status === 'LIVE' || race.status === 'OPEN_FOR_BETTING' || race.status === 'CLOSED') && (
                      <button
                        id={`settle-live-race-btn-${race.id}`}
                        onClick={() => handleOpenSettle(race)}
                        className="col-span-2 sm:col-span-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/40 border border-amber-300/50"
                        title="Declare official winner and settle all bets"
                      >
                        <Trophy className="w-3.5 h-3.5 text-black" />
                        <span>🏁 Settle Winner</span>
                      </button>
                    )}

                    {race.status === 'RESULTED' && (
                      <button
                        id={`re-settle-btn-${race.id}`}
                        onClick={() => handleOpenSettle(race)}
                        className="col-span-2 sm:col-span-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trophy className="w-3.5 h-3.5 text-blue-400" />
                        <span>View / Re-Settle</span>
                      </button>
                    )}

                    <button
                      id={`edit-race-btn-${race.id}`}
                      onClick={() => handleOpenEdit(race)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      id={`delete-race-btn-${race.id}`}
                      onClick={() => handleDeleteRace(race.id, race.name)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition cursor-pointer flex items-center justify-center"
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

      {/* TAB 2: Live Odds Editor (Handwritten Sheet System) */}
      {activeTab === 'odds' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-400" />
                <span>Live Odds Management System</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                  Handwritten Layout Live
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Directly manage and update Win/Place live odds and suspend runners in real-time
              </p>
            </div>

            {/* Quick race picker if multiple races */}
            {races.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Select Race:</span>
                <select
                  value={selectedOddsRaceId || (races.find(r => r.status === 'LIVE')?.id || races[0]?.id || '')}
                  onChange={(e) => setSelectedOddsRaceId(e.target.value)}
                  className="bg-slate-900 border border-emerald-500/40 text-xs font-bold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#e5b869]"
                >
                  {races.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.race_no ? `R#${r.race_no} - ` : ''}{r.name} ({r.venue} • {r.status})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {(() => {
            const currentRaceId = selectedOddsRaceId || (races.find(r => r.status === 'LIVE')?.id || races[0]?.id);
            const activeRace = races.find(r => r.id === currentRaceId) || races[0];

            if (!activeRace) {
              return (
                <div className="p-8 text-center bg-[#091510] rounded-2xl border border-emerald-900/50 space-y-3">
                  <p className="text-xs text-slate-400">No race fixtures available. Add a race in the Add Race tab.</p>
                </div>
              );
            }

            const isAllSuspended = activeRace.is_suspended || activeRace.horses.every(h => h.is_suspended);

            return (
              <div className="space-y-4">
                {/* Race Quick Switcher Pills */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none text-xs font-bold">
                  {races.map((r) => {
                    const isSelected = r.id === activeRace.id;
                    const isLive = r.status === 'LIVE';
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          soundManager.playClick();
                          setSelectedOddsRaceId(r.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#d4af37] to-[#e5b869] text-black font-black shadow-md'
                            : isLive
                            ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {isLive && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                        <span>{r.race_no ? `R#${r.race_no} - ` : ''}{r.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* ---------------- EXACT HANDWRITTEN ODDS BOARD CONTAINER ---------------- */}
                <div className="bg-[#091510] rounded-2xl border-2 border-emerald-900/80 shadow-2xl overflow-hidden">
                  
                  {/* Handwritten Header: 01 | XYZ PLATE | 1200M | 1:30 | SUSP ALL */}
                  <div className="bg-[#040805] border-b-2 border-emerald-900/80 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                      {/* Race No box */}
                      <div className="px-3 py-1.5 rounded-xl bg-[#1a170b] border-2 border-[#e5b869] text-[#e5b869] font-mono font-black text-sm sm:text-base shadow-inner">
                        {String(activeRace.race_no || '01').padStart(2, '0')}
                      </div>

                      {/* Race Name */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-xl font-black text-white uppercase tracking-wider font-mono">
                            {activeRace.name}
                          </h3>
                          {activeRace.status === 'LIVE' ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                              🔴 LIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase">
                              ⏱ {activeRace.status}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                          <MapPin className="w-3 h-3 text-[#e5b869]" />
                          <span>{activeRace.venue}</span>
                        </p>
                      </div>

                      {/* Distance & Time Pills */}
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-slate-900 border border-emerald-700/50 text-emerald-400 font-black font-mono text-xs sm:text-sm">
                          {activeRace.distance || '1200M'}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-bold font-mono text-xs sm:text-sm flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {activeRace.race_time || '1:30'}
                        </span>
                      </div>
                    </div>

                    {/* Master "SUSP ALL" / "RESUME ALL" Action Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        id={`master-susp-all-btn-${activeRace.id}`}
                        onClick={() => handleToggleRaceSuspendAll(activeRace.id)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black font-mono transition cursor-pointer shadow-lg active:scale-95 flex items-center gap-2 border ${
                          isAllSuspended
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-950/40'
                            : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 shadow-rose-950/40 animate-pulse'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{isAllSuspended ? 'RESUME ALL' : 'SUSP ALL'}</span>
                      </button>

                      {activeRace.status !== 'LIVE' && (
                        <button
                          type="button"
                          onClick={() => handleMakeRaceLive(activeRace)}
                          className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                        >
                          <Flame className="w-3.5 h-3.5 text-amber-200" />
                          <span>Make Live</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ---------------- HANDWRITTEN ODDS SPREADSHEET TABLE ---------------- */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[720px]">
                      <thead>
                        <tr className="bg-[#020503] border-b-2 border-emerald-900/80 text-xs font-black uppercase tracking-wider text-slate-300 font-mono">
                          <th className="py-3 px-3 w-16 text-center border-r border-emerald-900/50">
                            SL
                          </th>
                          <th className="py-3 px-4 border-r border-emerald-900/50">
                            Horse Name
                          </th>
                          <th className="py-3 px-4 w-48 text-center border-r border-emerald-900/50">
                            <span className="text-amber-400 block text-xs sm:text-sm font-black">WIN Odds</span>
                            <span className="text-[9px] text-slate-400 font-normal">Editable Input (₹100)</span>
                          </th>
                          <th className="py-3 px-4 w-48 text-center border-r border-emerald-900/50">
                            <span className="text-emerald-400 block text-xs sm:text-sm font-black">PLACE Odds</span>
                            <span className="text-[9px] text-slate-400 font-normal">Editable Input (₹100)</span>
                          </th>
                          <th className="py-3 px-4 w-40 text-center">
                            <span className="block text-xs font-black">Action</span>
                            <span className="text-[9px] text-slate-400 font-normal">[SUSPEND / RESUME]</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-950/80">
                        {activeRace.horses.map((horse, idx) => {
                          const isSuspended = horse.is_suspended || activeRace.is_suspended;
                          const slNo = horse.serial_no || horse.horse_no || (idx + 1);
                          const currentWinVal = tempOdds[horse.id]?.win_odds !== undefined ? tempOdds[horse.id].win_odds : horse.win_odds;
                          const currentPlaceVal = tempOdds[horse.id]?.place_odds !== undefined ? tempOdds[horse.id].place_odds : horse.place_odds;

                          return (
                            <tr
                              key={horse.id || idx}
                              id={`admin-horse-row-${horse.id}`}
                              className={`transition-colors font-mono ${
                                isSuspended
                                  ? 'bg-rose-950/20'
                                  : idx % 2 === 0
                                  ? 'bg-[#091510]'
                                  : 'bg-[#07100c]'
                              } hover:bg-[#0f241a]`}
                            >
                              {/* SL (Serial Number) */}
                              <td className="py-2.5 px-3 text-center font-black text-sm text-slate-200 border-r border-emerald-900/50">
                                <span className="inline-flex w-7 h-7 rounded-lg bg-[#040805] border border-emerald-900/80 items-center justify-center text-[#e5b869]">
                                  {slNo}
                                </span>
                              </td>

                              {/* Horse Name (Uppercase bold + Trainer/Jockey) */}
                              <td className="py-2.5 px-4 border-r border-emerald-900/50">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wide">
                                      {horse.name || `RUNNER #${slNo}`}
                                    </span>
                                    {isSuspended && (
                                      <span className="px-2 py-0.5 rounded bg-rose-500/25 text-rose-300 border border-rose-500/50 text-[10px] font-black uppercase tracking-wider animate-pulse">
                                        🚫 SUSPENDED
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-sans flex items-center gap-2">
                                    <span>J: <strong className="text-slate-200">{horse.jockey || 'Jockey'}</strong></span>
                                    <span>•</span>
                                    <span>T: <strong className="text-slate-300">{horse.trainer || 'Trainer'}</strong></span>
                                    {horse.gate_no !== undefined && (
                                      <>
                                        <span>•</span>
                                        <span className="text-amber-400">Draw {horse.gate_no}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* WIN Odds: Direct input + quick step buttons */}
                              <td className="py-2 px-3 border-r border-emerald-900/50 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const num = typeof currentWinVal === 'number' ? currentWinVal : parseFloat(String(currentWinVal)) || horse.win_odds;
                                      const next = Math.max(1.05, Math.round((num - 0.1) * 100) / 100);
                                      setTempOdds(prev => ({ ...prev, [horse.id]: { ...prev[horse.id], win_odds: next } }));
                                      if (!isSuspended) {
                                        handleUpdateOdds(horse.id, next, typeof currentPlaceVal === 'number' ? currentPlaceVal : parseFloat(String(currentPlaceVal)) || horse.place_odds);
                                      }
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-black text-xs border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                                    title="-0.10"
                                  >
                                    -
                                  </button>

                                  <input
                                    type="number"
                                    step="0.05"
                                    min="1.05"
                                    value={currentWinVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempOdds(prev => ({ ...prev, [horse.id]: { ...prev[horse.id], win_odds: val } }));
                                    }}
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value);
                                      if (!isSuspended && val >= 1.05 && val !== horse.win_odds) {
                                        handleUpdateOdds(horse.id, val, typeof currentPlaceVal === 'number' ? currentPlaceVal : parseFloat(String(currentPlaceVal)) || horse.place_odds);
                                      }
                                    }}
                                    className="w-24 px-2 py-1.5 bg-[#020503] border-2 border-amber-500/60 rounded-lg text-amber-400 font-black font-mono text-center text-xs sm:text-sm focus:outline-none focus:border-amber-300 focus:ring-1 focus:ring-amber-300 shadow-inner"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const num = typeof currentWinVal === 'number' ? currentWinVal : parseFloat(String(currentWinVal)) || horse.win_odds;
                                      const next = Math.round((num + 0.1) * 100) / 100;
                                      setTempOdds(prev => ({ ...prev, [horse.id]: { ...prev[horse.id], win_odds: next } }));
                                      if (!isSuspended) {
                                        handleUpdateOdds(horse.id, next, typeof currentPlaceVal === 'number' ? currentPlaceVal : parseFloat(String(currentPlaceVal)) || horse.place_odds);
                                      }
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-black text-xs border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                                    title="+0.10"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* PLACE Odds: Direct input + quick step buttons */}
                              <td className="py-2 px-3 border-r border-emerald-900/50 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const num = typeof currentPlaceVal === 'number' ? currentPlaceVal : parseFloat(String(currentPlaceVal)) || horse.place_odds;
                                      const next = Math.max(1.02, Math.round((num - 0.05) * 100) / 100);
                                      setTempOdds(prev => ({ ...prev, [horse.id]: { ...prev[horse.id], place_odds: next } }));
                                      if (!isSuspended) {
                                        handleUpdateOdds(horse.id, typeof currentWinVal === 'number' ? currentWinVal : parseFloat(String(currentWinVal)) || horse.win_odds, next);
                                      }
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-black text-xs border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                                    title="-0.05"
                                  >
                                    -
                                  </button>

                                  <input
                                    type="number"
                                    step="0.05"
                                    min="1.02"
                                    value={currentPlaceVal}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setTempOdds(prev => ({ ...prev, [horse.id]: { ...prev[horse.id], place_odds: val } }));
                                    }}
                                    onBlur={(e) => {
                                      const val = parseFloat(e.target.value);
                                      if (!isSuspended && val >= 1.02 && val !== horse.place_odds) {
                                        handleUpdateOdds(horse.id, typeof currentWinVal === 'number' ? currentWinVal : parseFloat(String(currentWinVal)) || horse.win_odds, val);
                                      }
                                    }}
                                    className="w-24 px-2 py-1.5 bg-[#020503] border-2 border-emerald-500/60 rounded-lg text-emerald-400 font-black font-mono text-center text-xs sm:text-sm focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 shadow-inner"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const num = typeof currentPlaceVal === 'number' ? currentPlaceVal : parseFloat(String(currentPlaceVal)) || horse.place_odds;
                                      const next = Math.round((num + 0.05) * 100) / 100;
                                      setTempOdds(prev => ({ ...prev, [horse.id]: { ...prev[horse.id], place_odds: next } }));
                                      if (!isSuspended) {
                                        handleUpdateOdds(horse.id, typeof currentWinVal === 'number' ? currentWinVal : parseFloat(String(currentWinVal)) || horse.win_odds, next);
                                      }
                                    }}
                                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-black text-xs border border-slate-700 flex items-center justify-center cursor-pointer active:scale-95"
                                    title="+0.05"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Action: SUSPEND / RESUME button per runner */}
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  id={`action-runner-btn-${horse.id}`}
                                  onClick={() => handleToggleHorseSuspend(activeRace.id, horse.id)}
                                  className={`w-full max-w-[120px] py-1.5 px-3 rounded-xl font-mono font-black text-xs transition cursor-pointer active:scale-95 border ${
                                    isSuspended
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/80 shadow-md shadow-emerald-950/60 animate-pulse'
                                      : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border-rose-500/50'
                                  }`}
                                  title={isSuspended ? 'Click RESUME to publish new odds live and enable betting' : 'Click SUSPEND to stop betting while changing odds'}
                                >
                                  {isSuspended ? 'RESUME' : 'SUSPEND'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Bottom Action Bar (matching bottom of handwritten sheet with Susp All at bottom right) */}
                  <div className="bg-[#040805] border-t-2 border-emerald-900/80 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">
                        Race Card: <strong className="text-white">{activeRace.horses.length} Runners</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(activeRace)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Edit Fixture</span>
                      </button>
                    </div>

                    {/* SUSP ALL / RESUME ALL button at Bottom Right as requested */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id={`bottom-susp-all-btn-${activeRace.id}`}
                        onClick={() => handleToggleRaceSuspendAll(activeRace.id)}
                        className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black font-mono transition cursor-pointer shadow-lg active:scale-95 flex items-center gap-2 border ${
                          isAllSuspended
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-950/40'
                            : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 shadow-rose-950/40 animate-pulse'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{isAllSuspended ? 'RESUME ALL' : 'SUSP ALL'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2.5: Masters (Level 1 Race Centers & Level 2 Race Days) */}
      {activeTab === 'masters' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-4 rounded-2xl border border-emerald-900/40">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>Masters Management: Race Centers & Race Days</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set up 3-Level hierarchy: <strong>Level 1 (Race Centers)</strong> ➔ <strong>Level 2 (Race Day Cards)</strong> ➔ <strong>Level 3 (Races)</strong>
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30 self-start sm:self-auto">
              {(raceCenters || []).filter(c => c && c.is_active).length} Active Centers
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEVEL 1: RACE CENTERS (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Flag className="w-4 h-4 text-emerald-400" />
                    <span>Level 1 - Race Centers ({(raceCenters || []).length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">table: race_centers</span>
                </div>

                {/* Add Center Form */}
                <form onSubmit={handleCreateCenter} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                  <span className="text-[11px] font-bold text-emerald-400 block">+ Add New Race Center</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Center Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MYSORE"
                        value={newCenterName}
                        onChange={(e) => setNewCenterName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. MYS"
                        value={newCenterCode}
                        onChange={(e) => setNewCenterCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">City / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Mysore, Karnataka"
                      value={newCenterCity}
                      onChange={(e) => setNewCenterCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Race Center</span>
                  </button>
                </form>

                {/* Centers List */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {(raceCenters || []).map((center) => {
                    const centerRaces = (races || []).filter(r => r.center_id === center.id || (r.venue && r.venue.toLowerCase().includes(center.name.toLowerCase())));
                    return (
                      <div
                        key={center.id}
                        className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2 text-xs ${
                          center.is_active
                            ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/50 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-black text-[10px] border border-emerald-500/30">
                            {center.code}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{center.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{center.city} • {centerRaces.length} races</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleCenter(center)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer border ${
                              center.is_active
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            {center.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LEVEL 2: RACE DAYS / RACE CARDS (7 COLS) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-[#e5b869]" />
                    <span>Level 2 - Race Day Cards ({(raceDays || []).length})</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">table: race_days</span>
                </div>

                {/* Create Race Day Form */}
                <form onSubmit={handleCreateRaceDay} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                  <span className="text-[11px] font-bold text-amber-400 block">+ Create New Race Day Card (Fixture Date)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Select Center *</label>
                      <select
                        required
                        value={newDayCenterId}
                        onChange={(e) => setNewDayCenterId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-bold text-xs"
                      >
                        {(raceCenters || []).map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Race Date *</label>
                      <input
                        type="date"
                        required
                        value={newDayDate}
                        onChange={(e) => setNewDayDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Card Title (e.g. Mysore - 17th Sep 2026)</label>
                    <input
                      type="text"
                      placeholder="Optional custom title (leave blank for auto)"
                      value={newDayTitle}
                      onChange={(e) => setNewDayTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create & Publish Race Card</span>
                  </button>
                </form>

                {/* Race Days List */}
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {(raceDays || []).map((day) => {
                    const center = (raceCenters || []).find(c => c.id === day.center_id);
                    const dayRaces = (races || []).filter(r => r.race_day_id === day.id || (day.center_id && r.center_id === day.center_id));

                    return (
                      <div
                        key={day.id}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{day.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              day.status === 'PUBLISHED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {day.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="text-amber-400 font-semibold">{center?.name || 'Center'}</span>
                            <span>•</span>
                            <span className="font-mono text-slate-300">{day.race_date}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">{dayRaces.length} races on card</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {day.status === 'DRAFT' && (
                            <button
                              type="button"
                              onClick={() => handlePublishRaceDay(day.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                            >
                              Publish
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setNewRaceCenterId(day.center_id);
                              setNewRaceDayId(day.id);
                              if (center) setNewVenue(`${center.name} Turf Club`);
                              setActiveTab('add_race');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Add Race to Day</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Add New Race (Full Manual Entry Form) */}
      {activeTab === 'add_race' && (
        <form onSubmit={handleCreateRace} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-5 max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Manual Race & Runner Entry (Level 3)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign to Race Center & Race Day card, then enter runner details and odds manually
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

          {/* Race Master Hierarchy Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950 rounded-xl border border-emerald-900/40">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Level 1: Race Center (Master) <span className="text-rose-400">*</span>
              </label>
              <select
                id="new-race-center-select"
                value={newRaceCenterId}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewRaceCenterId(val);
                  const center = raceCenters.find(c => c.id === val);
                  if (center) {
                    setNewVenue(`${center.name} Turf Club`);
                  }
                  const matchingDays = raceDays.filter(d => d.center_id === val);
                  if (matchingDays.length > 0) {
                    setNewRaceDayId(matchingDays[0].id);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500"
              >
                {(raceCenters || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code}) - {c.city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Level 2: Race Day / Card
              </label>
              <select
                id="new-race-day-select"
                value={newRaceDayId}
                onChange={(e) => setNewRaceDayId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
              >
                {(raceDays || [])
                  .filter(d => !newRaceCenterId || d.center_id === newRaceCenterId)
                  .map(d => (
                    <option key={d.id} value={d.id}>{d.title} ({d.status})</option>
                  ))}
              </select>
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
                Race Number (1-10)
              </label>
              <input
                id="new-race-no"
                type="number"
                value={newRaceNo}
                onChange={(e) => setNewRaceNo(e.target.value)}
                placeholder="e.g. 1"
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
                placeholder="e.g. 1:30 PM"
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
                placeholder="e.g. 1200M"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">
                Turf Club / Venue <span className="text-rose-400">*</span>
              </label>
              <input
                id="new-race-venue"
                type="text"
                list="indian-turf-clubs"
                required
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                placeholder="Select or enter venue (e.g. Royal Calcutta Turf Club)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              />
              <datalist id="indian-turf-clubs">
                <option value="Bangalore Turf Club" />
                <option value="Royal Calcutta Turf Club" />
                <option value="Delhi Race Club" />
                <option value="Hyderabad Race Club" />
                <option value="Mahalaxmi, Mumbai" />
                <option value="Pune Race Course" />
                <option value="Madras Race Club" />
                <option value="Mysore Race Club" />
              </datalist>
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

      {/* TAB 7: Financial Requests (Deposit Approvals & Withdrawal 120m Timer Workflow) */}
      {activeTab === 'financials' && (
        <div className="space-y-4">
          {/* Sub-navigation & Header */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-amber-400" />
                  <span>Financial Requests & Verification Desk</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Verify deposit UTR numbers & proof screenshots, approve auto-credits, manage withdrawal 120-min processing SLA and payout completion.
                </p>
              </div>
              <button
                onClick={loadAdminData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Requests</span>
              </button>
            </div>

            {/* Sub-Tabs: Deposits vs Withdrawals */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                id="admin-financial-subtab-deposits"
                onClick={() => setFinancialSubTab('DEPOSITS')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  financialSubTab === 'DEPOSITS'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Deposit Requests</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  financialSubTab === 'DEPOSITS' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {depositRequests.filter(d => d.status === 'PENDING').length} Pending
                </span>
              </button>

              <button
                id="admin-financial-subtab-withdrawals"
                onClick={() => setFinancialSubTab('WITHDRAWALS')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  financialSubTab === 'WITHDRAWALS'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Withdrawal Requests</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  financialSubTab === 'WITHDRAWALS' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {withdrawalRequests.filter(w => w.status === 'PENDING' || w.status === 'IN_PROGRESS').length} Active
                </span>
              </button>
            </div>
          </div>

          {/* SUB-PANEL 1: DEPOSIT REQUESTS */}
          {financialSubTab === 'DEPOSITS' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setDepositStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        depositStatusFilter === st
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st} ({st === 'ALL' ? depositRequests.length : depositRequests.filter(d => d.status === st).length})
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400">
                  Showing {depositRequests.filter(d => depositStatusFilter === 'ALL' || d.status === depositStatusFilter).length} deposits
                </span>
              </div>

              {/* Deposit List Cards */}
              <div className="space-y-3">
                {depositRequests
                  .filter(d => depositStatusFilter === 'ALL' || d.status === depositStatusFilter)
                  .map((dep) => (
                    <div
                      key={dep.id}
                      className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                            <ArrowDownLeft className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-white">
                                ₹{dep.amount.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[11px] text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                {dep.payment_method}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Bettor: <strong className="text-white">@{dep.username}</strong> <span className="text-slate-500">({dep.user_id})</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          {dep.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>PENDING REVIEW</span>
                            </span>
                          )}
                          {dep.status === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>APPROVED & CREDITED</span>
                            </span>
                          )}
                          {dep.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>REJECTED</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {/* UTR Number */}
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-400 block text-[11px] mb-1">12-Digit UTR / Transaction Ref:</span>
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-bold text-amber-400 text-sm tracking-wider select-all">
                              {dep.utr_number}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyUtr(dep.utr_number)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[10px] font-semibold transition cursor-pointer"
                              title="Copy UTR"
                            >
                              {copiedUtr === dep.utr_number ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Payment Screenshot Proof */}
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 block text-[11px]">Payment Proof Screenshot:</span>
                            <span className="text-[11px] text-slate-300 font-medium">
                              {dep.screenshot_url ? 'Screenshot Proof Attached' : 'No Screenshot Attached'}
                            </span>
                          </div>
                          {dep.screenshot_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewScreenshot(dep.screenshot_url || null)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 text-xs font-semibold transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Proof</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">UTR Only</span>
                          )}
                        </div>

                        {/* Timestamps */}
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                          <p>Submitted: <span className="text-slate-200">{new Date(dep.created_at).toLocaleString('en-IN')}</span></p>
                          {dep.reviewed_at && (
                            <p>Reviewed: <span className="text-slate-200">{new Date(dep.reviewed_at).toLocaleString('en-IN')}</span></p>
                          )}
                          {dep.admin_notes && (
                            <p className="text-rose-400">Notes: {dep.admin_notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Action Controls for Pending Deposit */}
                      {dep.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                          <button
                            type="button"
                            onClick={() => handleRejectDeposit(dep.id)}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveDeposit(dep.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Approve & Credit ₹{dep.amount.toLocaleString('en-IN')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {depositRequests.filter(d => depositStatusFilter === 'ALL' || d.status === depositStatusFilter).length === 0 && (
                  <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                    No deposit requests found under "{depositStatusFilter}".
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUB-PANEL 2: WITHDRAWAL REQUESTS (120-MIN SLA WORKFLOW) */}
          {financialSubTab === 'WITHDRAWALS' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  {(['ALL', 'PENDING', 'IN_PROGRESS', 'SUCCESSFUL', 'REJECTED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setWithdrawalStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        withdrawalStatusFilter === st
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st} ({st === 'ALL' ? withdrawalRequests.length : withdrawalRequests.filter(w => w.status === st).length})
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-400">
                  Showing {withdrawalRequests.filter(w => withdrawalStatusFilter === 'ALL' || w.status === withdrawalStatusFilter).length} withdrawals
                </span>
              </div>

              {/* Withdrawal List Cards */}
              <div className="space-y-3">
                {withdrawalRequests
                  .filter(w => withdrawalStatusFilter === 'ALL' || w.status === withdrawalStatusFilter)
                  .map((wth) => {
                    const startTime = new Date(wth.approved_at || wth.created_at).getTime();
                    const elapsedMins = Math.floor((currentTime - startTime) / 60000);
                    const remainingMins = Math.max(0, (wth.estimated_minutes || 120) - elapsedMins);
                    const hrs = Math.floor(remainingMins / 60);
                    const mins = remainingMins % 60;

                    return (
                      <div
                        key={wth.id}
                        className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3 hover:border-slate-700 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                              <ArrowUpRight className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-black text-white">
                                  ₹{wth.amount.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[11px] text-slate-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  {wth.upi_id ? 'UPI Fast Rail' : 'Bank IMPS'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                Bettor: <strong className="text-white">@{wth.username}</strong> <span className="text-slate-500">({wth.user_id})</span>
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            {wth.status === 'PENDING' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>PENDING ADMIN APPROVAL</span>
                              </span>
                            )}
                            {wth.status === 'IN_PROGRESS' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 animate-pulse">
                                <Timer className="w-3.5 h-3.5 animate-spin" />
                                <span>IN PROGRESS (120m SLA)</span>
                              </span>
                            )}
                            {wth.status === 'SUCCESSFUL' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>SUCCESSFUL & PAID</span>
                              </span>
                            )}
                            {wth.status === 'REJECTED' && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>REJECTED (REFUNDED)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Payout Destination Card */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[11px] mb-0.5">Payout Destination:</span>
                            {wth.upi_id ? (
                              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-mono">{wth.upi_id}</span>
                              </div>
                            ) : (
                              <div className="space-y-0.5 text-slate-200">
                                <p className="font-bold flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{wth.bank_account}</span>
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  IFSC: <span className="font-mono text-white">{wth.ifsc}</span> | Holder: <span className="text-white">{wth.account_holder || wth.username}</span>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* 120-minute SLA Bar for In Progress */}
                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">120-Minute Payout SLA:</span>
                              {wth.status === 'IN_PROGRESS' ? (
                                <span className="font-bold text-blue-300">
                                  {hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`}
                                </span>
                              ) : (
                                <span className="text-slate-500">{wth.status}</span>
                              )}
                            </div>
                            {wth.status === 'IN_PROGRESS' && (
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(5, ((120 - remainingMins) / 120) * 100))}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {/* Timestamps */}
                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                            <p>Requested: <span className="text-slate-200">{new Date(wth.created_at).toLocaleString('en-IN')}</span></p>
                            {wth.approved_at && (
                              <p>Approved: <span className="text-slate-200">{new Date(wth.approved_at).toLocaleString('en-IN')}</span></p>
                            )}
                            {wth.completed_at && (
                              <p>Paid: <span className="text-emerald-400">{new Date(wth.completed_at).toLocaleString('en-IN')}</span></p>
                            )}
                          </div>
                        </div>

                        {/* Action Controls for Withdrawal Status Transitions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                          {wth.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRejectWithdrawal(wth.id)}
                                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject & Refund</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleApproveWithdrawalToInProgress(wth.id)}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                              >
                                <Timer className="w-4 h-4" />
                                <span>Approve (Start 120m Timer)</span>
                              </button>
                            </>
                          )}

                          {wth.status === 'IN_PROGRESS' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRejectWithdrawal(wth.id)}
                                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject & Refund</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCompleteWithdrawalToSuccessful(wth.id)}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-lg"
                              >
                                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                                <span>Mark Successful (Transferred)</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {withdrawalRequests.filter(w => withdrawalStatusFilter === 'ALL' || w.status === withdrawalStatusFilter).length === 0 && (
                  <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                    No withdrawal requests found under "{withdrawalStatusFilter}".
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCREENSHOT LIGHTBOX PREVIEW MODAL */}
      {previewScreenshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewScreenshot(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Payment Proof Screenshot Preview</span>
              </h4>
              <button
                onClick={() => setPreviewScreenshot(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-black/60 flex items-center justify-center p-2">
              <img
                src={previewScreenshot}
                alt="Deposit Proof"
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* CORE FEATURE: RACE SETTLEMENT DIALOG (WITH DEAD HEAT DECLARATION LOGIC) */}
      {settlingRace && (() => {
        const p1 = settlingRace.horses.filter((h) => settlePositions[h.id] === 1);
        const p2 = settlingRace.horses.filter((h) => settlePositions[h.id] === 2);
        const p3 = settlingRace.horses.filter((h) => settlePositions[h.id] === 3);
        const isDeadHeatWin = p1.length > 1;
        const isDeadHeatPlace = p2.length > 1 || p3.length > 1;
        const isDeadHeat = isDeadHeatWin || isDeadHeatPlace;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-900/80 rounded-2xl shadow-2xl p-5 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span>Declare Official Race Verdict</span>
                      {isDeadHeat && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider animate-pulse">
                          🔥 Dead Heat Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Select official finishing positions. Multiple horses can be assigned the same position to declare a <strong>Dead Heat</strong>.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSettlingRace(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Race Meta */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap text-xs">
                <div>
                  <span className="text-amber-400 font-bold">{settlingRace.venue}</span>
                  <h4 className="text-sm font-black text-white">{settlingRace.name}</h4>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {settlingRace.distance}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {settlingRace.race_time}
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#e5b869]" />
                  Quick Presets:
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      const next: Record<string, 1 | 2 | 3 | 0> = {};
                      settlingRace.horses.forEach((h, i) => {
                        if (i === 0) next[h.id] = 1;
                        else if (i === 1) next[h.id] = 2;
                        else if (i === 2) next[h.id] = 3;
                        else next[h.id] = 0;
                      });
                      setSettlePositions(next);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition border border-slate-700 cursor-pointer"
                  >
                    Standard (1st, 2nd, 3rd)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      const next: Record<string, 1 | 2 | 3 | 0> = {};
                      settlingRace.horses.forEach((h, i) => {
                        if (i === 0 || i === 1) next[h.id] = 1; // 2 horses tied 1st
                        else if (i === 2) next[h.id] = 3; // 3rd place
                        else next[h.id] = 0;
                      });
                      setSettlePositions(next);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition border border-amber-500/40 cursor-pointer"
                  >
                    🔥 Dead Heat 1st (#1 & #2 Tied)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      const next: Record<string, 1 | 2 | 3 | 0> = {};
                      settlingRace.horses.forEach((h, i) => {
                        if (i === 0) next[h.id] = 1; // 1st
                        else if (i === 1 || i === 2) next[h.id] = 2; // 2 horses tied 2nd
                        else next[h.id] = 0;
                      });
                      setSettlePositions(next);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold transition border border-blue-500/40 cursor-pointer"
                  >
                    🔥 Dead Heat 2nd (#2 & #3 Tied)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      const next: Record<string, 1 | 2 | 3 | 0> = {};
                      settlingRace.horses.forEach((h, i) => {
                        if (i === 0) next[h.id] = 1; // 1st
                        else if (i === 1) next[h.id] = 2; // 2nd
                        else if (i === 2 || i === 3) next[h.id] = 3; // 2 horses tied 3rd
                        else next[h.id] = 0;
                      });
                      setSettlePositions(next);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold transition border border-emerald-500/40 cursor-pointer"
                  >
                    🔥 Dead Heat 3rd (#3 & #4 Tied)
                  </button>
                </div>
              </div>

              {/* Dead Heat Auto-Detection Alert Banner */}
              {isDeadHeatWin && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-200 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>🔥 DEAD HEAT FOR 1ST PLACE (WIN) DETECTED ({p1.length} Winners)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed pl-6">
                    <strong>Settlement Rule (Method A - Betfair / Industry Standard):</strong> Stake is split equally among the {p1.length} winners. For each winner, payout = <code>(Stake / {p1.length}) * Odds</code>. There is no 2nd place runner; the next runner finishes 3rd for place bets.
                  </p>
                </div>
              )}

              {!isDeadHeatWin && isDeadHeatPlace && (
                <div className="p-3.5 rounded-xl bg-blue-500/15 border-2 border-blue-500/50 text-blue-200 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-blue-300">
                    <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>🔥 DEAD HEAT FOR PLACE DETECTED</span>
                  </div>
                  <p className="text-[11px] text-blue-200/90 leading-relaxed pl-6">
                    {p2.length > 1 && `2nd Place tied with ${p2.length} horses. `}
                    {p3.length > 1 && `3rd Place tied with ${p3.length} horses. `}
                    Place odds will be proportionately divided based on available place slots.
                  </p>
                </div>
              )}

              {/* Runners Finishing Position Assignment List */}
              <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                {settlingRace.horses.map((horse) => {
                  const currentPos = settlePositions[horse.id] || 0;

                  return (
                    <div
                      key={horse.id}
                      className={`p-3 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        currentPos === 1
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : currentPos === 2
                          ? 'bg-blue-500/15 border-blue-500/50'
                          : currentPos === 3
                          ? 'bg-emerald-500/15 border-emerald-500/50'
                          : 'bg-slate-950/80 border-slate-800/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Horse Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-[#e5b869] font-black font-mono flex items-center justify-center shrink-0">
                          {horse.serial_no || horse.horse_no}
                        </span>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-white uppercase text-xs sm:text-sm">
                              {horse.name}
                            </span>
                            {horse.gate_no !== undefined && (
                              <span className="text-[10px] text-amber-400 font-mono">
                                (Draw {horse.gate_no})
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                            <span>J: {horse.jockey}</span>
                            <span>•</span>
                            <span>T: {horse.trainer}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-mono">Win: {horse.win_odds}x</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-mono">Place: {horse.place_odds}x</span>
                          </div>
                        </div>
                      </div>

                      {/* Position Buttons */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setSettlePositions((prev) => ({ ...prev, [horse.id]: 1 }));
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-black font-mono transition cursor-pointer active:scale-95 flex items-center gap-1 border ${
                            currentPos === 1
                              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-black'
                              : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-700'
                          }`}
                          title="Assign 1st Place (Winner)"
                        >
                          <span>🥇 1st</span>
                          {currentPos === 1 && <Check className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setSettlePositions((prev) => ({ ...prev, [horse.id]: 2 }));
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer active:scale-95 flex items-center gap-1 border ${
                            currentPos === 2
                              ? 'bg-blue-500 text-white border-blue-300 shadow-md font-black'
                              : 'bg-slate-900 hover:bg-slate-800 text-blue-400 border-slate-700'
                          }`}
                          title="Assign 2nd Place"
                        >
                          <span>🥈 2nd</span>
                          {currentPos === 2 && <Check className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setSettlePositions((prev) => ({ ...prev, [horse.id]: 3 }));
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer active:scale-95 flex items-center gap-1 border ${
                            currentPos === 3
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md font-black'
                              : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-700'
                          }`}
                          title="Assign 3rd Place"
                        >
                          <span>🥉 3rd</span>
                          {currentPos === 3 && <Check className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            soundManager.playClick();
                            setSettlePositions((prev) => ({ ...prev, [horse.id]: 0 }));
                          }}
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold font-mono transition cursor-pointer border ${
                            currentPos === 0
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-slate-950 hover:bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                          title="Unplaced"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Verdict Summary Card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Result Summary:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <span className="text-amber-400 font-black text-[11px] block">
                      🥇 1st Place (WIN {isDeadHeatWin ? `• ${p1.length}-WAY DH` : ''}):
                    </span>
                    <span className="text-white font-bold text-xs truncate block">
                      {p1.length > 0 ? p1.map((h) => `#${h.serial_no || h.horse_no} ${h.name}`).join(' & ') : 'None selected'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <span className="text-blue-300 font-black text-[11px] block">
                      🥈 2nd Place (PLACE):
                    </span>
                    <span className="text-white font-bold text-xs truncate block">
                      {p2.length > 0 ? p2.map((h) => `#${h.serial_no || h.horse_no} ${h.name}`).join(' & ') : isDeadHeatWin ? '(No 2nd in DH)' : 'None'}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-emerald-300 font-black text-[11px] block">
                      🥉 3rd Place (PLACE):
                    </span>
                    <span className="text-white font-bold text-xs truncate block">
                      {p3.length > 0 ? p3.map((h) => `#${h.serial_no || h.horse_no} ${h.name}`).join(' & ') : 'None'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSettlingRace(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="execute-settle-btn"
                  disabled={isLoading || p1.length === 0}
                  onClick={handleExecuteSettlement}
                  className={`flex-2 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    isDeadHeat
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 ring-2 ring-amber-400/50 animate-pulse'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>{isDeadHeat ? 'Confirm & Settle Dead Heat Result' : 'Confirm & Settle Official Payouts'}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
              {/* Race Master Hierarchy & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-emerald-900/40">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Level 1: Race Center <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={editRaceCenterId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditRaceCenterId(val);
                      const center = raceCenters.find(c => c.id === val);
                      if (center) setEditVenue(`${center.name} Turf Club`);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Center --</option>
                    {(raceCenters || []).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Level 2: Race Day / Card
                  </label>
                  <select
                    value={editRaceDayId}
                    onChange={(e) => setEditRaceDayId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Race Day --</option>
                    {(raceDays || [])
                      .filter(d => !editRaceCenterId || d.center_id === editRaceCenterId)
                      .map(d => (
                        <option key={d.id} value={d.id}>{d.title} ({d.status})</option>
                      ))}
                  </select>
                </div>
              </div>

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
