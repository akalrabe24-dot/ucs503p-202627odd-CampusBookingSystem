import { useEffect, useState } from 'react';
import type { Booking } from '../types';
import { demoMode, errorMessage, requireSupabase } from './supabase';
import { storageService, subscribeToStorageChanges } from './storageService';

type Slot = Pick<Booking, 'startTime' | 'endTime'> & {
  status: 'Pending' | 'Approved' | 'Unavailable';
};
type Schedule = { key: string; slots: Slot[]; error: string };

export function useRoomSchedule(room: string | undefined, date: string): { slots: Slot[]; loading: boolean; error: string } {
  const key = room && date ? room + '/' + date : '';
  const [result, setResult] = useState<Schedule>();
  const [bookings, setBookings] = useState(storageService.getBookings);

  useEffect(() => {
    if (demoMode) return subscribeToStorageChanges(() => setBookings(storageService.getBookings()));
    if (!room || !date) return;
    let active = true;
    let sequence = 0;
    const load = async () => {
      const current = ++sequence;
      try {
        const { data, error } = await requireSupabase().rpc('room_schedule', { p_resource: room, p_date: date });
        if (error) throw error;
        if (active && current === sequence) setResult({ key, slots: data as Slot[], error: '' });
      } catch (error) {
        if (active && current === sequence) setResult({ key, slots: [], error: errorMessage(error) });
      }
    };
    void load();
    const unsubscribe = subscribeToStorageChanges(load);
    return () => { active = false; unsubscribe(); };
  }, [room, date, key]);

  if (demoMode) {
    const slots = bookings.filter((b): b is Booking & Slot =>
      b.roomId === room && b.date === date && (b.status === 'Pending' || b.status === 'Approved'));
    return { slots, loading: false, error: '' };
  }
  return {
    slots: result?.key === key ? result.slots : [],
    loading: !!key && result?.key !== key,
    error: result?.key === key ? result.error : '',
  };
}
