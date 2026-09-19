import React, { useState, useEffect } from 'react';
import { Banner, Race, User } from '../types';
import { AdminPanel } from './AdminPanel';
import { soundManager } from '../utils/audio';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  ArrowLeft, 
  LogOut, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Sliders,
  Sparkles
} from 'lucide-react';

interface SubAdminPortalProps {
  onBack: () => void;
  races: Race[];
  banners: Banner[];
  onRefreshData: () => Promise<void>;
  onImpersonateUser?: (user: User) => void;
}

export const SubAdminPortal: React.FC<SubAdminPortalProps> = ({
  onBack,
  races,
  banners,
  onRefreshData,
  onImpersonateUser,
}) => {
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(() => {
    try {
      const isAuth = sessionStorage.getItem('derby_admin_authenticated') === 'true';
      const role = sessionStorage.getItem('derby_admin_role');
      return isAuth && role === 'ODDS_MANAGER';
    } catch {
      return false;
    }
  });

  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    soundManager.init();
  }, []);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const trimmedUser = staffUsername.trim().toLowerCase();
      const trimmedPass = staffPassword.trim();

      // Check sub-admins from localStorage & system settings
      let matchedSubAdmin: any = null;
      try {
        const rawSub = localStorage.getItem('derby_sub_admins');
        const rawSettings = localStorage.getItem('derby_system_settings');
        let subList: any[] = [];
        if (rawSub) subList = [...subList, ...JSON.parse(rawSub)];
        if (rawSettings) {
          const s = JSON.parse(rawSettings);
          if (s.sub_admins) subList = [...subList, ...s.sub_admins];
        }
        matchedSubAdmin = subList.find((sa: any) => 
          sa.username?.toLowerCase() === trimmedUser &&
          (sa.password ? sa.password === trimmedPass : (trimmedPass === 'staff123' || trimmedPass === 'admin123' || trimmedPass === trimmedUser))
        );
      } catch {}

      if (matchedSubAdmin) {
        soundManager.playWinPayout();
        setIsStaffLoggedIn(true);
        sessionStorage.setItem('derby_admin_authenticated', 'true');
        sessionStorage.setItem('derby_admin_user', matchedSubAdmin.username);
        sessionStorage.setItem('derby_admin_role', matchedSubAdmin.role || 'ODDS_MANAGER');
        sessionStorage.setItem('derby_admin_name', matchedSubAdmin.name || matchedSubAdmin.username);
      } else {
        soundManager.playClick();
        setErrorMsg('Invalid Operating Staff credentials. Access denied. Please contact Master Administrator.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleStaffLogout = () => {
    soundManager.playClick();
    setIsStaffLoggedIn(false);
    sessionStorage.removeItem('derby_admin_authenticated');
    sessionStorage.removeItem('derby_admin_user');
    sessionStorage.removeItem('derby_admin_role');
    sessionStorage.removeItem('derby_admin_name');
    window.location.hash = '#/';
    onBack();
  };

  const currentAdminName = sessionStorage.getItem('derby_admin_name') || 'Operating Staff';

  // If Staff is Authenticated -> Render Restricted Staff Management Panel
  if (isStaffLoggedIn) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Top Staff Status & Exit Bar */}
        <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#0c0d1e] border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-xs sm:text-base font-black text-white tracking-tight">DERBYBET TURF — STAFF & OPERATOR DESK</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] sm:text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  Staff Active
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Logged in as <span className="text-white font-bold">{currentAdminName}</span> • Limited Access (Odds Management & Runner Suspensions Only)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                soundManager.playClick();
                window.location.hash = '#/';
                onBack();
              }}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public View</span>
            </button>

            <button
              onClick={handleStaffLogout}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/40 flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Staff Panel with strict RBAC restrictions */}
        <AdminPanel
          onBack={() => {
            window.location.hash = '#/';
            onBack();
          }}
          races={races}
          banners={banners}
          onRefreshData={onRefreshData}
          onImpersonateUser={onImpersonateUser}
        />
      </div>
    );
  }

  // If Staff is NOT Authenticated -> Dedicated Sub-Admin / Staff Login Gate
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#090b14] border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Staff Icon Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#0e1026] border-2 border-indigo-500 flex items-center justify-center text-indigo-400 mx-auto shadow-[0_0_25px_rgba(99,102,241,0.5)]">
            <Sliders className="w-8 h-8" />
          </div>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 text-[10px] font-black uppercase tracking-wider mt-2">
            Operating Staff & Odds Desk Portal
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            DerbyBet <span className="text-indigo-400">Staff Portal</span>
          </h2>
          <p className="text-xs text-slate-400">
            Sign in with your designated sub-admin staff credentials to manage live odds, runner suspensions, and race market states.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-xs font-bold flex items-center gap-2 animate-in shake duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleStaffLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Staff Username</span>
            </label>
            <input
              type="text"
              required
              value={staffUsername}
              onChange={(e) => setStaffUsername(e.target.value)}
              placeholder="e.g. suresh_odds"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-indigo-500 transition shadow-inner font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Staff Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder="Enter staff password"
                className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-indigo-500 transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Staff accounts are created by the Master Administrator in System Control.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white text-sm font-black shadow-[0_0_20px_rgba(99,102,241,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying Staff Credentials...</span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Open Operator Console</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Master Admin / Return to Turf */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2 text-center">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              window.location.hash = '#/admin';
            }}
            className="text-xs text-amber-400 hover:text-amber-300 transition font-bold block mx-auto cursor-pointer"
          >
            Master Administrator? Go to Master Admin Portal →
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              window.location.hash = '#/';
              onBack();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 transition font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Turf</span>
          </button>
        </div>
      </div>
    </div>
  );
};
