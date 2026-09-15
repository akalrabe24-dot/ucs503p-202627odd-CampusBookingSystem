import assert from 'node:assert/strict';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Isolated storage: these checks never read or change the browser's demo data.
const data = new Map();
globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key), clear: () => data.clear() };
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const h = React.createElement;
let assertions = 0;
const check = (condition, message) => { assert.ok(condition, message); assertions++; };
try {
  const { AuthProvider } = await server.ssrLoadModule('/src/context/AuthContext.tsx');
  const { PortalLayout } = await server.ssrLoadModule('/src/design/PortalLayout.tsx');
  const { storageService: storage } = await server.ssrLoadModule('/src/services/storageService.ts');
  const { DEMO_USERS } = await server.ssrLoadModule('/src/data/mockData.ts');
  const screens = [
    ['/student/dashboard', '/src/design/CampusOverview.tsx', 'CampusOverview', 'Room for'],
    ['/student/book', '/src/pages/BookResourcePage.tsx', 'BookResourcePage', 'What brings you together?'],
    ['/student/bookings', '/src/pages/MyBookingsPage.tsx', 'MyBookingsPage', 'My Bookings'],
    ['/student/notifications', '/src/pages/NotificationsPage.tsx', 'NotificationsPage', 'The latest updates.'],
    ['/availability', '/src/design/SpaceAvailability.tsx', 'SpaceAvailability', 'Find your'],
    ['/incharge/dashboard', '/src/pages/InChargeDashboard.tsx', 'InChargeDashboard', 'Ready for review.'],
    ['/admin/dashboard', '/src/pages/AdminDashboard.tsx', 'AdminDashboard', 'Campus, in order.'],
    ['/login', '/src/design/SignIn.tsx', 'SignIn', 'Welcome back.'],
  ];
  const render = (component, path, role = 'student', props = {}) => {
    data.set('campus_portal_auth_user', JSON.stringify(DEMO_USERS.find(user => user.role === role)));
    return renderToStaticMarkup(h(MemoryRouter, { initialEntries: [path] }, h(AuthProvider, null,
      h(Routes, null, h(Route, { element: h(PortalLayout) }, h(Route, { path: '*', element: h(component, props) }))))));
  };
  for (const [route, module, name, expected] of screens) {
    const component = (await server.ssrLoadModule(module))[name];
    const role = route.startsWith('/admin') ? 'admin' : route.startsWith('/incharge') ? 'incharge' : 'student';
    const markup = render(component, route, role);
    check(markup.includes(expected), `Screen failed to render: ${route}`);
    check(!markup.includes('undefined'), `Undefined visible value: ${route}`);
  }
  const { SpaceAvailability } = await server.ssrLoadModule('/src/design/SpaceAvailability.tsx');
  const markup = render(SpaceAvailability, '/availability?location=LP');
  const plazaRoom = storage.getRooms().find(room => room.locationId === 'LP');
  check(markup.includes(`room=${encodeURIComponent(plazaRoom.id)}`), 'Selected location must carry its room into booking links');
  check(markup.includes('start=08%3A00') && markup.includes('end=09%3A00'), 'Hourly booking links must carry both endpoints');
  check(markup.includes('Night permission required'), 'Late slots must show the night-permission rule');

  const { AdminDashboard } = await server.ssrLoadModule('/src/pages/AdminDashboard.tsx');
  check(render(AdminDashboard, '/admin/societies', 'admin').includes('Register Society'), 'Societies route must select societies tab');
  check(render(AdminDashboard, '/admin/rooms', 'admin').includes('Add Campus Room'), 'Rooms route must select rooms tab');

  const sample = storage.getBookings()[0];
  const created = storage.addBooking({ ...sample, id: undefined, date: '2099-10-14', startTime: '14:00', endTime: '15:00', submittedBy: DEMO_USERS[0].id });
  check(created.status === 'Pending', 'New bookings must await approval');
  check(!storage.checkRoomAvailability(created.roomId, created.date, '14:30', '15:30').available, 'Overlapping pending reservation must block the slot');
  check(storage.checkRoomAvailability(created.roomId, created.date, '15:00', '16:00').available, 'Adjacent reservation must remain available');
  storage.updateBookingStatus(created.id, 'Approved', { reviewerName: 'Test reviewer' });
  check(storage.getBookingById(created.id).status === 'Approved', 'Approval must persist');
  storage.updateBookingStatus(created.id, 'Rejected', { rejectionReason: 'Test reason' });
  check(storage.getBookingById(created.id).rejectionReason === 'Test reason', 'Rejection reason must persist');
  check(storage.checkRoomAvailability(created.roomId, created.date, '14:00', '15:00').available, 'Rejected reservation must release its slot');
  storage.updateBookingStatus(created.id, 'Cancelled');
  check(storage.checkRoomAvailability(created.roomId, created.date, '14:00', '15:00').available, 'Cancelled reservation must release its slot');
  const notices = storage.getNotifications();
  check(notices.some(notice => notice.bookingId === created.id), 'Booking actions must generate notifications');
  storage.markNotificationAsRead(notices[0].id);
  check(storage.getNotifications()[0].read, 'Notification read state must persist');

  storage.updateRoom({ ...plazaRoom, status: 'Unavailable' });
  const unavailable = render(SpaceAvailability, '/availability?location=LP');
  check(unavailable.includes('Room unavailable'), 'Unavailable room must be visibly identified');
  check(!unavailable.includes('class="slot-action"'), 'Unavailable room must not offer reservation links');
  console.log(`Passed ${assertions} render and booking-logic checks. These do not replace browser visual or interaction testing.`);
} finally {
  await server.close();
  delete globalThis.localStorage;
}
