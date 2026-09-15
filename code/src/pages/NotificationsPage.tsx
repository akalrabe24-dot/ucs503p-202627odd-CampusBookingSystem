import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  Trash2,
  CalendarCheck,
} from 'lucide-react';
import { storageService, subscribeToStorageChanges } from '../services/storageService';
import { SystemNotification } from '../types';
import { useAuth } from '../context/AuthContext';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    storageService.getNotifications()
  );

  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setNotifications(storageService.getNotifications());
    });
    return () => unsubscribe();
  }, []);

  const handleMarkAllAsRead = () => {
    visibleNotifications.forEach(notif => storageService.markNotificationAsRead(notif.id));
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    storageService.markNotificationAsRead(notif.id);
    if (user.role === 'incharge') {
      navigate('/incharge/pending');
    } else {
      navigate('/student/bookings');
    }
  };

  const visibleNotifications = notifications.filter(notif => !notif.recipientRole || notif.recipientRole === 'all' || notif.recipientRole === user.role);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            The latest updates.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status updates on permission requests, venue clearances, and campus reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Check className="h-4 w-4 text-blue-600" />
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden divide-y divide-slate-100">
        {visibleNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications available.
          </div>
        ) : (
          visibleNotifications.map((notif) => {
            const isRead = notif.read;
            return (
              <div role="button" tabIndex={0} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); } }}
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 transition-colors cursor-pointer flex items-start gap-4 ${
                  !isRead ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="mt-1 shrink-0">
                  {notif.type === 'success' && (
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  {notif.type === 'error' && (
                    <div className="h-9 w-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  )}
                  {notif.type === 'warning' && (
                    <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                      <Clock className="h-5 w-5" />
                    </div>
                  )}
                  {notif.type === 'info' && (
                    <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Bell className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-bold ${
                        !isRead ? 'text-slate-900 text-sm' : 'text-slate-700'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <p className="mt-1 text-slate-600 leading-relaxed">{notif.message}</p>
                  {notif.bookingId && (
                    <span className="inline-block mt-2 font-mono text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      Booking: {notif.bookingId}
                    </span>
                  )}
                </div>

                {!isRead && (
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
