import type { Booking, BookingStatus, CampusLocation, CampusRoom, Society, SystemNotification } from '../types';
import { storageService as demoStorage, subscribeToStorageChanges as subscribeToDemo } from './demoStorage';
import { demoMode, requireSupabase } from './supabase';

type Snapshot = {
  locations: CampusLocation[];
  rooms: CampusRoom[];
  societies: Society[];
  bookings: Booking[];
  notifications: SystemNotification[];
};

const empty: Snapshot = { locations: [], rooms: [], societies: [], bookings: [], notifications: [] };
let snapshot = empty;
let viewer: string | null = null;
let version = 0;
const listeners = new Set<() => void>();

export function subscribeToStorageChanges(listener: () => void) {
  if (demoMode) return subscribeToDemo(listener);
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function resetPortal(nextViewer: string | null) {
  viewer = nextViewer;
  version += 1;
  snapshot = empty;
  listeners.forEach(listener => listener());
}

async function fetchRows<T>(
  table: string, order = 'id', ascending = true, columns = '*',
): Promise<T[]> {
  const client = requireSupabase();
  const rows: T[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from(table).select(columns)
      .order(order, { ascending }).order('id')
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    rows.push(...data as T[]);
    if (data.length < pageSize) return rows;
  }
}

export async function refreshPortal() {
  if (!viewer) return;
  const current = ++version;
  const [locations, rooms, societies, bookings, inbox] = await Promise.all([
    fetchRows<CampusLocation>('locations'),
    fetchRows<CampusRoom>('resources'),
    fetchRows<Society>('societies'),
    fetchRows<Booking>('portal_bookings', 'submittedAt', false),
    fetchRows<SystemNotification>('notifications', 'created_at', false,
      'id,title,message,timestamp:created_at,type,read,bookingId:booking_id'),
  ]);
  if (current !== version) return;
  const notifications = inbox.map(notification => ({
    ...notification,
    timestamp: new Date(notification.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  }));
  snapshot = { locations, rooms, societies, bookings, notifications };
  listeners.forEach(listener => listener());
}

function reloadAfterWrite() {
  // The write is committed even if the next read fails. Focus and polling retry the read.
  void refreshPortal().catch(() => undefined);
}

type BookingInput = Parameters<typeof demoStorage.addBooking>[0];
type StatusOptions = Parameters<typeof demoStorage.updateBookingStatus>[2];

const remoteStorage = {
  getLocations: () => snapshot.locations,
  getRooms: () => snapshot.rooms,
  getRoomsByLocation: (locationId: string) => snapshot.rooms.filter(room => room.locationId === locationId),
  getSocieties: () => snapshot.societies,
  getBookings: () => snapshot.bookings,
  getBookingById: (id: string) => snapshot.bookings.find(booking => booking.id === id),
  getNotifications: () => snapshot.notifications,
  resetToDefaults() {},

  async addRoom(room: CampusRoom) { await saveCatalog('resources', room, false); },
  async updateRoom(room: CampusRoom) { await saveCatalog('resources', room, true); },
  async addSociety(society: Society) { await saveCatalog('societies', society, false); },
  async updateSociety(society: Society) { await saveCatalog('societies', society, true); },
  async addBooking(input: BookingInput): Promise<Booking> {
    const client = requireSupabase();
    const { data: id, error } = await client.rpc('submit_booking', {
      p_resource: input.roomId, p_society: input.societyId, p_activity: input.activityType,
      p_date: input.date, p_start: input.startTime, p_end: input.endTime,
      p_permission: input.permissionType, p_purpose: input.purpose,
      p_participants: input.participantCount, p_details: input.details,
    });
    if (error) throw error;
    reloadAfterWrite();
    // Keep confirmation available even if the follow-up list read fails.
    return { ...input, id, status: 'Pending', submittedAt: new Date().toISOString() };
  },
  async updateBookingStatus(id: string, status: BookingStatus, options?: StatusOptions) {
    const { error } = await requireSupabase().rpc('change_booking_status', {
      p_booking: id, p_status: status, p_reason: options?.rejectionReason ?? options?.approvalRemarks ?? null,
    });
    if (error) throw error;
    reloadAfterWrite();
  },
  async markNotificationAsRead(id: string) { await markRead(id); },
  async markAllNotificationsAsRead() { await markRead(); },
};

async function saveCatalog(table: string, row: CampusRoom | Society, update: boolean) {
  const { id, ...values } = row;
  const query = requireSupabase().from(table);
  const request = update ? query.update(values).eq('id', id) : query.insert({ id, ...values });
  const { error } = await request.select('id').single();
  if (error) throw error;
  reloadAfterWrite();
}

async function markRead(id?: string) {
  const query = requireSupabase().from('notifications').update({ read: true }).eq('read', false);
  const { error } = await (id ? query.eq('id', id) : query);
  if (error) throw error;
  reloadAfterWrite();
}

export const storageService = demoMode ? demoStorage : remoteStorage;
