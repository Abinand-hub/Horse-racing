import React from 'react';
import { 
  Home, 
  Flame, 
  Clock, 
  User as UserIcon, 
  Shield, 
  Award,
  Zap
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BottomNavProps {
  activeTab: 'races' | 'mybets' | 'admin';
  pendingBetsCount: number;
  onGoHome: () => void;
  onOpenMyBets: () => void;
  onOpenAdmin: () => void;
  onOpenResults: () => void;
  onOpenProfile: () => void;
  isAdmin: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  pendingBetsCount,
  onGoHome,
  onOpenMyBets,
  onOpenAdmin,
  onOpenResults,
  onOpenProfile,
  isAdmin,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto max-w-md w-full bg-[#12151d]/90 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 shadow-2xl flex items-center justify-between">
        
        {/* Home */}
        <button
          onClick={() => {
            soundManager.playClick();
            onGoHome();
          }}
          className={`flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'races'
              ? 'text-rose-500 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        {/* My Bets */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenMyBets();
          }}
          className={`relative flex flex-col items-center gap-0.5 transition cursor-pointer ${
            activeTab === 'mybets'
              ? 'text-rose-500 scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-bold">My Bets</span>
          {pendingBetsCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center">
              {pendingBetsCount}
            </span>
          )}
        </button>

        {/* Center Action CTA: Start / Live */}
        <button
          onClick={() => {
            soundManager.playClick();
            onGoHome();
          }}
          className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/40 hover:scale-110 active:scale-95 transition cursor-pointer border-2 border-black"
          title="Live Racing"
        >
          <Flame className="w-6 h-6 fill-current animate-pulse" />
        </button>

        {/* Results */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenResults();
          }}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-bold">Results</span>
        </button>

        {/* Admin / Profile */}
        {isAdmin ? (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAdmin();
            }}
            className={`flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeTab === 'admin'
                ? 'text-indigo-400 scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] font-bold">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenProfile();
            }}
            className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Account</span>
          </button>
        )}
      </nav>
    </div>
  );
};
