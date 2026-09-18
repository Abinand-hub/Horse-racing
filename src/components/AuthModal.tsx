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
  RefreshCw,
  HelpCircle,
  Check
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultMode?: 'login' | 'signup' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'login',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(defaultMode);

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpHint, setForgotOtpHint] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Shared state
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

  // Reset state on modal open or mode change
  const switchMode = (newMode: 'login' | 'signup' | 'forgot_password') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setCountdown(0);
  };

  // 1. Send OTP for Sign Up
  const handleSendSignupOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!fullName.trim()) {
      setError('Please enter your full name first');
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid Gmail / Email address');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError('Please enter a valid phone number (min 8 digits)');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.sendOtp({
        email: cleanEmail,
        phone: phone.trim(),
        username: fullName.trim(),
      });

      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(`Verification code sent to your Gmail: ${cleanEmail}`);

      if (res.simulated_otp) {
        setOtpHint(res.simulated_otp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP to Gmail');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Complete Sign Up
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();

    if (!fullName.trim() || !cleanEmail || !phone.trim()) {
      setError('Please fill out your Name, Gmail, and Phone Number');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code sent to your Gmail');
      return;
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('Please choose a username (at least 3 characters)');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.signup({
        full_name: fullName.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        otp: otp.trim(),
        username: cleanUsername,
        password: password.trim(),
      });

      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit Log In (Username + Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter your Username/Gmail and Password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.login(loginIdentifier.trim(), loginPassword.trim());
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials. Only registered users can log in.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Send OTP for Forgot Password
  const handleSendForgotOtp = async () => {
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered Gmail address or username');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await api.forgotPasswordSendOtp(cleanEmail);
      setForgotOtpSent(true);
      setCountdown(60);
      setSuccessMsg(res.message || 'Reset code sent to your Gmail inbox');

      if (res.simulated_otp) {
        setForgotOtpHint(res.simulated_otp);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Submit Forgot Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your registered Gmail or username');
      return;
    }
    if (!forgotOtp.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.forgotPasswordReset({
        email: forgotEmail.trim().toLowerCase(),
        otp: forgotOtp.trim(),
        new_password: newPassword.trim(),
      });

      setSuccessMsg('Password reset successfully! Please sign in with your new password.');
      setMode('login');
      setLoginIdentifier(forgotEmail.trim());
      setLoginPassword('');
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {mode === 'signup' && <Mail className="w-4 h-4" />}
              {mode === 'login' && <ShieldCheck className="w-4 h-4" />}
              {mode === 'forgot_password' && <KeyRound className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {mode === 'signup' && 'Create Bettor Account'}
                {mode === 'login' && 'Sign In to DerbyBet'}
                {mode === 'forgot_password' && 'Reset Password (OTP)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'signup' && 'Sign up with Name, Gmail (OTP) & Phone'}
                {mode === 'login' && 'Enter your Username & Password to continue'}
                {mode === 'forgot_password' && 'Verify your Gmail to set a new password'}
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

        {/* Navigation Mode Tabs */}
        {mode !== 'forgot_password' ? (
          <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-3 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-850/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Screen 2: Log In</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-3 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-slate-850/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Screen 1: Sign Up (OTP)</span>
            </button>
          </div>
        ) : (
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Password Recovery
            </span>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-slate-400 hover:text-white font-medium hover:underline cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ---------------- SCREEN 1: SIGN UP (OTP) ---------------- */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* 1. Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-name-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name (e.g. Rahul Sharma)"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* 2. Gmail / Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Gmail / Email Address</span>
                  <span className="text-[10px] text-amber-400 font-mono">OTP will be sent here</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition font-sans"
                    />
                  </div>
                  <button
                    type="button"
                    id="signup-send-otp-btn"
                    disabled={isLoading || !email || countdown > 0}
                    onClick={handleSendSignupOtp}
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

              {/* 3. Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* OTP Notice & Input */}
              {otpSent && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-amber-500/40 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Inbox className="w-3.5 h-3.5 text-amber-400" />
                      Enter 6-Digit OTP Code
                    </span>
                    {otpHint && (
                      <span className="text-emerald-400 text-[10px] font-mono">
                        Preview: {otpHint}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="signup-otp-input"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-amber-500/60 text-amber-300 font-mono tracking-widest text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* 4. Username (Unique) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Create Unique Username</span>
                  <span className="text-[10px] text-slate-500">For Login</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. derby_king"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* 5. Password */}
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
                    placeholder="Choose a secure password"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
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
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify OTP & Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ---------------- SCREEN 2: LOG IN (Username + Password) ---------------- */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username or Registered Gmail
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-username-input"
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter username or Gmail"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot_password')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="login-password-input"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
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
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
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

              <div className="pt-2 text-center text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-amber-400 font-bold hover:underline cursor-pointer ml-1"
                >
                  Create Bettor Account (Sign Up)
                </button>
              </div>
            </form>
          )}

          {/* ---------------- SCREEN 3: FORGOT PASSWORD (OTP) ---------------- */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              {/* Gmail / Username to recover */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Gmail or Username
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="forgot-email-input"
                      type="text"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter registered Gmail or username"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    id="forgot-send-otp-btn"
                    disabled={isLoading || !forgotEmail || countdown > 0}
                    onClick={handleSendForgotOtp}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 text-amber-400 font-bold text-xs border border-amber-500/30 transition cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : countdown > 0 ? (
                      <span>Resend ({countdown}s)</span>
                    ) : (
                      <span>{forgotOtpSent ? 'Resend' : 'Send OTP'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* 6-Digit OTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>6-Digit Verification Code</span>
                  {forgotOtpHint && (
                    <span className="text-emerald-400 text-[10px] font-mono">
                      Preview: {forgotOtpHint}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-otp-input"
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP from Gmail"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono tracking-widest text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-new-password-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="forgot-confirm-password-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
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
                id="submit-reset-password-btn"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reset Password & Log In</span>
                    <Check className="w-4 h-4" />
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
