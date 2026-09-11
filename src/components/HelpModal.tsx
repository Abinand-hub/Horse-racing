import React from 'react';
import { X, HelpCircle, Trophy, Shield, Coins, AlertCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-base">Horse Race Betting Rules & Help</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1 */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              1. What is a "WIN" Bet?
            </h4>
            <p className="text-slate-400 text-xs">
              A <strong>WIN</strong> bet means your selected horse must cross the finishing line in <strong>1st place</strong>. If your horse wins, your payout is calculated as <code>Stake × Win Odds</code>. If it finishes 2nd or lower, the bet is lost.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              2. What is a "PLACE" Bet?
            </h4>
            <p className="text-slate-400 text-xs">
              A <strong>PLACE</strong> bet gives higher chance of winning. Your chosen horse must finish in the <strong>Top 3 (1st, 2nd, or 3rd place)</strong>. Payout is calculated as <code>Stake × Place Odds</code>.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-blue-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              3. Understanding Balance & Active Exposure
            </h4>
            <p className="text-slate-400 text-xs">
              When you place a bet, the stake amount is deducted from your liquid balance and moved into <strong>Exposure</strong>. This amount is locked until the race is officially resulted. If you win, your full payout (stake + profit) is credited back to your balance and the exposure is released.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              4. Race Statuses
            </h4>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
              <li><strong>OPEN:</strong> Live betting active. Odds can be selected and bets placed.</li>
              <li><strong>CLOSED:</strong> Gates opened / race underway. Odds are locked.</li>
              <li><strong>RESULTED:</strong> Official verdict declared. System auto-settles all bets and immediately credits winners.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
