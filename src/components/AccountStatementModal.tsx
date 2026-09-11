import React from 'react';
import { Transaction } from '../types';
import { 
  X, 
  FileText, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trophy, 
  Coins, 
  Calendar,
  Layers
} from 'lucide-react';

interface AccountStatementModalProps {
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

export const AccountStatementModal: React.FC<AccountStatementModalProps> = ({
  transactions,
  isOpen,
  onClose,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Account Statement</h3>
              <p className="text-[11px] text-slate-400">Ledger of deposits, withdrawals, bets & wins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transactions List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Loading transactions ledger...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/50 rounded-xl p-6">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">No transactions recorded yet</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="bg-slate-950 rounded-xl p-3 sm:p-4 border border-slate-800/80 flex items-center justify-between gap-3 text-xs sm:text-sm hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : tx.type === 'WIN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : tx.type === 'WITHDRAW'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' && <ArrowDownLeft className="w-4 h-4" />}
                      {tx.type === 'WITHDRAW' && <ArrowUpRight className="w-4 h-4" />}
                      {tx.type === 'WIN' && <Trophy className="w-4 h-4" />}
                      {tx.type === 'BET' && <Coins className="w-4 h-4" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase text-xs tracking-wider">
                          {tx.type}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                          {new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-1">{tx.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold text-sm sm:text-base ${
                        isPositive ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {isPositive ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      Bal: ₹{tx.balance_after.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
