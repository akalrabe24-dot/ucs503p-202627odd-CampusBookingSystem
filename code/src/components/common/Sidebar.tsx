import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  CalendarSearch,
  Bell,
  X,
  Users,
  Building2,
  FileCheck2,
  FileClock,
  ShieldCheck,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavLinks = (): NavItem[] => {
    switch (user.role) {
      case 'incharge':
        return [
          {
            name: 'Approval Dashboard',
            to: '/incharge/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'Pending Requests',
            to: '/incharge/pending',
            icon: FileClock,
            badge: 'Review',
          },
          {
            name: 'All Bookings',
            to: '/incharge/bookings',
            icon: CalendarCheck,
          },
          {
            name: 'Campus Availability',
            to: '/availability',
            icon: CalendarSearch,
          },
          {
            name: 'Notifications',
            to: '/student/notifications',
            icon: Bell,
          },
        ];
      case 'admin':
        return [
          {
            name: 'Overview Dashboard',
            to: '/admin/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'Locations & Rooms',
            to: '/admin/rooms',
            icon: Building2,
          },
          {
            name: 'Societies Directory',
            to: '/admin/societies',
            icon: Users,
          },
          {
            name: 'All Campus Bookings',
            to: '/incharge/bookings',
            icon: CalendarCheck,
          },
          {
            name: 'Campus Availability',
            to: '/availability',
            icon: CalendarSearch,
          },
          {
            name: 'System Logs & Reports',
            to: '/admin/reports',
            icon: FileCheck2,
          },
        ];
      case 'student':
      default:
        return [
          {
            name: 'Dashboard',
            to: '/student/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'Book a Resource',
            to: '/student/book',
            icon: CalendarPlus,
            highlight: true,
          },
          {
            name: 'Campus Availability',
            to: '/availability',
            icon: CalendarSearch,
          },
          {
            name: 'My Bookings',
            to: '/student/bookings',
            icon: CalendarCheck,
          },
          {
            name: 'Notifications',
            to: '/student/notifications',
            icon: Bell,
          },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200 bg-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header / Close */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6 lg:hidden">
          <span className="text-sm font-bold text-slate-900">Navigation Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Role Capsule */}
        <div className="p-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white text-xs">
                {user.role === 'student' && <Users className="h-3.5 w-3.5" />}
                {user.role === 'incharge' && <ShieldCheck className="h-3.5 w-3.5" />}
                {user.role === 'admin' && <Settings className="h-3.5 w-3.5" />}
              </span>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                  {user.role === 'student' && 'Student Portal'}
                  {user.role === 'incharge' && 'In-Charge Portal'}
                  {user.role === 'admin' && 'Admin Portal'}
                </p>
                <p className="text-xs text-blue-700 font-medium truncate">
                  {user.role === 'student'
                    ? user.societyName || 'IEEE Student Branch'
                    : user.designation || user.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : item.highlight
                    ? 'bg-blue-50/80 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <item.icon
                      className={`h-4 w-4 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-blue-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Support / Quick Info Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span>Permission Protocol</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Bookings after 20:00 require Night Permission. Requests must be submitted at least 24h prior.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
