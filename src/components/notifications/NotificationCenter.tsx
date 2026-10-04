import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Info, CheckCircle2, AlertTriangle, AlertCircle, ExternalLink } from 'lucide-react';
import { db } from '../../services/db';
import { AppNotification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDateTimeID } from '../../utils/formatters';

export const NotificationCenter: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    db.getNotifications(currentUser.id, role)
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNotifs = () => {
      setNotifications(db.getNotifications(currentUser.id, role));
    };
    updateNotifs();
    return db.subscribe(updateNotifs);
  }, [currentUser.id, role]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead(currentUser.id, role);
  };

  const handleItemClick = (notif: AppNotification) => {
    if (!notif.is_read) {
      db.markNotificationAsRead(notif.id);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-[#1B263B] rounded-xl transition-colors border border-transparent hover:border-[#26354D]"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 ring-2 ring-[#0B1120] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#151F32] border border-[#26354D] shadow-2xl py-3 z-50">
          <div className="flex items-center justify-between px-4 pb-3 border-b border-[#26354D]">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Notifikasi</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {unreadCount} baru
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#26354D]/50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada notifikasi saat ini
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 hover:bg-[#1B263B]/60 transition-colors cursor-pointer flex items-start gap-3 ${
                    !notif.is_read ? 'bg-cyan-500/5' : ''
                  }`}
                >
                  <div className="p-2 rounded-lg bg-[#0B1120] border border-[#26354D] shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold ${!notif.is_read ? 'text-white' : 'text-slate-300'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTimeID(notif.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
