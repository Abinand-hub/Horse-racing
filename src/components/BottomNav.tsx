import React from 'react';
import { 
  Home, 
  Clock, 
  User as UserIcon, 
  Shield, 
  Award,
  Plus,
  Flame,
  FileText
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BottomNavProps {
  activeTab: 'races' | 'rules' | 'mybets' | 'personal_details' | 'admin' | 'subadmin';
  pendingBetsCount: number;
  onGoHome: () => void;
  onOpenMyBets: () => void;
  onOpenDeposit: () => void;
  onOpenResults: () => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  pendingBetsCount,
  onGoHome,
  onOpenMyBets,
  onOpenDeposit,
  onOpenResults,
  onOpenProfile,
  onOpenAdmin,
  isAdmin,
  isLoggedIn,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 flex justify-center pointer-events-none md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <nav className="pointer-events-auto max-w-md w-full bg-[#060c08]/95 backdrop-blur-xl border border-emerald-500/40 rounded-3xl px-3 sm:px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center justify-between">
        
        {/* 1. Home */}
        <button
          id="mobile-bottom-home-btn"
          onClick={() => {
            soundManager.playClick();
            onGoHome();
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition cursor-pointer ${
            activeTab === 'races'
              ? 'text-[#e5b869] font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'races' ? 'text-[#e5b869] drop-shadow-[0_0_8px_rgba(229,184,105,0.5)]' : ''}`} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* 2. My Bets / Selections */}
        <button
          id="mobile-bottom-mybets-btn"
          onClick={() => {
            soundManager.playClick();
            onOpenMyBets();
          }}
          className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition cursor-pointer ${
            activeTab === 'mybets'
              ? 'text-[#e5b869] font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className={`w-5 h-5 ${activeTab === 'mybets' ? 'text-[#e5b869] drop-shadow-[0_0_8px_rgba(229,184,105,0.5)]' : ''}`} />
          <span className="text-[10px] font-bold">Selections</span>
          {pendingBetsCount > 0 && (
            <span className="absolute 0 top-0.5 right-1 min-w-4 h-4 px-1 bg-emerald-400 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-md">
              {pendingBetsCount}
            </span>
          )}
        </button>

        {/* 3. Center Action CTA: Quick Deposit / Add Funds */}
        <button
          id="mobile-bottom-deposit-btn"
          onClick={() => {
            soundManager.playClick();
            onOpenDeposit();
          }}
          className="relative -top-3 w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c5a028] via-[#e5b869] to-[#fff0a0] text-slate-950 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(229,184,105,0.6)] active:scale-95 transition cursor-pointer border-2 border-[#060c08]"
          title="Add Funds / Deposit"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* 4. Results */}
        <button
          id="mobile-bottom-results-btn"
          onClick={() => {
            soundManager.playClick();
            onOpenResults();
          }}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl text-slate-400 hover:text-white transition cursor-pointer"
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-bold">Results</span>
        </button>

        {/* 5. Account / Personal Details */}
        <button
          id="mobile-bottom-account-btn"
          onClick={() => {
            soundManager.playClick();
            onOpenProfile();
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-2xl transition cursor-pointer ${
            activeTab === 'personal_details'
              ? 'text-[#e5b869] font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserIcon className={`w-5 h-5 ${activeTab === 'personal_details' ? 'text-[#e5b869] drop-shadow-[0_0_8px_rgba(229,184,105,0.5)]' : ''}`} />
          <span className="text-[10px] font-bold">{isLoggedIn ? 'Account' : 'Login'}</span>
        </button>
      </nav>
    </div>
  );
};

