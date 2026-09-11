import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { soundManager } from '../utils/audio';
import { 
  Trophy, 
  Wallet, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  FileText, 
  Award, 
  KeyRound, 
  HelpCircle,
  Zap,
  Plus,
  Home,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenStatement: () => void;
  onOpenResults: () => void;
  onOpenChangePassword: () => void;
  onOpenHelp: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  onOpenMyBets: () => void;
  onOpenRules: () => void;
  onOpenPersonalDetails: () => void;
  activeTab: 'races' | 'rules' | 'mybets' | 'personal_details' | 'admin';
  pendingBetsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenStatement,
  onOpenResults,
  onOpenChangePassword,
  onOpenHelp,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  onGoHome,
  onOpenMyBets,
  onOpenRules,
  onOpenPersonalDetails,
  activeTab,
  pendingBetsCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    soundManager.init();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* ---------------- SLIM & SPACIOUS TOP NAVBAR ---------------- */}
      <header className="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur-md border-b border-slate-850 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-5">
          <div className="flex items-center justify-between h-13 sm:h-16 gap-1.5 sm:gap-4">
            
            {/* ---------------- LEFT: DerbyBet Turf Horse Racing Logo ---------------- */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <button 
                id="brand-logo-btn"
                onClick={() => {
                  soundManager.playClick();
                  onOpenRules();
                }}
                className="flex items-center gap-2 text-left group cursor-pointer shrink-0"
              >
                {/* Glowing Red Horse Racing Logo Box */}
                <div className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#1c080b] border-2 border-red-500 flex items-center justify-center text-red-500 group-hover:scale-105 transition shadow-[0_0_12px_rgba(239,68,68,0.5)] shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 transition-transform group-hover:scale-110"
                  >
                    <path d="M21.7 8.2c-.3-.5-.8-.8-1.4-.9l-2.8-.4c-.4-.5-1-1.1-1.8-1.6-.9-.6-2-.9-3-.7-.4.1-.7.4-.9.8l-.8 1.4-2-.7c-.8-.3-1.6 0-2.1.6l-1.6 1.8c-.4.5-.6 1.1-.5 1.7.1.6.4 1.2.9 1.5l1.6 1.1-.7 2.2c-.2.7 0 1.5.5 2 .5.5 1.3.7 2 .4l2.4-1 1.8 2.2c.4.5 1 .8 1.7.8h.4c.7-.1 1.3-.5 1.6-1.1l2.2-4.5c.3-.6.2-1.3-.2-1.8l-1.3-1.5 2-1.5c.6-.4.9-1.1.8-1.8l-.3-1.4z" />
                    <path d="M4 17l2-1.5 1.5 1.5-1.5 2H4v-2zm1.5-4L7 11.5l1.5 1-1 2-2-.5v-1z" opacity="0.7" />
                  </svg>
                </div>
                
                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold tracking-tight text-xs sm:text-base text-white whitespace-nowrap">
                      Derby<span className="text-red-500">Bet</span> <span className="text-slate-100 font-bold">Turf</span>
                    </span>
                    <span className="hidden xs:inline-block text-[8px] sm:text-[9px] px-1 py-0.2 rounded bg-[#2a0c10] text-red-400 border border-red-500/60 font-black tracking-wider uppercase">
                      TURF
                    </span>
                  </div>
                  <span className="hidden sm:block text-[10px] text-slate-400 font-normal tracking-tight">
                    Official Horse Racing Exchange
                  </span>
                </div>
              </button>

              {/* Vertical divider */}
              <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden lg:block" />
            </div>

            {/* ---------------- CENTER: Clean Nav Items (Desktop/Tablet) ---------------- */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 text-xs sm:text-sm">
              {/* 1. How to Play & Rules (FIRST / HOME) */}
              <button
                id="nav-rules-btn"
                onClick={() => {
                  soundManager.playClick();
                  onOpenRules();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'rules'
                    ? 'bg-[#220a0e] border border-red-500/60 text-red-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>How to Play & Rules</span>
              </button>

              {/* 2. Match Lobby */}
              <button
                id="nav-races-btn"
                onClick={() => {
                  soundManager.playClick();
                  onGoHome();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'races'
                    ? 'bg-[#220a0e] border border-red-500/60 text-red-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <span>Match Lobby</span>
              </button>

              {/* 3. My Selections */}
              <button
                id="nav-my-bets-btn"
                onClick={() => {
                  soundManager.playClick();
                  onOpenMyBets();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'mybets'
                    ? 'bg-[#220a0e] border border-red-500/60 text-red-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${activeTab === 'mybets' ? 'text-red-400' : 'text-amber-400'}`} />
                <span>My Selections</span>
                <span className="w-4 h-4 rounded-full bg-[#10b981] text-black font-black text-[10px] flex items-center justify-center shadow-xs">
                  {pendingBetsCount > 0 ? pendingBetsCount : 2}
                </span>
              </button>

              {/* 4. Personal Details */}
              <button
                id="nav-personal-details-btn"
                onClick={() => {
                  soundManager.playClick();
                  onOpenPersonalDetails();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'personal_details'
                    ? 'bg-[#220a0e] border border-red-500/60 text-red-400 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <UserIcon className={`w-3.5 h-3.5 ${activeTab === 'personal_details' ? 'text-red-400' : 'text-slate-400'}`} />
                <span>Personal Details</span>
              </button>

              {/* Admin Button (If Admin) */}
              {user?.role === 'admin' && (
                <button
                  id="nav-admin-btn"
                  onClick={() => {
                    soundManager.playClick();
                    onOpenAdmin();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    activeTab === 'admin'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/50'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              )}
            </nav>

            {/* ---------------- RIGHT: Spacious Wallet & Profile with Red Accents ---------------- */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              
              {user ? (
                <>
                  {/* Mobile Compact Wallet Pill (< sm) */}
                  <div className="flex sm:hidden items-center gap-1 bg-[#0c1018] border border-slate-800 rounded-lg p-1 pr-1.5 shadow-inner">
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onOpenDeposit();
                      }}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                      title="Deposit / Add Funds"
                    >
                      <div className="w-5 h-5 rounded bg-[#062118] border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shrink-0">
                        <Wallet className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-black text-white font-mono tracking-tight">
                        ₹{user.balance.toLocaleString('en-IN')}
                      </span>
                      <div className="w-4 h-4 rounded bg-red-600 text-white flex items-center justify-center font-bold text-[10px] ml-0.5 shadow-sm">
                        +
                      </div>
                    </button>
                  </div>

                  {/* Desktop / Tablet Full Wallet Pill (sm+) */}
                  <div className="hidden sm:flex items-center gap-2 bg-[#0c1018] border border-slate-800 rounded-xl p-1 pl-2.5 shadow-inner">
                    {/* Emerald Wallet Box */}
                    <div className="w-6 h-6 rounded-md bg-[#062118] border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shrink-0">
                      <Wallet className="w-3 h-3" />
                    </div>

                    {/* Balance Stack */}
                    <div className="leading-tight pr-1">
                      <p className="text-[7.5px] font-bold text-slate-400 tracking-wider uppercase">WALLET</p>
                      <p className="text-xs sm:text-sm font-black text-white font-mono tracking-tight">
                        ₹{user.balance.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Glowing Red "+ Add ₹" Button */}
                    <button
                      id="header-deposit-btn"
                      onClick={() => {
                        soundManager.playClick();
                        onOpenDeposit();
                      }}
                      className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-[0_0_12px_rgba(239,68,68,0.45)] active:scale-95 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Add ₹</span>
                    </button>
                  </div>

                  {/* Profile Avatar with Glowing Red Border */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      id="profile-dropdown-btn"
                      onClick={() => {
                        soundManager.playClick();
                        setDropdownOpen(!dropdownOpen);
                      }}
                      className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl overflow-hidden border-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] hover:scale-105 transition cursor-pointer flex items-center justify-center shrink-0"
                      title="Personal Details & Account"
                    >
                      <img
                        src={user.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                        alt={user.username}
                        className="w-full h-full object-cover bg-slate-800"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[#0c1018] border border-slate-850 shadow-2xl py-2 z-50 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3.5 py-2 border-b border-slate-800 mb-1">
                          <p className="text-[11px] text-slate-400">Signed in as</p>
                          <p className="text-xs sm:text-sm font-black text-white truncate">@{user.username}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">📞 {user.phone}</p>
                          <div className="flex items-center justify-between text-[10px] mt-1.5 pt-1.5 border-t border-slate-800/80">
                            <span className="text-slate-400">Exposure:</span>
                            <span className="font-mono font-bold text-rose-400">₹{user.exposure.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <button
                          id="dropdown-personal-details-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenPersonalDetails();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-red-400 hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-red-400" />
                          Full Personal Details
                        </button>

                        <button
                          id="dropdown-deposit-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenDeposit();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                          Deposit / Add Funds
                        </button>

                        <button
                          id="dropdown-withdraw-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenWithdraw();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                        >
                          <Wallet className="w-3.5 h-3.5 text-slate-400" />
                          Withdraw Funds
                        </button>

                        <button
                          id="dropdown-statement-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenStatement();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          Account Statement
                        </button>

                        <button
                          id="dropdown-results-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenResults();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          Recent Results
                        </button>

                        <button
                          id="dropdown-mybets-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenMyBets();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          My Selections ({pendingBetsCount})
                        </button>

                        <button
                          id="dropdown-password-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenChangePassword();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                          Change Password
                        </button>

                        <button
                          id="dropdown-help-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenRules();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium hover:bg-slate-800 hover:text-white flex items-center gap-2 transition cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          How to Play & Rules
                        </button>

                        {user.role === 'admin' && (
                          <button
                            id="dropdown-admin-btn"
                            onClick={() => {
                              setDropdownOpen(false);
                              soundManager.playClick();
                              onOpenAdmin();
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-950/40 flex items-center gap-2 transition cursor-pointer border-t border-slate-800 mt-1"
                          >
                            <Shield className="w-3.5 h-3.5 text-indigo-400" />
                            Admin Dashboard
                          </button>
                        )}

                        <div className="border-t border-slate-800 mt-1 pt-1">
                          <button
                            id="dropdown-logout-btn"
                            onClick={() => {
                              setDropdownOpen(false);
                              soundManager.playClick();
                              onLogout();
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-400" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  id="header-login-btn"
                  onClick={() => {
                    soundManager.playClick();
                    onOpenAuth();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-[0_0_12px_rgba(239,68,68,0.45)] transition active:scale-95 cursor-pointer"
                >
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- MOBILE FIXED BOTTOM NAVIGATION (4 Spacious Tabs, Rules First, No Add Button) ---------------- */}
      <nav 
        id="mobile-static-bottom-nav"
        className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#07090e]/95 backdrop-blur-xl border-t border-slate-850 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.85)]"
      >
        <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
          {/* 1. How to Play & Rules (FIRST / HOME TAB) */}
          <button
            id="mobile-nav-rules"
            onClick={() => {
              soundManager.playClick();
              onOpenRules();
            }}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              activeTab === 'rules'
                ? 'text-red-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4.5 h-4.5" />
            <span className="text-[9.5px] mt-0.5 tracking-tight font-medium">How to Play</span>
          </button>

          {/* 2. Match Lobby */}
          <button
            id="mobile-nav-lobby"
            onClick={() => {
              soundManager.playClick();
              onGoHome();
            }}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              activeTab === 'races'
                ? 'text-red-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[9.5px] mt-0.5 tracking-tight font-medium">Match Lobby</span>
          </button>

          {/* 3. My Selections */}
          <button
            id="mobile-nav-selections"
            onClick={() => {
              soundManager.playClick();
              onOpenMyBets();
            }}
            className={`flex flex-col items-center justify-center py-1 transition relative cursor-pointer ${
              activeTab === 'mybets'
                ? 'text-red-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Trophy className={`w-4.5 h-4.5 ${activeTab === 'mybets' ? 'text-red-500' : 'text-amber-400'}`} />
              <span className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 rounded-full bg-[#10b981] text-black font-black text-[8px] flex items-center justify-center">
                {pendingBetsCount > 0 ? pendingBetsCount : 2}
              </span>
            </div>
            <span className="text-[9.5px] mt-0.5 tracking-tight font-medium">Selections</span>
          </button>

          {/* 4. Personal Details */}
          <button
            id="mobile-nav-profile"
            onClick={() => {
              soundManager.playClick();
              if (user) {
                onOpenPersonalDetails();
              } else {
                onOpenAuth();
              }
            }}
            className={`flex flex-col items-center justify-center py-1 transition cursor-pointer ${
              activeTab === 'personal_details'
                ? 'text-red-500 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {user ? (
              <img
                src={user.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.username}
                className={`w-4.5 h-4.5 rounded-md object-cover ring-1 ${
                  activeTab === 'personal_details' ? 'ring-red-500 ring-2' : 'ring-red-500/60'
                }`}
              />
            ) : (
              <UserIcon className="w-4.5 h-4.5" />
            )}
            <span className="text-[9.5px] mt-0.5 tracking-tight font-medium">Personal Details</span>
          </button>
        </div>
      </nav>
    </>
  );
};
