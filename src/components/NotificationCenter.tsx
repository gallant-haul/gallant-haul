import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Info,
  Clock,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import { adminStore, PortalNotification } from '../services/adminStore';

interface NotificationCenterProps {
  userEmail?: string;
  userRole: 'client' | 'driver' | 'admin';
  align?: 'left' | 'right';
  className?: string;
}

export default function NotificationCenter({
  userEmail,
  userRole,
  align = 'right',
  className = '',
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read'>('all');
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    const list = adminStore.getNotificationsForUser(userEmail, userRole);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    const handleStoreUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('gallant-store-update', handleStoreUpdate);
    return () => {
      window.removeEventListener('gallant-store-update', handleStoreUpdate);
    };
  }, [userEmail, userRole]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isRead = (notif: PortalNotification) => {
    return adminStore.isNotificationRead(notif, userEmail);
  };

  const unreadList = notifications.filter((n) => !isRead(n));
  const readList = notifications.filter((n) => isRead(n));
  const unreadCount = unreadList.length;

  const displayedList =
    filterTab === 'unread'
      ? unreadList
      : filterTab === 'read'
      ? readList
      : notifications;

  const handleToggleRead = (notifId: string, currentReadState: boolean) => {
    if (!userEmail) return;
    adminStore.markNotificationRead(notifId, userEmail, !currentReadState);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    if (!userEmail) return;
    adminStore.markAllNotificationsRead(userEmail, userRole);
    loadNotifications();
  };

  const getPriorityStyle = (priority: PortalNotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-800',
        };
      case 'customs':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
          badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-800',
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-teal-400" />,
          bg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
          badge: 'bg-teal-950/80 text-teal-300 border-teal-800',
        };
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Interactive Bell Icon Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-teal-500/50 shadow-md transition-all duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12 text-slate-200 group-hover:text-teal-400" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] h-5 rounded-full bg-rose-500 text-white font-mono font-extrabold text-[10px] flex items-center justify-center shadow-lg border-2 border-slate-950 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2.5 w-84 sm:w-96 bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl p-4 overflow-hidden section-fade ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
          style={{ maxHeight: '82vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-white text-sm tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-teal-400 hover:text-teal-300 text-[11px] font-semibold flex items-center gap-1 border border-slate-800 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Segmented Filter Tabs: All | New / Unread | Seen / Read */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/90 rounded-xl my-3 border border-slate-800/80 text-xs">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                filterTab === 'all'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>All</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'all' ? 'bg-teal-600 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('unread')}
              className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                filterTab === 'unread'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>New</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'unread' ? 'bg-teal-600 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {unreadCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterTab('read')}
              className={`py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                filterTab === 'read'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Seen</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterTab === 'read' ? 'bg-teal-600 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {readList.length}
              </span>
            </button>
          </div>

          {/* Notification List Body */}
          <div className="overflow-y-auto max-h-[50vh] space-y-2 pr-1 scrollbar-none">
            {displayedList.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  {filterTab === 'unread' ? <Check className="w-5 h-5 text-teal-500" /> : <Bell className="w-5 h-5" />}
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  {filterTab === 'unread'
                    ? "You're all caught up!"
                    : filterTab === 'read'
                    ? 'No archived alerts yet.'
                    : 'No active broadcasts.'}
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {filterTab === 'unread'
                    ? 'New dispatch notices and customs advisories will appear here.'
                    : 'Read announcements and updates will be saved in your archive.'}
                </p>
              </div>
            ) : (
              displayedList.map((notif) => {
                const readState = isRead(notif);
                const priorityInfo = getPriorityStyle(notif.priority);
                const timeString = new Date(notif.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dateString = new Date(notif.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      readState
                        ? 'bg-slate-950/60 border-slate-800/60 opacity-80'
                        : 'bg-slate-900 border-slate-700/80 shadow-md ring-1 ring-teal-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${priorityInfo.bg}`}>
                          {priorityInfo.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span
                              className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${priorityInfo.badge}`}
                            >
                              {notif.priority}
                            </span>
                            {!readState && (
                              <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0"></span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono ml-auto">
                              {dateString} · {timeString}
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold leading-snug break-words ${readState ? 'text-slate-300' : 'text-white font-extrabold'}`}>
                            {notif.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed break-words whitespace-pre-line">
                            {notif.message}
                          </p>
                        </div>
                      </div>

                      {/* 1-Click Toggle Read/Unread */}
                      <button
                        type="button"
                        onClick={() => handleToggleRead(notif.id, readState)}
                        title={readState ? 'Mark as unread' : 'Mark as read'}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 mt-0.5 ${
                          readState
                            ? 'bg-slate-900 text-slate-500 border-slate-800 hover:text-teal-400 hover:border-slate-700'
                            : 'bg-teal-500/20 text-teal-300 border-teal-500/40 hover:bg-teal-500/30'
                        }`}
                      >
                        {readState ? <EyeOff className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
