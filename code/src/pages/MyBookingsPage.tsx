import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CalendarPlus,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService, subscribeToStorageChanges } from '../services/storageService';
import { Booking, BookingStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingDetailsModal } from '../components/booking/BookingDetailsModal';

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>(() => storageService.getBookings());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Tabs: All | Pending | Approved | Rejected | Cancelled
  const [activeTab, setActiveTab] = useState<'All' | BookingStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('All');

  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setBookings(storageService.getBookings());
    });
    return () => unsubscribe();
  }, []);

  // Filter for this user/society
  const myBookings = useMemo(() => {
    const userFiltered = bookings.filter(
      (b) => b.submittedBy === user.id || b.societyId === user.societyId
    );
    return userFiltered;
  }, [bookings, user]);

  // Tab and Search Filtering
  const filteredBookings = useMemo(() => {
    return myBookings.filter((b) => {
      if (activeTab !== 'All' && b.status !== activeTab) {
        return false;
      }
      if (activityFilter !== 'All' && b.activityType !== activityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = b.id.toLowerCase().includes(query);
        const matchesRoom = b.roomName.toLowerCase().includes(query);
        const matchesSoc = b.societyName.toLowerCase().includes(query);
        const matchesLoc = b.locationName.toLowerCase().includes(query);
        if (!matchesId && !matchesRoom && !matchesSoc && !matchesLoc) {
          return false;
        }
      }
      return true;
    });
  }, [myBookings, activeTab, activityFilter, searchQuery]);

  const getStatusCount = (status?: BookingStatus) => {
    if (!status) return myBookings.length;
    return myBookings.filter((b) => b.status === status).length;
  };

  const handleCancelBooking = (booking: Booking) => {
    if (window.confirm(`Are you sure you want to cancel booking request ${booking.id}?`)) {
      storageService.updateBookingStatus(booking.id, 'Cancelled', {
        rejectionReason: 'Cancelled by applicant student.',
      });
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage all campus room requests submitted on behalf of {user.societyName || 'your society'}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/student/book')}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <CalendarPlus className="h-4 w-4" />
          New Booking Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {(['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'] as const).map((tab) => {
          const count = tab === 'All' ? getStatusCount() : getStatusCount(tab);
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Booking ID, Room, Society, or Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-500 focus:outline-none bg-white shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none bg-white shadow-xs font-medium w-full sm:w-auto"
          >
            <option value="All">All Activity Types</option>
            <option value="Society Preparation">Society Preparation</option>
            <option value="Workshop / Session">Workshop / Session</option>
            <option value="Event">Event</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No bookings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching requests were found for the selected tab or search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveTab('All');
                setSearchQuery('');
                setActivityFilter('All');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
                <tr>
                  <th className="px-6 py-3.5">Booking ID</th>
                  <th className="px-4 py-3.5">Society & Activity</th>
                  <th className="px-4 py-3.5">Venue Details</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Permission</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600">{b.id}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{b.societyName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{b.activityType}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{b.roomName}</div>
                      <div className="text-[11px] text-slate-400">
                        {b.locationName} ({b.locationId})
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{b.date}</div>
                      <div className="text-[11px] text-slate-500">
                        {b.startTime} - {b.endTime}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          b.permissionType === 'Night Permission'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {b.permissionType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(b);
                        }}
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
        )}
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
