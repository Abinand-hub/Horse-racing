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
  BookOpen,
  Bell
} from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenStatement: () => void;
  onOpenResults: () => void;
  onOpenChangePassword: () => void;
  onOpenHelp: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  onOpenMyBets: () => void;
  onOpenRules: () => void;
  onOpenPersonalDetails: () => void;
  onOpenNotifications: () => void;
  activeTab: 'races' | 'rules' | 'mybets' | 'personal_details' | 'admin';
  pendingBetsCount: number;
  unreadNotificationsCount?: number;
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
  onOpenNotifications,
  activeTab,
  pendingBetsCount,
  unreadNotificationsCount = 0,
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
      <header className="sticky top-0 z-40 bg-[#060b08]/95 backdrop-blur-md border-b border-emerald-900/40 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-5">
          <div className="flex items-center justify-between h-13 sm:h-16 gap-1.5 sm:gap-4">
            
            {/* ---------------- LEFT: DerbyBet Turf Horse Racing Logo ---------------- */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <button 
                id="brand-logo-btn"
                onClick={() => {
                  soundManager.playClick();
                  onGoHome();
                }}
                className="flex items-center gap-2 text-left group cursor-pointer shrink-0"
              >
                {/* Glowing Royal Ascot Gold Horse Racing Logo Box */}
                <div className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#0b1712] border-2 border-[#e5b869] flex items-center justify-center text-[#e5b869] group-hover:scale-105 transition shadow-[0_0_15px_rgba(229,184,105,0.4)] shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5b869] transition-transform group-hover:scale-110"
                  >
                    <path d="M21.7 8.2c-.3-.5-.8-.8-1.4-.9l-2.8-.4c-.4-.5-1-1.1-1.8-1.6-.9-.6-2-.9-3-.7-.4.1-.7.4-.9.8l-.8 1.4-2-.7c-.8-.3-1.6 0-2.1.6l-1.6 1.8c-.4.5-.6 1.1-.5 1.7.1.6.4 1.2.9 1.5l1.6 1.1-.7 2.2c-.2.7 0 1.5.5 2 .5.5 1.3.7 2 .4l2.4-1 1.8 2.2c.4.5 1 .8 1.7.8h.4c.7-.1 1.3-.5 1.6-1.1l2.2-4.5c.3-.6.2-1.3-.2-1.8l-1.3-1.5 2-1.5c.6-.4.9-1.1.8-1.8l-.3-1.4z" />
                    <path d="M4 17l2-1.5 1.5 1.5-1.5 2H4v-2zm1.5-4L7 11.5l1.5 1-1 2-2-.5v-1z" opacity="0.7" />
                  </svg>
                </div>
                
                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold tracking-tight text-xs sm:text-base text-white whitespace-nowrap">
                      Derby<span className="text-[#e5b869]">Bet</span> <span className="text-emerald-400 font-bold">Turf</span>
                    </span>
                    <span className="hidden xs:inline-block text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded bg-[#0a1f16] text-emerald-400 border border-emerald-500/50 font-black tracking-wider uppercase">
                      TURF
                    </span>
                  </div>
                  <span className="hidden sm:block text-[10px] text-slate-400 font-normal tracking-tight">
                    Official Horse Racing Exchange
                  </span>
                </div>
              </button>

              {/* Vertical divider */}
              <div className="h-6 w-[1px] bg-emerald-900/30 mx-1 hidden lg:block" />
            </div>

            {/* ---------------- CENTER: Clean Nav Items (Desktop/Tablet) ---------------- */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-3.5 text-xs sm:text-sm">
              {/* 1. Home (Primary) */}
              <button
                id="nav-home-btn"
                onClick={() => {
                  soundManager.playClick();
                  onGoHome();
                }}
                className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'races'
                    ? 'bg-[#18160c] border border-[#e5b869]/70 text-[#e5b869] shadow-[0_0_12px_rgba(229,184,105,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/30'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              {/* 2. My Selections */}
              <button
                id="nav-my-bets-btn"
                onClick={() => {
                  soundManager.playClick();
                  onOpenMyBets();
                }}
                className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'mybets'
                    ? 'bg-[#18160c] border border-[#e5b869]/70 text-[#e5b869] shadow-[0_0_12px_rgba(229,184,105,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/30'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${activeTab === 'mybets' ? 'text-[#e5b869]' : 'text-amber-400'}`} />
                <span>My Selections</span>
                <span className="w-4 h-4 rounded-full bg-[#10b981] text-black font-black text-[10px] flex items-center justify-center shadow-xs">
                  {pendingBetsCount > 0 ? pendingBetsCount : 2}
                </span>
              </button>

              {/* 3. Personal Details */}
              <button
                id="nav-personal-details-btn"
                onClick={() => {
                  soundManager.playClick();
                  onOpenPersonalDetails();
                }}
                className={`px-4 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'personal_details'
                    ? 'bg-[#18160c] border border-[#e5b869]/70 text-[#e5b869] shadow-[0_0_12px_rgba(229,184,105,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/30'
                }`}
              >
                <UserIcon className={`w-3.5 h-3.5 ${activeTab === 'personal_details' ? 'text-[#e5b869]' : 'text-slate-400'}`} />
                <span>Personal Details</span>
              </button>
            </nav>

            {/* ---------------- RIGHT: Spacious Wallet & Profile with Gold & Emerald Accents ---------------- */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              
              {user ? (
                <>
                  {/* Mobile Compact Wallet Pill (< sm) */}
                  <div className="flex sm:hidden items-center gap-1 bg-[#091510] border border-emerald-900/50 rounded-lg p-1 pr-1.5 shadow-inner">
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
                      <div className="w-4 h-4 rounded bg-gradient-to-r from-amber-500 to-[#e5b869] text-black flex items-center justify-center font-black text-[10px] ml-0.5 shadow-sm">
                        +
                      </div>
                    </button>
                  </div>

                  {/* Desktop / Tablet Full Wallet Pill (sm+) */}
                  <div className="hidden sm:flex items-center gap-2 bg-[#091510] border border-emerald-900/60 rounded-xl p-1 pl-2.5 shadow-inner">
                    {/* Emerald Wallet Box */}
                    <div className="w-6 h-6 rounded-md bg-[#062118] border border-[#10b981]/50 flex items-center justify-center text-[#10b981] shrink-0">
                      <Wallet className="w-3 h-3" />
                    </div>

                    {/* Balance Stack */}
                    <div className="leading-tight pr-1">
                      <p className="text-[7.5px] font-bold text-emerald-400/80 tracking-wider uppercase">WALLET</p>
                      <p className="text-xs sm:text-sm font-black text-white font-mono tracking-tight">
                        ₹{user.balance.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Glowing Gold "+ Add ₹" Button */}
                    <button
                      id="header-deposit-btn"
                      onClick={() => {
                        soundManager.playClick();
                        onOpenDeposit();
                      }}
                      className="flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e5b869] hover:from-[#c5a028] hover:to-[#d4af37] text-black text-xs font-black shadow-[0_0_12px_rgba(229,184,105,0.4)] active:scale-95 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Add ₹</span>
                    </button>
                  </div>

                  {/* Notification Bell Icon Button */}
                  <button
                    id="header-notification-btn"
                    onClick={() => {
                      soundManager.playClick();
                      onOpenNotifications();
                    }}
                    className="relative w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#091510] border border-emerald-900/60 hover:border-emerald-500/80 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition cursor-pointer shadow-sm"
                    title="Activity Notifications"
                  >
                    <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#e5b869] text-black font-black text-[9px] flex items-center justify-center shadow-md animate-bounce">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Profile Avatar with Glowing Gold Border */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      id="profile-dropdown-btn"
                      onClick={() => {
                        soundManager.playClick();
                        setDropdownOpen(!dropdownOpen);
                      }}
                      className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl overflow-hidden border-2 border-[#e5b869] shadow-[0_0_12px_rgba(229,184,105,0.35)] hover:scale-105 transition cursor-pointer flex items-center justify-center shrink-0"
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
                          id="dropdown-notifications-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            soundManager.playClick();
                            onOpenNotifications();
                          }}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Notifications</span>
                          </div>
                          {unreadNotificationsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[#e5b869] text-black">
                              {unreadNotificationsCount} new
                            </span>
                          )}
                        </button>

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
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    id="header-login-btn"
                    onClick={() => {
                      soundManager.playClick();
                      onOpenAuth('login');
                    }}
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition active:scale-95 cursor-pointer"
                  >
                    <span>Log In</span>
                  </button>
                  <button
                    id="header-register-btn"
                    onClick={() => {
                      soundManager.playClick();
                      onOpenAuth('signup');
                    }}
                    className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black shadow-[0_0_12px_rgba(245,158,11,0.35)] transition active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>Register (OTP)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ---------------- MOBILE FIXED BOTTOM NAVIGATION (3 Spacious Tabs: Home, Selections, Personal Details) ---------------- */}
      <nav 
        id="mobile-static-bottom-nav"
        className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[#060b08]/95 backdrop-blur-xl border-t border-emerald-900/40 px-2 py-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.9)]"
      >
        <div className="grid grid-cols-3 gap-1 items-center max-w-md mx-auto">
          {/* 1. Home (Race Lobby) */}
          <button
            id="mobile-nav-home"
            onClick={() => {
              soundManager.playClick();
              onGoHome();
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition cursor-pointer ${
              activeTab === 'races'
                ? 'text-[#e5b869] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Home</span>
          </button>

          {/* 2. My Selections */}
          <button
            id="mobile-nav-selections"
            onClick={() => {
              soundManager.playClick();
              onOpenMyBets();
            }}
            className={`flex flex-col items-center justify-center py-1.5 transition relative cursor-pointer ${
              activeTab === 'mybets'
                ? 'text-[#e5b869] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Trophy className={`w-5 h-5 ${activeTab === 'mybets' ? 'text-[#e5b869]' : 'text-amber-400'}`} />
              <span className="absolute -top-1.5 -right-2.5 w-3.5 h-3.5 rounded-full bg-[#10b981] text-black font-black text-[8px] flex items-center justify-center">
                {pendingBetsCount > 0 ? pendingBetsCount : 2}
              </span>
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Selections</span>
          </button>

          {/* 3. Personal Details */}
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
            className={`flex flex-col items-center justify-center py-1.5 transition cursor-pointer ${
              activeTab === 'personal_details'
                ? 'text-[#e5b869] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {user ? (
              <img
                src={user.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.username}
                className={`w-5 h-5 rounded-md object-cover ring-1 ${
                  activeTab === 'personal_details' ? 'ring-[#e5b869] ring-2' : 'ring-emerald-500/60'
                }`}
              />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">Personal Details</span>
          </button>
        </div>
      </nav>
    </>
  );
};
