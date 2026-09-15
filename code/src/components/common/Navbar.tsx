import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  ChevronDown,
  Menu,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storageService, subscribeToStorageChanges } from '../../services/storageService';
import { SystemNotification } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, switchRole, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    storageService.getNotifications()
  );
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setNotifications(storageService.getNotifications());
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    storageService.markAllNotificationsAsRead();
  };

  const handleNotificationClick = (notif: SystemNotification) => {
    storageService.markNotificationAsRead(notif.id);
    setShowNotifDropdown(false);
    if (user.role === 'incharge') {
      navigate('/incharge/pending');
    } else {
      navigate('/student/bookings');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu button & Campus Identity */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">
                CAMPUS<span className="text-blue-600">RESERVE</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Resource & Booking Management System
            </p>
          </div>
        </div>
      </div>

      {/* Right: Persona Quick Switcher & User profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Role Quick Switcher Badge */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <span className="px-2 py-1 text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-blue-600" />
            Switch:
          </span>
          <button
            type="button"
            onClick={() => {
              switchRole('student');
              navigate('/student/dashboard');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              user.role === 'student'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => {
              switchRole('incharge');
              navigate('/incharge/dashboard');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              user.role === 'incharge'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In-charge
          </button>
          <button
            type="button"
            onClick={() => {
              switchRole('admin');
              navigate('/admin/dashboard');
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              user.role === 'admin'
                ? 'bg-white text-blue-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              setShowUserDropdown(false);
            }}
            className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10 z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'success' && (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        )}
                        {n.type === 'error' && (
                          <AlertCircle className="h-4 w-4 text-rose-600" />
                        )}
                        {n.type === 'warning' && (
                          <Clock className="h-4 w-4 text-amber-600" />
                        )}
                        {n.type === 'info' && (
                          <Bell className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <p className={`font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                      </div>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifDropdown(false);
                    navigate(user.role === 'incharge' ? '/incharge/dashboard' : '/student/notifications');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View All Activity & Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifDropdown(false);
            }}
            className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden ring-1 ring-slate-200">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-none">
                {user.role === 'student'
                  ? user.societyName || 'Student Representative'
                  : user.designation || 'Staff'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl ring-1 ring-slate-900/10 z-50 p-2">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
                  Role: {user.role}
                </span>
              </div>

              {/* Mobile Role Switcher */}
              <div className="md:hidden py-1 border-b border-slate-100 text-xs">
                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase">
                  Switch Persona
                </p>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('student');
                    setShowUserDropdown(false);
                    navigate('/student/dashboard');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg"
                >
                  Student (Aayati - IEEE)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('incharge');
                    setShowUserDropdown(false);
                    navigate('/incharge/dashboard');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg"
                >
                  In-charge (Dr. Verma)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchRole('admin');
                    setShowUserDropdown(false);
                    navigate('/admin/dashboard');
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg"
                >
                  Admin (Prof. Bansal)
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  storageService.resetToDefaults();
                  setShowUserDropdown(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-xl"
              >
                <Sparkles className="h-4 w-4 text-blue-500" />
                Reset Mock Data to Initial
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl mt-1"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
