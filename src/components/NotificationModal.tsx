import React from 'react';
import { UserNotification } from '../types';
import { 
  X, 
  Bell, 
  CheckCheck, 
  CheckCircle2, 
  XCircle, 
  Timer, 
  Trophy, 
  Info,
  Clock
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: UserNotification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT_APPROVED':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'DEPOSIT_REJECTED':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
        );
      case 'WITHDRAWAL_IN_PROGRESS':
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 animate-pulse">
            <Timer className="w-4 h-4" />
          </div>
        );
      case 'WITHDRAWAL_SUCCESSFUL':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'WITHDRAWAL_REJECTED':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
        );
      case 'BET_WON':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#e5b869] flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-IN');
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0a1f16] border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Activity Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e5b869] text-black shadow-xs">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Admin actions, payouts & deposit approvals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subheader / Action bar */}
        <div className="flex items-center justify-between px-5 py-2 bg-slate-950/50 border-b border-slate-800/80 text-xs shrink-0">
          <span className="text-slate-400">
            Total {notifications.length} message{notifications.length === 1 ? '' : 's'}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={() => onMarkAllAsRead()}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No Notifications Yet</p>
              <p className="text-xs text-slate-500">
                You will receive alerts here when deposits are approved or withdrawals are processed.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.is_read) onMarkAsRead(n.id);
                }}
                className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                  !n.is_read
                    ? 'bg-slate-950 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/70 hover:border-slate-700'
                }`}
              >
                {!n.is_read && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}

                <div className="flex items-start gap-3">
                  {getNotificationIcon(n.type)}
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(n.created_at)}</span>
                      {n.amount && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-amber-400 font-mono">₹{n.amount.toLocaleString('en-IN')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
