import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Wallet, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  QrCode, 
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  Upload,
  Clock,
  Sparkles
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DepositModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string, utr_number: string, screenshot_url?: string) => Promise<void>;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  user,
  isOpen,
  onClose,
  onDeposit,
}) => {
  if (!isOpen) return null;

  const [amount, setAmount] = useState<number>(5000);
  const [method, setMethod] = useState<'UPI' | 'NETBANKING' | 'QR'>('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [500, 1000, 2000, 5000, 10000];
  const officialUpi = 'derbybet.turf@icici';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(officialUpi);
    setIsCopied(true);
    soundManager.playClick();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      setError('Minimum deposit amount is ₹100');
      return;
    }
    if (!utrNumber || utrNumber.trim().length < 6) {
      setError('Please enter a valid 12-digit UPI UTR / Transaction Reference Number');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onDeposit(amount, method, utrNumber.trim(), screenshotUrl || undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Deposit submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#07100b] border-2 border-[#e5b869]/60 rounded-3xl shadow-[0_0_30px_rgba(229,184,105,0.25)] overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#040805] border-b border-emerald-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#18160c] border border-[#e5b869]/50 text-[#e5b869] flex items-center justify-center shadow-[0_0_10px_rgba(229,184,105,0.3)]">
              <ArrowDownLeft className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">Deposit Funds</h3>
              <p className="text-[11px] text-emerald-400">Verified UPI / Bank Transfer Request</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto scrollbar-thin">
          {/* Current balance & Verification Notice */}
          <div className="bg-[#050e0a] rounded-2xl p-3.5 border border-emerald-900/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Current Wallet Balance</span>
              <span className="font-black text-[#e5b869] text-base">₹{user?.balance.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Clock className="w-3 h-3" />
                Verified by Admin
              </span>
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Enter Deposit Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-[#e5b869] text-lg">₹</span>
              <input
                id="deposit-amount-input"
                type="number"
                min="100"
                step="100"
                value={amount || ''}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  setError(null);
                }}
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-[#030604] border border-emerald-900/80 text-white font-black text-lg focus:outline-none focus:border-[#e5b869] transition shadow-inner font-mono"
                placeholder="5000"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  id={`deposit-preset-${amt}`}
                  onClick={() => setAmount(amt)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    amount === amt
                      ? 'bg-[#18160c] text-[#e5b869] border-[#e5b869] shadow-[0_0_8px_rgba(229,184,105,0.3)]'
                      : 'bg-[#050e0a] text-slate-400 border-emerald-950 hover:text-white hover:border-emerald-800'
                  }`}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Destination Details */}
          <div className="bg-[#040906] rounded-2xl p-4 border border-emerald-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                2. Pay to Official UPI Account
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">24/7 Fast Credit</span>
            </div>

            <div className="flex items-center justify-between bg-[#020503] p-2.5 rounded-xl border border-emerald-950 font-mono text-xs">
              <div>
                <span className="text-[9px] uppercase text-slate-500 block font-sans">Official UPI ID</span>
                <span className="font-bold text-[#e5b869] text-xs sm:text-sm">{officialUpi}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-3 py-1.5 rounded-lg bg-[#18160c] hover:bg-[#252213] text-[#e5b869] border border-[#e5b869]/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied!' : 'Copy UPI'}</span>
              </button>
            </div>
          </div>

          {/* UTR Reference Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Enter 12-Digit UTR / Transaction ID <span className="text-red-400">*</span>
              </label>
              <span className="text-[10px] text-slate-400">From PhonePe / GPay / Paytm</span>
            </div>
            <input
              id="deposit-utr-input"
              type="text"
              value={utrNumber}
              onChange={(e) => {
                setUtrNumber(e.target.value);
                setError(null);
              }}
              placeholder="e.g. 329845729104 (12-digit UTR)"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#030604] border border-emerald-900/80 text-white font-mono font-bold text-sm focus:outline-none focus:border-[#e5b869] transition shadow-inner tracking-wider"
              required
            />
          </div>

          {/* Screenshot Proof Upload (Optional / Simulation) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>4. Upload Payment Screenshot</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </label>
            
            <div className="border border-dashed border-emerald-900/80 rounded-2xl p-3 bg-[#030604] text-center hover:border-[#e5b869]/50 transition">
              <input
                type="file"
                id="deposit-screenshot-file"
                accept="image/*"
                onChange={handleScreenshotUpload}
                className="hidden"
              />
              <label
                htmlFor="deposit-screenshot-file"
                className="cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white"
              >
                <Upload className="w-5 h-5 text-[#e5b869]" />
                <span className="text-xs font-semibold">
                  {screenshotUrl ? 'Screenshot Attached ✅ (Click to change)' : 'Click to attach payment screenshot'}
                </span>
              </label>

              {screenshotUrl && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={screenshotUrl}
                    alt="Proof Preview"
                    className="h-16 w-auto rounded-lg border border-[#e5b869]/40 object-cover shadow"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Admin Verification Notice Box */}
          <div className="p-3 bg-[#040805] rounded-2xl border border-emerald-900/50 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#e5b869]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Notification & Automatic Balance Credit</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[10.5px]">
              Upon submitting, your request status will be marked as <strong className="text-amber-400">PENDING</strong>. As soon as the admin verifies your UTR, ₹{amount ? amount.toLocaleString() : '0'} will be <strong className="text-emerald-400">credited to your wallet balance automatically</strong> and you will receive a notification alert!
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            id="confirm-deposit-btn"
            disabled={isSubmitting || !amount || amount < 100 || !utrNumber}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#e5b869] hover:from-[#c5a028] hover:to-[#d4af37] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-sm transition shadow-[0_0_15px_rgba(229,184,105,0.4)] cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Submitting for Approval...</span>
              </>
            ) : (
              <span>Submit Deposit Request (₹{amount ? amount.toLocaleString() : '0'})</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

