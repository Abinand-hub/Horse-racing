import React, { useState } from 'react';
import { Bet, Transaction, User } from '../types';
import { soundManager } from '../utils/audio';
import { 
  User as UserIcon, 
  Wallet, 
  Shield, 
  Coins, 
  TrendingUp, 
  KeyRound, 
  FileText, 
  Award, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  Fingerprint,
  Eye,
  EyeOff,
  Lock,
  Zap,
  Plus,
  Trophy,
  Sparkles,
  LogOut
} from 'lucide-react';

interface PersonalDetailsProps {
  user: User | null;
  bets: Bet[];
  transactions: Transaction[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenChangePassword: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoToLobby: () => void;
}

export const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  user,
  bets,
  transactions,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenChangePassword,
  onOpenAuth,
  onLogout,
  onGoToLobby,
}) => {
  const [activeTab, setActiveTab] = useState<'statement' | 'security'>('statement');
  const [showPassword, setShowPassword] = useState(false);

  if (!user) {
    return (
      <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-8 text-center space-y-4 max-w-md mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In to View Personal Details</h2>
        <p className="text-xs text-slate-400">
          Access your personal profile, registration credentials, wallet statement, and contest stats.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const totalStake = bets.reduce((acc, b) => acc + b.stake, 0);
  const totalPayout = bets.reduce((acc, b) => acc + (b.payout || 0), 0);
  const wonCount = bets.filter((b) => b.status === 'WON').length;
  const pendingCount = bets.filter((b) => b.status === 'PENDING').length;
  const withdrawTxs = transactions.filter((t) => t.type === 'WITHDRAW');
  const totalWithdrawals = withdrawTxs.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  // User Credentials
  const refId = user.ref_id || 'usr_arjun';
  const fullName = user.full_name || 'Arjun Kumar';
  const phoneNumber = user.phone || '9876543210';
  const emailAddress = user.email || 'arjun.punters@gmail.com';
  const userPassword = user.password || '••••••••';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto">
      
      {/* ---------------- 1. USER PROFILE HEADER CARD ---------------- */}
      <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar with glowing red border */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] shrink-0 bg-slate-900">
              <img
                src={user.profile_photo || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  @{user.username}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  ✓ Verified Punter
                </span>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase">
                    Admin
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>+91 {phoneNumber}</span>
                <span className="text-slate-600">•</span>
                <span>{emailAddress}</span>
              </p>

              <p className="text-[11px] text-slate-500">
                User ID: <span className="font-mono text-slate-400">{refId}</span> • Member Since: {new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Quick Wallet Action Buttons */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenDeposit();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Add Money</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenWithdraw();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- 2. SECTION: PERSONAL DETAILS & REGISTRATION INFO (Matching Example Image) ---------------- */}
      <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Personal Details & Registration Info
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Your official account credentials and platform identity
          </p>
        </div>

        {/* 2-Column Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. USER / REF ID */}
          <div className="bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                USER / REF ID
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                {refId}
              </span>
            </div>
          </div>

          {/* 2. FULL NAME */}
          <div className="bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                FULL NAME
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-0.5 block">
                {fullName}
              </span>
            </div>
          </div>

          {/* 3. PHONE NUMBER */}
          <div className="bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                PHONE NUMBER
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
                {phoneNumber}
              </span>
            </div>
          </div>

          {/* 4. EMAIL ADDRESS */}
          <div className="bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="leading-tight truncate">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                EMAIL ADDRESS
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block truncate">
                {emailAddress}
              </span>
            </div>
          </div>

          {/* 5. PASSWORD (Spanning full width with Show/Hide) */}
          <div className="md:col-span-2 bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 flex items-center justify-between gap-3.5 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  PASSWORD
                </span>
                <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block tracking-wider">
                  {showPassword ? (userPassword || 'pass123') : '••••••••'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setShowPassword(!showPassword);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Show</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onOpenChangePassword();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 text-xs font-bold transition cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 3. SECTION: CONTESTS & FINANCIAL ACTIVITY (Matching Example Image) ---------------- */}
      <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Contests & Financial Activity
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time statistics on your predictions and payouts
          </p>
        </div>

        {/* 4 Metric Cards in Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. CONTESTS PLAYED */}
          <div className="bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 shadow-md space-y-1 relative">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CONTESTS PLAYED
              </p>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white font-mono">
              {bets.length > 0 ? bets.length : 4}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Total selections</p>
          </div>

          {/* 2. CONTEST WON */}
          <div className="bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 shadow-md space-y-1 relative">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                CONTEST WON
              </p>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {wonCount}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Winning entries</p>
          </div>

          {/* 3. TOTAL PAYOUT EARNED */}
          <div className="bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 shadow-md space-y-1 relative">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                TOTAL PAYOUT EARNED
              </p>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              ₹{totalPayout.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Disbursed winnings</p>
          </div>

          {/* 4. TOTAL MONEY WITHDRAWN */}
          <div className="bg-[#07090e] rounded-2xl border border-slate-800/80 p-4 shadow-md space-y-1 relative">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                TOTAL MONEY WITHDRAWN
              </p>
              <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
              ₹{totalWithdrawals.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {withdrawTxs.length} transfers to UPI
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- 4. SECTION: WALLET LIQUIDITY & STATEMENT LEDGER ---------------- */}
      <div className="bg-[#0c1018] rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" />
              <span>Wallet Ledger & Account Statement</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant audit trail of your UPI deposits, winnings, stakes, and withdrawals
            </p>
          </div>

          {/* Liquid Balance pill */}
          <div className="flex items-center gap-3 bg-[#07090e] p-2 px-3 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Available Liquid Balance</p>
              <p className="text-sm font-black text-emerald-400 font-mono">₹{user.balance.toLocaleString('en-IN')}</p>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Active Exposure</p>
              <p className="text-sm font-black text-rose-400 font-mono">₹{user.exposure.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Transaction History Ledger */}
        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No transactions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-850 overflow-x-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    tx.type === 'DEPOSIT' || tx.type === 'WIN'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'WIN' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{tx.description}</p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(tx.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <p className={`font-black text-sm ${
                    tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {tx.amount > 0 ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${Math.abs(tx.amount).toLocaleString('en-IN')}`}
                  </p>
                  <p className="text-[10px] text-slate-500">Balance: ₹{tx.balance_after.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- 5. SECTION: SECURITY & LOGOUT ---------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c1018] rounded-2xl border border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-500 border border-red-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Security & Active Sessions</h4>
            <p className="text-xs text-slate-400">Manage credentials or sign out of your account on this device</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenChangePassword}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-red-500" />
            <span>Update Password</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

    </div>
  );
};
