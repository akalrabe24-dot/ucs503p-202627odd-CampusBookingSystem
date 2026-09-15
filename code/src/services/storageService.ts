import {
  Booking,
  CampusRoom,
  Society,
  CampusLocation,
  SystemNotification,
  BookingStatus,
} from '../types';
import {
  INITIAL_BOOKINGS,
  INITIAL_ROOMS,
  INITIAL_SOCIETIES,
  INITIAL_LOCATIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

const KEYS = {
  BOOKINGS: 'campus_portal_bookings',
  ROOMS: 'campus_portal_rooms',
  SOCIETIES: 'campus_portal_societies',
  LOCATIONS: 'campus_portal_locations',
  NOTIFICATIONS: 'campus_portal_notifications',
};

// Event listener mechanism for reactivity
type Listener = () => void;
const listeners = new Set<Listener>();

const notifyChange = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeToStorageChanges = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Helpers for localStorage
const getStored = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
};

const setStored = <T>(key: string, data: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyChange();
  } catch (err) {
    console.error(`Error saving to localStorage [${key}]`, err);
  }
};

// Storage Service API
export const storageService = {
  // Initialize storage with defaults
  init() {
    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    }
    if (!localStorage.getItem(KEYS.ROOMS)) {
      localStorage.setItem(KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    }
    if (!localStorage.getItem(KEYS.SOCIETIES)) {
      localStorage.setItem(KEYS.SOCIETIES, JSON.stringify(INITIAL_SOCIETIES));
    }
    if (!localStorage.getItem(KEYS.LOCATIONS)) {
      localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  },

  // Reset demo data to factory defaults
  resetToDefaults() {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(KEYS.SOCIETIES, JSON.stringify(INITIAL_SOCIETIES));
    localStorage.setItem(KEYS.LOCATIONS, JSON.stringify(INITIAL_LOCATIONS));
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    notifyChange();
  },

  // Locations
  getLocations(): CampusLocation[] {
    return getStored<CampusLocation[]>(KEYS.LOCATIONS, INITIAL_LOCATIONS);
  },

  // Rooms
  getRooms(): CampusRoom[] {
    return getStored<CampusRoom[]>(KEYS.ROOMS, INITIAL_ROOMS);
  },

  getRoomsByLocation(locationId: string): CampusRoom[] {
    const rooms = this.getRooms();
    return rooms.filter((r) => r.locationId === locationId);
  },

  addRoom(newRoom: CampusRoom) {
    const rooms = this.getRooms();
    rooms.push(newRoom);
    setStored(KEYS.ROOMS, rooms);
  },

  updateRoom(updatedRoom: CampusRoom) {
    const rooms = this.getRooms();
    const index = rooms.findIndex((r) => r.id === updatedRoom.id);
    if (index !== -1) {
      rooms[index] = updatedRoom;
      setStored(KEYS.ROOMS, rooms);
    }
  },

  // Societies
  getSocieties(): Society[] {
    return getStored<Society[]>(KEYS.SOCIETIES, INITIAL_SOCIETIES);
  },

  addSociety(society: Society) {
    const societies = this.getSocieties();
    societies.push(society);
    setStored(KEYS.SOCIETIES, societies);
  },

  updateSociety(updated: Society) {
    const societies = this.getSocieties();
    const index = societies.findIndex((s) => s.id === updated.id);
    if (index !== -1) {
      societies[index] = updated;
      setStored(KEYS.SOCIETIES, societies);
    }
  },

  // Bookings
  getBookings(): Booking[] {
    return getStored<Booking[]>(KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },

  getBookingById(id: string): Booking | undefined {
    return this.getBookings().find((b) => b.id === id);
  },

  addBooking(bookingData: Omit<Booking, 'id' | 'submittedAt' | 'status'>): Booking {
    const bookings = this.getBookings();
    const newId = `CRB-2026-${String(bookings.length + 101).padStart(4, '0')}`;
    
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
    };

    bookings.unshift(newBooking);
    setStored(KEYS.BOOKINGS, bookings);

    // Notify Permission In-charge
    this.addNotification({
      title: 'New Booking Awaiting Approval',
      message: `${newBooking.societyName} requested ${newBooking.roomName} on ${newBooking.date} (${newBooking.startTime}-${newBooking.endTime}).`,
      type: 'info',
      bookingId: newId,
      recipientRole: 'incharge',
    });

    return newBooking;
  },

  updateBookingStatus(
    id: string,
    status: BookingStatus,
    options?: {
      reviewerName?: string;
      rejectionReason?: string;
      approvalRemarks?: string;
    }
  ): Booking | null {
    const bookings = this.getBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const b = bookings[index];
    b.status = status;
    if (options?.reviewerName) {
      b.reviewedBy = 'usr-incharge-1';
      b.reviewedByName = options.reviewerName;
      b.reviewedAt = new Date().toISOString();
    }
    if (options?.rejectionReason) {
      b.rejectionReason = options.rejectionReason;
    }
    if (options?.approvalRemarks) {
      b.approvalRemarks = options.approvalRemarks;
    }

    bookings[index] = b;
    setStored(KEYS.BOOKINGS, bookings);

    // Send notification to student
    if (status === 'Approved') {
      this.addNotification({
        title: 'Booking Approved!',
        message: `Your booking for ${b.roomName} on ${b.date} has been approved by ${options?.reviewerName || 'Permission In-charge'}.`,
        type: 'success',
        bookingId: b.id,
        recipientRole: 'student',
      });
    } else if (status === 'Rejected') {
      this.addNotification({
        title: 'Booking Request Rejected',
        message: `Your booking for ${b.roomName} on ${b.date} was rejected: "${options?.rejectionReason || 'No reason provided'}"`,
        type: 'error',
        bookingId: b.id,
        recipientRole: 'student',
      });
    } else if (status === 'Cancelled') {
      this.addNotification({
        title: 'Booking Cancelled',
        message: `Booking ${b.id} for ${b.roomName} has been cancelled.`,
        type: 'warning',
        bookingId: b.id,
        recipientRole: 'all',
      });
    }

    return b;
  },

  // Availability / Conflict Detection
  checkRoomAvailability(
    roomId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): { available: boolean; conflictingBooking?: Booking } {
    if (!roomId || !date || !startTime || !endTime) {
      return { available: true };
    }

    const bookings = this.getBookings();
    // A conflicting booking is one on the same room, same date, with status 'Approved' or 'Pending'
    // where time ranges overlap: (startA < endB) and (endA > startB)
    const conflict = bookings.find((b) => {
      if (b.roomId !== roomId) return false;
      if (b.date !== date) return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.status !== 'Approved' && b.status !== 'Pending') return false;

      // Time overlap calculation
      return startTime < b.endTime && endTime > b.startTime;
    });

    if (conflict) {
      return { available: false, conflictingBooking: conflict };
    }

    return { available: true };
  },

  // Notifications
  getNotifications(): SystemNotification[] {
    return getStored<SystemNotification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) {
    const notifications = this.getNotifications();
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    notifications.unshift(newNotif);
    setStored(KEYS.NOTIFICATIONS, notifications);
  },

  markNotificationAsRead(id: string) {
    const notifs = this.getNotifications();
    const item = notifs.find((n) => n.id === id);
    if (item) {
      item.read = true;
      setStored(KEYS.NOTIFICATIONS, notifs);
    }
  },

  markAllNotificationsAsRead() {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    setStored(KEYS.NOTIFICATIONS, notifs);
  },
};

// Auto-initialize on import
storageService.init();
