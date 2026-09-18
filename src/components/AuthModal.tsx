import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  Inbox,
  RefreshCw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'login',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid Gmail / Email address (e.g. yourname@gmail.com)');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.sendOtp({
        email: cleanEmail,
        phone: phone.trim() || undefined,
        username: username.trim() || undefined,
      });

      setOtpSent(true);
      setCountdown(60); // 60s cooldown
      setSuccessMsg(res.message || `Verification code sent to ${cleanEmail}`);

      if (res.simulated_otp) {
        setOtpHint(res.simulated_otp);
        setOtp(res.simulated_otp); // Auto-fill for convenience in test mode
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP to Gmail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !username || !password || !otp) {
      setError('Please provide your Gmail, desired username, password, and the 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.signup({
        email: cleanEmail,
        phone: phone.trim() || undefined,
        otp: otp.trim(),
        username: username.trim(),
        password: password.trim(),
      });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username / Gmail and password are required');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.login(username.trim(), password.trim());
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoUser: 'user' | 'admin') => {
    try {
      setIsLoading(true);
      setError(null);
      const uname = demoUser === 'admin' ? 'derby_admin' : 'arjun_punters';
      const pass = demoUser === 'admin' ? 'admin123' : 'pass123';
      const res = await api.login(uname, pass);
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {mode === 'signup' ? <Mail className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {mode === 'signup' ? 'Create Bettor Account' : 'Welcome to Turf Tactics'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'signup'
                  ? 'Sign up with Gmail OTP & get ₹5,000 Bonus'
                  : 'Login with Username / Gmail & Password'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-3 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-850/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Log In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`py-3 transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-850/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              Sign Up <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full font-mono">Gmail OTP</span>
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          
          {/* Quick Demo Logins Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1 uppercase tracking-wider text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Quick 1-Click Demo Logins:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Instant Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="quick-demo-user-btn"
                disabled={isLoading}
                onClick={() => handleDemoLogin('user')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Bettor (₹5k Bal)</span>
              </button>
              <button
                type="button"
                id="quick-demo-admin-btn"
                disabled={isLoading}
                onClick={() => handleDemoLogin('admin')}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Admin Manager</span>
              </button>
            </div>
          </div>

          {/* Form */}
          {mode === 'signup' ? (
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Gmail Address with Send OTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Gmail / Email Address</span>
                  <span className="text-[11px] text-amber-400/90 font-medium">OTP sent here</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. punter@gmail.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition font-sans"
                    />
                  </div>
                  <button
                    type="button"
                    id="signup-send-otp-btn"
                    disabled={isLoading || !email || countdown > 0}
                    onClick={handleSendOtp}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 font-bold text-xs border border-amber-500/30 transition cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : countdown > 0 ? (
                      <span>Resend ({countdown}s)</span>
                    ) : (
                      <span>{otpSent ? 'Resend OTP' : 'Send Gmail OTP'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Banner when OTP is sent */}
              {otpSent && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <Inbox className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div className="flex-1 text-[11px]">
                    <div className="font-semibold">Check your Gmail inbox:</div>
                    <div className="text-slate-300 truncate font-mono mt-0.5">{email}</div>
                    <div className="text-slate-400 text-[10px] mt-1">Check your Spam / Promotions folder if you don't see it immediately.</div>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              {otpSent && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Enter 6-Digit Verification Code</span>
                    {otpHint && (
                      <span className="text-emerald-400 text-[11px] font-mono">
                        Preview: {otpHint}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-otp-input"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code (e.g. 849201)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-amber-300 font-mono tracking-widest text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Unique Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Choose Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. turf_champion"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Optional Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                  <span>Mobile Phone Number</span>
                  <span className="text-[10px] text-slate-500">Optional</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                id="submit-signup-btn"
                disabled={isLoading || (!otpSent && !otp)}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Code & Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Login Screen: Username / Gmail + Password */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username or Gmail Address
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username or registered Gmail"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                id="submit-login-btn"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
