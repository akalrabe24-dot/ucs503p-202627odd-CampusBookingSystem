import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  Check,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService, subscribeToStorageChanges } from '../services/storageService';
import { Booking, BookingStatus, PermissionType } from '../types';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingDetailsModal } from '../components/booking/BookingDetailsModal';
import { RejectionModal } from '../components/booking/RejectionModal';

interface InChargeDashboardProps {
  initialTab?: 'All' | 'Morning' | 'Night' | 'Pending';
}

export const InChargeDashboard: React.FC<InChargeDashboardProps> = ({
  initialTab = 'Pending',
}) => {
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>(() => storageService.getBookings());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectingBooking, setRejectingBooking] = useState<Booking | null>(null);

  // Tabs: All | Morning | Night | Pending
  const [currentTab, setCurrentTab] = useState<'All' | 'Morning' | 'Night' | 'Pending'>(initialTab);
  useEffect(() => setCurrentTab(initialTab), [initialTab]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  const locations = storageService.getLocations();

  useEffect(() => {
    const unsubscribe = subscribeToStorageChanges(() => {
      setBookings(storageService.getBookings());
    });
    return () => unsubscribe();
  }, []);

  // KPIs
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const approvedCount = bookings.filter((b) => b.status === 'Approved').length;
  const rejectedCount = bookings.filter((b) => b.status === 'Rejected').length;
  const totalCount = bookings.length;

  // Filtered List
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      if (currentTab === 'Pending' && b.status !== 'Pending') return false;
      if (currentTab === 'Morning' && b.permissionType !== 'Morning Permission') return false;
      if (currentTab === 'Night' && b.permissionType !== 'Night Permission') return false;

      // Status dropdown
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;

      // Location dropdown
      if (locationFilter !== 'All' && b.locationId !== locationFilter) return false;

      // Activity dropdown
      if (activityFilter !== 'All' && b.activityType !== activityFilter) return false;

      // Date filter
      if (dateFilter && b.date !== dateFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSociety = b.societyName.toLowerCase().includes(q);
        const matchesRoom = b.roomName.toLowerCase().includes(q);
        const matchesId = b.id.toLowerCase().includes(q);
        const matchesApplicant = b.submittedByName.toLowerCase().includes(q);
        if (!matchesSociety && !matchesRoom && !matchesId && !matchesApplicant) return false;
      }

      return true;
    });
  }, [
    bookings,
    currentTab,
    statusFilter,
    locationFilter,
    activityFilter,
    dateFilter,
    searchQuery,
  ]);

  // Direct Approval
  const handleApprove = (booking: Booking) => {
    storageService.updateBookingStatus(booking.id, 'Approved', {
      reviewerName: user.name,
      approvalRemarks: 'Standard university space authorization granted with premises handover.',
    });
    if (selectedBooking?.id === booking.id) {
      setSelectedBooking(null);
    }
  };

  // Rejection Confirmation from modal
  const handleConfirmReject = (bookingId: string, reason: string) => {
    storageService.updateBookingStatus(bookingId, 'Rejected', {
      reviewerName: user.name,
      rejectionReason: reason,
    });
    setRejectingBooking(null);
    if (selectedBooking?.id === bookingId) {
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Ready for review.
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              Official Review
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{user.name}</strong> ({user.designation || 'In-charge'}). Authorize, adjust, or decline student room requests.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500">
            Pending Backlog:{' '}
            <strong className="text-amber-600 font-extrabold text-sm">{pendingCount}</strong>
          </span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Requests"
          value={pendingCount}
          subtitle="Requires immediate review"
          icon={<Clock className="h-6 w-6" />}
          colorScheme="amber"
        />
        <MetricCard
          title="Approved Today / Total"
          value={approvedCount}
          subtitle="Authorized reservations"
          icon={<CheckCircle2 className="h-6 w-6" />}
          colorScheme="emerald"
        />
        <MetricCard
          title="Rejected Today / Total"
          value={rejectedCount}
          subtitle="Declined with feedback"
          icon={<XCircle className="h-6 w-6" />}
          colorScheme="rose"
        />
        <MetricCard
          title="Total Requests"
          value={totalCount}
          subtitle="Processed in current session"
          icon={<FileCheck2 className="h-6 w-6" />}
          colorScheme="blue"
        />
      </div>

      {/* Workflow Tabs: All | Morning | Night | Pending */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'Pending', label: 'Pending Review', count: pendingCount },
          { id: 'All', label: 'All Requests', count: totalCount },
          {
            id: 'Morning',
            label: 'Morning Permission',
            count: bookings.filter((b) => b.permissionType === 'Morning Permission').length,
          },
          {
            id: 'Night',
            label: 'Night Permission (Post 20:00)',
            count: bookings.filter((b) => b.permissionType === 'Night Permission').length,
          },
        ].map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search society, room, applicant, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none bg-white font-medium"
            >
              <option value="All">All Locations (12)</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.id} - {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Activity Filter */}
          <div>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none bg-white font-medium"
            >
              <option value="All">All Activity Types</option>
              <option value="Society Preparation">Society Preparation</option>
              <option value="Workshop / Session">Workshop / Session</option>
              <option value="Event">Event</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        {(searchQuery || locationFilter !== 'All' || activityFilter !== 'All' || dateFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">
              Showing {filteredBookings.length} matching request(s)
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setLocationFilter('All');
                setActivityFilter('All');
                setDateFilter('');
                setStatusFilter('All');
              }}
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Request Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Queue is Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are currently no requests matching the selected view criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/70">
                <tr>
                  <th className="px-5 py-3.5">Society</th>
                  <th className="px-4 py-3.5">Activity</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Room</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Time</th>
                  <th className="px-4 py-3.5">Permission</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{b.societyName}</div>
                      <div className="text-[11px] text-slate-400">By {b.submittedByName}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{b.activityType}</div>
                      <div className="text-[11px] text-slate-500">{b.participantCount} people</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800">{b.locationId}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{b.roomName}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{b.date}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-700">
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
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          title="View Full Booking Details"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" />
                          View
                        </button>

                        {/* Direct Approval Button */}
                        {b.status === 'Pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(b)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                              title="Approve Request"
                            >
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => setRejectingBooking(b)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold inline-flex items-center gap-1 transition-colors"
                              title="Reject Request with Reason"
                            >
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal with In-charge actions */}
      <BookingDetailsModal
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        onApprove={handleApprove}
        onReject={(b) => {
          setSelectedBooking(null);
          setRejectingBooking(b);
        }}
        canManage={true}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={Boolean(rejectingBooking)}
        onClose={() => setRejectingBooking(null)}
        booking={rejectingBooking}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
};
