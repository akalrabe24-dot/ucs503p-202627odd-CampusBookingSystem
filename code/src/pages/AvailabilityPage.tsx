import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarSearch,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
  Info,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { CampusLocationCode, Booking } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingDetailsModal } from '../components/booking/BookingDetailsModal';

export const AvailabilityPage: React.FC = () => {
  const navigate = useNavigate();

  const locations = storageService.getLocations();
  const allRooms = storageService.getRooms();
  const allBookings = storageService.getBookings();

  // Pickers state
  const [selectedLocationId, setSelectedLocationId] = useState<CampusLocationCode>('LT');
  const availableRooms = allRooms.filter((r) => r.locationId === selectedLocationId);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    availableRooms[0]?.id || 'LT-101'
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(
    tomorrow.toISOString().split('T')[0]
  );

  const [inspectedBooking, setInspectedBooking] = useState<Booking | null>(null);

  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const selectedRoom = allRooms.find((r) => r.id === selectedRoomId) || availableRooms[0] || allRooms[0];

  // Generate slots from 08:00 AM to 10:00 PM (14 hourly intervals)
  const hourlySlots = useMemo(() => {
    const hours = [
      { start: '08:00', end: '09:00', label: '08:00 AM - 09:00 AM' },
      { start: '09:00', end: '10:00', label: '09:00 AM - 10:00 AM' },
      { start: '10:00', end: '11:00', label: '10:00 AM - 11:00 AM' },
      { start: '11:00', end: '12:00', label: '11:00 AM - 12:00 PM' },
      { start: '12:00', end: '13:00', label: '12:00 PM - 01:00 PM' },
      { start: '13:00', end: '14:00', label: '01:00 PM - 02:00 PM' },
      { start: '14:00', end: '15:00', label: '02:00 PM - 03:00 PM' },
      { start: '15:00', end: '16:00', label: '03:00 PM - 04:00 PM' },
      { start: '16:00', end: '17:00', label: '04:00 PM - 05:00 PM' },
      { start: '17:00', end: '18:00', label: '05:00 PM - 06:00 PM' },
      { start: '18:00', end: '19:00', label: '06:00 PM - 07:00 PM' },
      { start: '19:00', end: '20:00', label: '07:00 PM - 08:00 PM' },
      { start: '20:00', end: '21:00', label: '08:00 PM - 09:00 PM (Night)' },
      { start: '21:00', end: '22:00', label: '09:00 PM - 10:00 PM (Night)' },
    ];

    // Check against bookings
    return hours.map((slot) => {
      // Find booking for this room & date overlapping this hour
      const matched = allBookings.find((b) => {
        if (b.roomId !== selectedRoom.id) return false;
        if (b.date !== selectedDate) return false;
        if (b.status === 'Cancelled' || b.status === 'Rejected') return false;

        // Overlap: slot.start < b.endTime && slot.end > b.startTime
        return slot.start < b.endTime && slot.end > b.startTime;
      });

      if (!matched) {
        return {
          ...slot,
          status: 'Available' as const,
          booking: null,
        };
      }

      return {
        ...slot,
        status: matched.status as 'Approved' | 'Pending',
        booking: matched,
      };
    });
  }, [allBookings, selectedRoom, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Campus Resource Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect hourly real-time schedules across all 12 zones and avoid booking collisions.
        </p>
      </div>

      {/* Selector Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Select Campus Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                value={selectedLocationId}
                onChange={(e) => {
                  const newLoc = e.target.value as CampusLocationCode;
                  setSelectedLocationId(newLoc);
                  const matched = allRooms.filter((r) => r.locationId === newLoc);
                  if (matched.length > 0) setSelectedRoomId(matched[0].id);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none bg-white font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.id} — {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Select Room / Venue
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none bg-white font-medium"
              >
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} (Cap: {room.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              3. Select Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none bg-white font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Venue Snapshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{selectedRoom.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              {selectedLocation.name}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Capacity: <strong className="text-slate-800">{selectedRoom.capacity} attendees</strong> • Type: {selectedRoom.type} • Floor: {selectedRoom.floor || 'Ground'}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedRoom.facilities.map((fac, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white text-slate-600 text-[10px] border border-blue-200/50 font-medium"
              >
                {fac}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/student/book')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors self-start sm:self-auto shrink-0"
        >
          Book this Room
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Visual Time Slot Schedule */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Hourly Schedule for {selectedDate}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual breakdown from 08:00 AM to 10:00 PM
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Booked
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Pending
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {hourlySlots.map((slot, index) => {
            const isAvailable = slot.status === 'Available';
            const isApproved = slot.status === 'Approved';
            const isPending = slot.status === 'Pending';

            return (
              <div
                key={index}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isAvailable
                    ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/70'
                    : isApproved
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg font-bold text-xs ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-700'
                        : isApproved
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{slot.label}</p>
                    {isAvailable ? (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Open for Reservation
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-600 truncate max-w-[200px]">
                        {slot.booking?.societyName} ({slot.booking?.activityType})
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {isAvailable ? (
                    <button
                      type="button"
                      onClick={() => navigate('/student/book')}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      🟢 Available
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setInspectedBooking(slot.booking)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        isApproved
                          ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      }`}
                    >
                      {isApproved ? '🔴 Booked' : '🟡 Pending'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={Boolean(inspectedBooking)}
        onClose={() => setInspectedBooking(null)}
        booking={inspectedBooking}
        canManage={false}
      />
    </div>
  );
};
