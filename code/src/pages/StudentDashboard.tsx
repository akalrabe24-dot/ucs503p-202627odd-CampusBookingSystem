import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  CalendarCheck,
  Clock,
  CheckCircle2,
  CalendarSearch,
  ArrowUpRight,
  Eye,
  Building,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService, subscribeToStorageChanges } from '../services/storageService';
import { Booking } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingDetailsModal } from '../components/booking/BookingDetailsModal';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>(() => storageService.getBookings());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setBookings(storageService.getBookings());
    });
    return () => unsubscribe();
  }, []);

  // Filter bookings related to this user/society or overall student view
  const myBookings = bookings.filter(
    (b) => b.submittedBy === user.id || b.societyId === user.societyId
  );

  // Fallback to all bookings if demo user has none
  const displayedBookings = myBookings.length > 0 ? myBookings : bookings;

  const upcomingBookings = displayedBookings.filter(
    (b) => b.status === 'Approved' && new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0))
  );

  const pendingRequests = displayedBookings.filter((b) => b.status === 'Pending');
  const approvedBookings = displayedBookings.filter((b) => b.status === 'Approved');
  const totalBookingsCount = displayedBookings.length;

  const handleCancelBooking = (booking: Booking) => {
    if (window.confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
      storageService.updateBookingStatus(booking.id, 'Cancelled', {
        rejectionReason: 'Cancelled by applicant student.',
      });
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-200" />
            <span>Society Representative Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
            Representing <span className="font-semibold text-white">{user.societyName || 'Student Society'}</span>. Manage campus rooms, track permission approvals, and schedule events across all campus facilities.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/student/book')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-800 hover:bg-blue-50 shadow-xs transition-all"
            >
              <CalendarPlus className="h-4 w-4 text-blue-700" />
              Book a Room Now
            </button>
            <button
              type="button"
              onClick={() => navigate('/availability')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600/60 border border-blue-400/40 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-600/80 transition-all backdrop-blur-xs"
            >
              <CalendarSearch className="h-4 w-4" />
              Check Availability
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 top-0 hidden md:flex items-center pr-8 opacity-15 pointer-events-none">
          <Building className="h-64 w-64 text-white" />
        </div>
      </div>

      {/* Metric Cards Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Upcoming Bookings"
          value={upcomingBookings.length}
          subtitle="Scheduled & active"
          icon={<Calendar className="h-6 w-6" />}
          colorScheme="blue"
        />
        <MetricCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting In-charge sign-off"
          icon={<Clock className="h-6 w-6" />}
          colorScheme="amber"
        />
        <MetricCard
          title="Approved Bookings"
          value={approvedBookings.length}
          subtitle="Cleared for occupancy"
          icon={<CheckCircle2 className="h-6 w-6" />}
          colorScheme="emerald"
        />
        <MetricCard
          title="Total Bookings"
          value={totalBookingsCount}
          subtitle="Historical requests"
          icon={<CalendarCheck className="h-6 w-6" />}
          colorScheme="indigo"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/student/book')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-start justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">Book a Room / Resource</h3>
            <p className="mt-1 text-xs text-slate-500">
              Submit a structured multi-step room request for preparation, workshops, or events.
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
        </div>

        <div
          onClick={() => navigate('/student/bookings')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-start justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <CalendarCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">View My Bookings</h3>
            <p className="mt-1 text-xs text-slate-500">
              Track real-time status of your submitted permissions and download pass details.
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
        </div>

        <div
          onClick={() => navigate('/availability')}
          className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-start justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CalendarSearch className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">Check Availability</h3>
            <p className="mt-1 text-xs text-slate-500">
              Inspect interactive hourly schedules for all 12 campus locations & lecture theatres.
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
        </div>
      </div>

      {/* Upcoming & Recent Bookings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Upcoming & Recent Requests</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status across upcoming rehearsals, workshops, and society events
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/student/bookings')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View All ({displayedBookings.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
              <tr>
                <th className="px-6 py-3.5">Activity & Society</th>
                <th className="px-4 py-3.5">Location & Room</th>
                <th className="px-4 py-3.5">Date & Time</th>
                <th className="px-4 py-3.5">Permission</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedBookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{booking.activityType}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{booking.societyName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-800">{booking.roomName}</div>
                    <div className="text-[11px] text-slate-400">{booking.locationName}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-800">{booking.date}</div>
                    <div className="text-[11px] text-slate-500">
                      {booking.startTime} - {booking.endTime}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        booking.permissionType === 'Night Permission'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {booking.permissionType}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={booking.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onCancel={handleCancelBooking}
        canManage={false}
      />
    </div>
  );
};
