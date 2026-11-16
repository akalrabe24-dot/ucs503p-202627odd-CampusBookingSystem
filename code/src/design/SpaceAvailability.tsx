import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { storageService, subscribeToStorageChanges } from '../services/storageService';
import { BookingDetailsModal } from '../components/booking/BookingDetailsModal';
import { StatusBadge } from '../components/common/StatusBadge';
import { useRoomSchedule } from '../services/useRoomSchedule';
import { useAuth } from '../context/AuthContext';
import type { Booking } from '../types';

export const localDate = (date: Date) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export const SpaceAvailability = () => {
  const { user } = useAuth();
  const canReserve = user.role === 'student';
  const [params] = useSearchParams();
  const locations = storageService.getLocations();
  const [rooms, setRooms] = useState(storageService.getRooms);
  const [bookings, setBookings] = useState(storageService.getBookings);
  const initialLocation = locations.find(l => l.id === params.get('location'))?.id || 'LT';
  const [locationId, setLocationId] = useState(initialLocation);
  const [roomId, setRoomId] = useState(rooms.find(r => r.locationId === initialLocation)?.id || 'LT-101');
  const tomorrow = new Date(Date.now() + 86_400_000);
  const [date, setDate] = useState(localDate(tomorrow));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  useEffect(() => subscribeToStorageChanges(() => { setRooms(storageService.getRooms()); setBookings(storageService.getBookings()); }), []);
  const roomOptions = rooms.filter(r => r.locationId === locationId);
  const room = roomOptions.find(r => r.id === roomId) || roomOptions[0];
  const { slots: busySlots, loading, error } = useRoomSchedule(room?.id, date);
  const location = locations.find(l => l.id === locationId);
  const blocked = !room || room.status === 'Unavailable';
  const reservationLink = (start?: string, end?: string) => `/student/book?${new URLSearchParams({ location: locationId, room: room?.id || '', date, ...(start ? { start, end: end! } : {}) }).toString()}`;
  const slots = Array.from({ length: 14 }, (_, index) => {
    const start = `${String(index + 8).padStart(2, '0')}:00`;
    const end = `${String(index + 9).padStart(2, '0')}:00`;
    const overlaps = (item: { startTime: string; endTime: string }) => start < item.endTime && end > item.startTime;
    const busy = busySlots.filter(overlaps);
    const status = busy.find(slot => slot.status === 'Unavailable')?.status ?? busy[0]?.status;
    const booking = bookings.find(b => b.roomId === room?.id && b.date === date
      && b.status === status && overlaps(b));
    return { start, end, booking, status };
  });
  return <div className="availability-workspace"><div className="page-heading"><span className="eyebrow">THE CAMPUS DIRECTORY</span><h1>Find your <em>space.</em></h1><p>Choose a place and a day. See what’s free.</p></div>
    <div className="space-selectors"><div><label htmlFor="location">01 / LOCATION</label><select id="location" value={locationId} onChange={e => { const next = locations.find(l => l.id === e.target.value)!; setLocationId(next.id); setRoomId(rooms.find(r => r.locationId === next.id)?.id || ''); }}>{locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div><div><label htmlFor="room">02 / ROOM</label><select id="room" value={room?.id || ''} onChange={e => setRoomId(e.target.value)} disabled={!roomOptions.length}>{roomOptions.length ? roomOptions.map(r => <option key={r.id} value={r.id}>{r.name} · {r.capacity} people</option>) : <option value="">No rooms at this location</option>}</select></div><div><label htmlFor="date">03 / DATE</label><input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required /></div></div>
    {room ? <><section className="venue-summary"><div><span className="eyebrow">{location?.name}</span><h2>{room.name}</h2><p>{room.facilities.join(' · ')}</p></div><dl><div><dt>CAPACITY</dt><dd>{room.capacity}<small>people</small></dd></div><div><dt>SPACE TYPE</dt><dd className="venue-type">{room.type}<small>{room.floor || 'Ground floor'}</small></dd></div></dl>{!blocked && date && canReserve ? <Link className="button-primary" to={reservationLink()}>Book this room <span aria-hidden="true">↗</span></Link> : <span className="venue-unavailable">{blocked ? 'Currently unavailable' : !date ? 'Choose a date' : ''}</span>}</section>
    <section className="schedule-section"><div className="section-heading"><div><span className="eyebrow">DAILY AVAILABILITY</span><h2>{date ? new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Choose a date'}</h2></div><span className="schedule-timezone">08:00—22:00 · Campus time (IST)</span></div>{error && <p role="alert">{error}</p>}{loading && <p role="status">Checking availability…</p>}{date && !loading && !error && <div className="schedule-grid">{slots.map(slot => <div key={slot.start} className={`schedule-row ${blocked || slot.status === 'Unavailable' ? 'slot-blocked' : slot.status ? 'slot-reserved' : 'slot-free'}`}><div className="slot-time">{slot.start}<span>— {slot.end}</span></div><div className="slot-description">{blocked ? 'Room unavailable' : slot.status === 'Unavailable' ? 'Maintenance' : slot.status ? (slot.booking?.societyName ?? 'Reserved') : Number(slot.start.slice(0, 2)) >= 20 ? 'Night permission required' : 'Open for booking'}</div>{blocked || slot.status === 'Unavailable' ? <StatusBadge status="Unavailable" /> : slot.booking ? <button className="slot-action" aria-label={`View ${slot.start} booking`} onClick={() => setSelectedBooking(slot.booking!)}><StatusBadge status={slot.booking.status === 'Approved' ? 'Booked' : 'Pending'} /></button> : slot.status ? <StatusBadge status={slot.status === 'Approved' ? 'Booked' : 'Pending'} /> : canReserve ? <Link className="slot-action" to={reservationLink(slot.start, slot.end)} aria-label={`Book ${room.name} at ${slot.start}`}>Reserve <span aria-hidden="true">↗</span></Link> : <StatusBadge status="Available" />}</div>)}</div>}<p className="schedule-note">Requests remain subject to approval. Sessions after 20:00 require night permission.</p></section></> : <div className="empty-requests"><p>No rooms are listed here yet.</p><span>Choose another location above.</span></div>}
    <BookingDetailsModal isOpen={!!selectedBooking} booking={selectedBooking} onClose={() => setSelectedBooking(null)} canManage={false} />
  </div>;
};
