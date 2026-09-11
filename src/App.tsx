import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { Banner, Bet, BetSlipState, BetType, Horse, Race, Transaction, User } from './types';
import { Header } from './components/Header';
import { BannerSlider } from './components/BannerSlider';
import { RaceList } from './components/RaceList';
import { RaceDetail } from './components/RaceDetail';
import { BetSlipModal } from './components/BetSlipModal';
import { MyBets } from './components/MyBets';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AccountStatementModal } from './components/AccountStatementModal';
import { RecentResultsModal } from './components/RecentResultsModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { HelpModal } from './components/HelpModal';
import { HowToPlayRules } from './components/HowToPlayRules';
import { PersonalDetails } from './components/PersonalDetails';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { BottomNav } from './components/BottomNav';
import { OddsFormat } from './utils/odds';
import { soundManager } from './utils/audio';
import { triggerConfetti } from './utils/confetti';
import { 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Clock, 
  Sparkles,
  Shield,
  Search,
  X
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [races, setRaces] = useState<Race[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Navigation & View state - Default home is How to Play & Rules
  const [activeTab, setActiveTab] = useState<'races' | 'rules' | 'mybets' | 'personal_details' | 'admin'>('rules');
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const [raceFilter, setRaceFilter] = useState<'all' | 'upcoming' | 'open' | 'resulted'>('open');
  const [isLoadingRaces, setIsLoadingRaces] = useState(true);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const [isLoadingTxs, setIsLoadingTxs] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  
  // Odds format preference
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>(() => {
    try {
      return (localStorage.getItem('derby_odds_format') as OddsFormat) || 'DECIMAL';
    } catch {
      return 'DECIMAL';
    }
  });

  const handleOddsFormatChange = (fmt: OddsFormat) => {
    setOddsFormat(fmt);
    try {
      localStorage.setItem('derby_odds_format', fmt);
    } catch {}
  };

  // Modals state
  const [betSlipData, setBetSlipData] = useState<BetSlipState | null>(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    if (type === 'success') {
      soundManager.playChip();
    }
    setTimeout(() => setToast(null), 4000);
  };

  // Initial user check
  useEffect(() => {
    soundManager.init();
    const savedUser = localStorage.getItem('derby_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        api.getMe(parsed.id).then((fresh) => setUser(fresh)).catch(() => {});
      } catch (e) {
        console.error(e);
      }
    } else {
      api.login('arjun_punters', 'pass123')
        .then((res) => setUser(res.user))
        .catch(() => {});
    }
  }, []);

  // Fetch races & banners
  const loadRacesAndBanners = async () => {
    try {
      setIsLoadingRaces(true);
      const [racesData, bannersData] = await Promise.all([
        api.getRaces('all'),
        api.getBanners(),
      ]);
      setRaces(racesData);
      setBanners(bannersData);
    } catch (err: any) {
      console.error('Error fetching races:', err);
    } finally {
      setIsLoadingRaces(false);
    }
  };

  useEffect(() => {
    loadRacesAndBanners();
  }, []);

  // Fetch user bets and statement
  const loadUserFinancials = async () => {
    if (!user) {
      setMyBets([]);
      setTransactions([]);
      return;
    }
    try {
      setIsLoadingBets(true);
      setIsLoadingTxs(true);
      const [betsData, txsData, freshUser] = await Promise.all([
        api.getMyBets(user.id),
        api.getTransactions(user.id),
        api.getMe(user.id),
      ]);
      setMyBets(betsData);
      setTransactions(txsData);
      setUser(freshUser);
    } catch (err: any) {
      console.error('Error loading financials:', err);
    } finally {
      setIsLoadingBets(false);
      setIsLoadingTxs(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserFinancials();
    }
  }, [user?.id]);

  // Handle Bet Click on Odds button
  const handleOpenBetSlip = (horse: Horse, betType: BetType, odds: number) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const currentRace = races.find((r) => r.id === (selectedRaceId || horse.race_id));
    if (!currentRace) return;

    setBetSlipData({
      race: currentRace,
      horse,
      bet_type: betType,
      odds,
      stake: 500,
    });
  };

  // Submit bet
  const handleSubmitBet = async (params: {
    race_id: string;
    horse_id: string;
    bet_type: 'WIN' | 'PLACE';
    odds: number;
    stake: number;
  }) => {
    if (!user) throw new Error('Please login to place bets');

    const res = await api.placeBet({
      ...params,
      user_id: user.id,
    });

    setUser(res.user);
    setMyBets((prev) => [res.bet, ...prev]);
    showToast(`Bet placed on #${res.bet.horse_no} ${res.bet.horse_name}! Stake: ₹${params.stake.toLocaleString('en-IN')}`);
    loadUserFinancials();
  };

  // Handle Deposit
  const handleDeposit = async (amount: number, method: string) => {
    if (!user) throw new Error('User required');
    const res = await api.deposit(user.id, amount, method);
    setUser(res.user);
    soundManager.playWinPayout();
    triggerConfetti();
    showToast(`₹${amount.toLocaleString('en-IN')} deposited successfully via ${method}!`);
    loadUserFinancials();
  };

  // Handle Withdraw
  const handleWithdraw = async (amount: number, details: { upi_id?: string; bank_account?: string }) => {
    if (!user) throw new Error('User required');
    const res = await api.withdraw(user.id, amount, details);
    setUser(res.user);
    showToast(`Withdrawal of ₹${amount.toLocaleString('en-IN')} submitted!`);
    loadUserFinancials();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setMyBets([]);
    setTransactions([]);
    setSelectedRaceId(null);
    setActiveTab('rules');
    showToast('Signed out successfully', 'info');
  };

  const currentSelectedRace = selectedRaceId
    ? races.find((r) => r.id === selectedRaceId) || null
    : null;

  const pendingBetsCount = myBets.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#090c12] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white relative">
      
      {/* ---------------- 1. HEADER (Top bar layout common on all pages) ---------------- */}
      <Header
        user={user}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenStatement={() => {
          loadUserFinancials();
          setIsStatementOpen(true);
        }}
        onOpenResults={() => setIsResultsOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAdmin={() => {
          setSelectedRaceId(null);
          setActiveTab('admin');
        }}
        onGoHome={() => {
          setSelectedRaceId(null);
          setActiveTab('races');
        }}
        onOpenMyBets={() => {
          setSelectedRaceId(null);
          setActiveTab('mybets');
        }}
        onOpenRules={() => {
          setSelectedRaceId(null);
          setActiveTab('rules');
        }}
        onOpenPersonalDetails={() => {
          setSelectedRaceId(null);
          setActiveTab('personal_details');
        }}
        activeTab={activeTab}
        pendingBetsCount={pendingBetsCount}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs sm:text-sm font-bold backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* ---------------- MAIN CONTAINER (PC / LAPTOP / TABLET / MOBILE) ---------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 pb-24 md:pb-7">
        {activeTab === 'admin' ? (
          /* ADMIN PANEL */
          <AdminPanel
            onBack={() => setActiveTab('races')}
            races={races}
            banners={banners}
            onRefreshData={loadRacesAndBanners}
          />
        ) : activeTab === 'personal_details' ? (
          /* FULL PERSONAL DETAILS TAB (Full User Details, Balance vs Exposure, Statement, Security) */
          <PersonalDetails
            user={user}
            bets={myBets}
            transactions={transactions}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            onGoToLobby={() => {
              setSelectedRaceId(null);
              setActiveTab('races');
            }}
          />
        ) : activeTab === 'mybets' ? (
          /* MY BETS / CONTEST SELECTIONS TAB ONLY */
          <MyBets
            bets={myBets}
            isLoading={isLoadingBets}
            oddsFormat={oddsFormat}
            onSelectRace={(raceId) => {
              setSelectedRaceId(raceId);
              setActiveTab('races');
            }}
            onGoToLobby={() => {
              setSelectedRaceId(null);
              setActiveTab('races');
            }}
          />
        ) : currentSelectedRace ? (
          /* RACE DETAIL VIEW */
          <RaceDetail
            race={currentSelectedRace}
            onBack={() => setSelectedRaceId(null)}
            onSelectBet={handleOpenBetSlip}
            userBetsForRace={myBets.filter((b) => b.race_id === currentSelectedRace.id)}
            onOpenMyBets={() => {
              setSelectedRaceId(null);
              setActiveTab('mybets');
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
            isLoggedIn={!!user}
            oddsFormat={oddsFormat}
          />
        ) : activeTab === 'rules' ? (
          /* HOW TO PLAY & RULES VIEW: Banner at top + Rules below banner */
          <div className="space-y-6">
            <BannerSlider
              banners={banners}
              onSelectRace={(raceId) => {
                setSelectedRaceId(raceId);
                setActiveTab('races');
              }}
              onOpenDeposit={() => setIsDepositOpen(true)}
            />
            <HowToPlayRules
              onGoToLobby={() => {
                soundManager.playClick();
                setActiveTab('races');
              }}
              onOpenDeposit={() => setIsDepositOpen(true)}
            />
          </div>
        ) : (
          /* MATCH LOBBY: Direct race fixtures and live betting only (no banner, clean view) */
          <RaceList
            races={races}
            onSelectRace={(raceId) => setSelectedRaceId(raceId)}
            filterStatus={raceFilter}
            onChangeFilter={setRaceFilter}
            isLoading={isLoadingRaces}
            oddsFormat={oddsFormat}
            onOpenSearch={() => setSearchModalOpen(true)}
          />
        )}
      </main>

      {/* ---------------- FOOTER (PC / Laptop Full Width) ---------------- */}
      <footer className="mt-auto border-t border-slate-800 bg-[#070a0e] py-8 text-xs text-slate-500 pb-28 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-300">Horse Racing Betting Exchange</p>
              <p className="text-[11px] text-slate-500">Live Odds, WIN / PLACE Markets & Instant Settlement Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <button onClick={() => setIsHelpOpen(true)} className="hover:text-rose-400 transition cursor-pointer">
              Betting Rules
            </button>
            <button onClick={() => setIsResultsOpen(true)} className="hover:text-rose-400 transition cursor-pointer">
              Official Results
            </button>
            <button
              onClick={() => {
                setSelectedRaceId(null);
                setActiveTab('admin');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ---------------- MODALS ---------------- */}

      {/* Search Overlay Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-rose-500" />
                Global Race Search
              </h3>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search by race name, track venue, horse, or jockey..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {races
                .filter((r) =>
                  r.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
                  r.venue.toLowerCase().includes(globalSearch.toLowerCase()) ||
                  r.horses.some((h) => h.name.toLowerCase().includes(globalSearch.toLowerCase()))
                )
                .slice(0, 6)
                .map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRaceId(r.id);
                      setActiveTab('races');
                      setSearchModalOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-between cursor-pointer transition"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{r.name}</p>
                      <p className="text-xs text-slate-400">{r.venue} • {r.race_time}</p>
                    </div>
                    <span className="text-xs text-rose-400 font-black">Open Market →</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Bet Slip Modal (SRS Spec) */}
      <BetSlipModal
        betSlip={betSlipData}
        user={user}
        onClose={() => setBetSlipData(null)}
        onSubmitBet={handleSubmitBet}
        onOpenDeposit={() => {
          setBetSlipData(null);
          setIsDepositOpen(true);
        }}
        oddsFormat={oddsFormat}
      />

      {/* Deposit Modal */}
      <DepositModal
        user={user}
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDeposit}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        user={user}
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdraw={handleWithdraw}
      />

      {/* Account Statement Modal */}
      <AccountStatementModal
        transactions={transactions}
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        isLoading={isLoadingTxs}
      />

      {/* Recent Results Modal */}
      <RecentResultsModal
        races={races}
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        onSelectRace={(raceId) => {
          setSelectedRaceId(raceId);
          setActiveTab('races');
        }}
      />

      {/* Change Password Modal */}
      {user && (
        <ChangePasswordModal
          userId={user.id}
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
        />
      )}

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Auth Modal (Sign Up with OTP + Login with Username/Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => {
          setUser(newUser);
          showToast(`Welcome @${newUser.username}!`, 'success');
          loadUserFinancials();
        }}
      />
    </div>
  );
}
