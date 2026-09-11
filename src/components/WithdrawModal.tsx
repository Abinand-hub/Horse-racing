import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  ArrowUpRight, 
  AlertCircle, 
  Building2, 
  Smartphone,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface WithdrawModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, details: { upi_id?: string; bank_account?: string }) => Promise<void>;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  user,
  isOpen,
  onClose,
  onWithdraw,
}) => {
  if (!isOpen) return null;

  const userBalance = user?.balance ?? 0;
  const userExposure = user?.exposure ?? 0;
  const withdrawableAmount = Math.max(0, userBalance - userExposure);

  const [amount, setAmount] = useState<number>(Math.min(2000, withdrawableAmount));
  const [method, setMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 500) {
      setError('Minimum withdrawal amount is ₹500');
      return;
    }
    if (amount > withdrawableAmount) {
      setError(`Cannot withdraw more than withdrawable balance (₹${withdrawableAmount.toLocaleString()})`);
      return;
    }
    if (method === 'UPI' && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. user@okhdfcbank)');
      return;
    }
    if (method === 'BANK' && (!bankAccount || !ifsc)) {
      setError('Please enter both Bank Account Number and IFSC Code');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onWithdraw(amount, {
        upi_id: method === 'UPI' ? upiId : undefined,
        bank_account: method === 'BANK' ? `${bankAccount} (IFSC: ${ifsc})` : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed');
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
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Withdraw Winnings</h3>
              <p className="text-[11px] text-slate-400">Transfer directly to Bank or UPI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Balance breakdown card */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Account Balance:</span>
              <span className="font-bold text-white">₹{userBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-rose-400" />
                Locked in Active Bets (Exposure):
              </span>
              <span className="font-semibold text-rose-400">-₹{userExposure.toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-800" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400">Withdrawable Balance:</span>
              <span className="font-bold text-emerald-400 text-sm">₹{withdrawableAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 uppercase tracking-wider">
                Withdrawal Amount (₹)
              </label>
              <button
                type="button"
                onClick={() => setAmount(withdrawableAmount)}
                className="text-amber-400 hover:underline cursor-pointer font-medium"
              >
                Withdraw All (₹{withdrawableAmount})
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">₹</span>
              <input
                id="withdraw-amount-input"
                type="number"
                min="500"
                max={withdrawableAmount}
                value={amount || ''}
                onChange={(e) => {
                  setAmount(Number(e.target.value));
                  setError(null);
                }}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-lg focus:outline-none focus:border-amber-500 transition"
                placeholder="500"
              />
            </div>
          </div>

          {/* Method tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Payout Destination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="withdraw-method-upi"
                onClick={() => setMethod('UPI')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  method === 'UPI'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                UPI ID (Instant)
              </button>

              <button
                type="button"
                id="withdraw-method-bank"
                onClick={() => setMethod('BANK')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  method === 'BANK'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Bank Transfer (IMPS)
              </button>
            </div>
          </div>

          {/* Destination Fields */}
          {method === 'UPI' ? (
            <div>
              <label className="block text-xs text-slate-400 mb-1">UPI Address (VPA)</label>
              <input
                id="withdraw-upi-input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Account Number</label>
                <input
                  id="withdraw-account-input"
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="e.g. 5010023456789"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">IFSC Code</label>
                <input
                  id="withdraw-ifsc-input"
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            id="confirm-withdraw-btn"
            disabled={isSubmitting || withdrawableAmount < 500 || amount < 500 || amount > withdrawableAmount}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-sm transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Processing Transfer...</span>
              </>
            ) : (
              <span>Request Withdrawal (₹{amount ? amount.toLocaleString() : '0'})</span>
            )}
          </button>

          <p className="text-[11px] text-slate-500 text-center">
            Transfers are processed within 10-30 minutes via IMPS / UPI Fast Rail.
          </p>
        </form>
      </div>
    </div>
  );
};
