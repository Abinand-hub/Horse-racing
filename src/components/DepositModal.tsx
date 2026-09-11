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
  ShieldCheck
} from 'lucide-react';

interface DepositModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string) => Promise<void>;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  user,
  isOpen,
  onClose,
  onDeposit,
}) => {
  if (!isOpen) return null;

  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<'UPI' | 'NETBANKING' | 'CARDS'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const presets = [500, 1000, 2000, 5000, 10000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      setError('Minimum deposit amount is ₹100');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onDeposit(amount, method);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Deposit Funds</h3>
              <p className="text-[11px] text-slate-400">Instant credit to betting wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current balance */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Current Wallet Balance:</span>
            <span className="font-bold text-emerald-400 text-sm">₹{user?.balance.toLocaleString()}</span>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Enter Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">₹</span>
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
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-lg focus:outline-none focus:border-emerald-500 transition"
                placeholder="1000"
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
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    amount === amt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="deposit-method-upi"
                onClick={() => setMethod('UPI')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  method === 'UPI'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block">UPI / QR</span>
              </button>

              <button
                type="button"
                id="deposit-method-netbanking"
                onClick={() => setMethod('NETBANKING')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  method === 'NETBANKING'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block">NetBanking</span>
              </button>

              <button
                type="button"
                id="deposit-method-cards"
                onClick={() => setMethod('CARDS')}
                className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                  method === 'CARDS'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px] block">Debit Card</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-bit encrypted transaction. Zero processing fee. Instant wallet update.</span>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            id="confirm-deposit-btn"
            disabled={isSubmitting || !amount || amount < 100}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Deposit...</span>
              </>
            ) : (
              <span>Proceed to Deposit ₹{amount ? amount.toLocaleString() : '0'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
