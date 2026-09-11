import React, { useState, useEffect } from 'react';
import { Banner, Race } from '../types';
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
  EyeOff
} from 'lucide-react';

interface AdminPortalProps {
  onBack: () => void;
  races: Race[];
  banners: Banner[];
  onRefreshData: () => Promise<void>;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onBack,
  races,
  banners,
  onRefreshData,
}) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('derby_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    soundManager.init();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      // Valid admin credentials check
      const trimmedUser = adminUsername.trim().toLowerCase();
      const trimmedPass = adminPassword.trim();

      const isValid = 
        (trimmedUser === 'admin' && (trimmedPass === 'admin123' || trimmedPass === 'admin@derby2026' || trimmedPass === 'admin')) ||
        (trimmedUser === 'derby_admin' && (trimmedPass === 'admin123' || trimmedPass === 'pass123'));

      if (isValid) {
        soundManager.playWinPayout();
        setIsAdminLoggedIn(true);
        sessionStorage.setItem('derby_admin_authenticated', 'true');
        sessionStorage.setItem('derby_admin_user', trimmedUser);
      } else {
        soundManager.playClick();
        setErrorMsg('Invalid Administrator credentials. Access denied.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleAdminLogout = () => {
    soundManager.playClick();
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('derby_admin_authenticated');
    sessionStorage.removeItem('derby_admin_user');
    window.location.hash = '#/';
    onBack();
  };

  // If Admin is Authenticated -> Render Full Admin Dashboard with Admin Header Bar
  if (isAdminLoggedIn) {
    return (
      <div className="space-y-6">
        {/* Top Admin Status & Exit Bar */}
        <div className="p-4 rounded-3xl bg-[#14080b] border border-red-500/40 flex flex-wrap items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">DERBYBET TURF — ADMIN CONSOLE</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Session
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <strong className="text-red-400 font-mono">@{sessionStorage.getItem('derby_admin_user') || 'admin'}</strong> • Full Administrative Privileges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                window.location.hash = '#/';
                onBack();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Public Turf View</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold border border-red-500/40 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Admin</span>
            </button>
          </div>
        </div>

        {/* Main Admin Management Panel */}
        <AdminPanel
          onBack={() => {
            window.location.hash = '#/';
            onBack();
          }}
          races={races}
          banners={banners}
          onRefreshData={onRefreshData}
        />
      </div>
    );
  }

  // If Admin is NOT Authenticated -> Render High-Security Admin Login Gate
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-[#0d1017] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Security Shield Icon Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#1c080b] border-2 border-red-500 flex items-center justify-center text-red-500 mx-auto shadow-[0_0_25px_rgba(239,68,68,0.5)]">
            <Shield className="w-8 h-8" />
          </div>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-wider mt-2">
            Restricted Staff Access Only
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            DerbyBet <span className="text-red-500">Admin Portal</span>
          </h2>
          <p className="text-xs text-slate-400">
            Enter authorized master administrator credentials to access race operations, market odds, and financial settlements.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2 animate-in shake duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>Admin Username</span>
            </label>
            <input
              type="text"
              required
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-red-500 transition shadow-inner"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              <span>Admin Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password (e.g. admin123)"
                className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-red-500 transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Default password: <code className="text-red-400 font-mono">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white text-sm font-black shadow-[0_0_20px_rgba(239,68,68,0.5)] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Open Management Console</span>
              </>
            )}
          </button>
        </form>

        {/* Back to Home Button */}
        <div className="pt-2 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              window.location.hash = '#/';
              onBack();
            }}
            className="text-xs text-slate-400 hover:text-slate-200 transition font-bold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Turf</span>
          </button>
        </div>
      </div>
    </div>
  );
};
