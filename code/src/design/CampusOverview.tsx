import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storageService, subscribeToStorageChanges } from '../services/storageService';
import { StatusBadge } from '../components/common/StatusBadge';
import { BookingDetailsModal } from '../components/booking/BookingDetailsModal';
import type { Booking } from '../types';

export const campusPhoto = 'https://s3-eu-west-1.amazonaws.com/mcculloughmulvin-media/project/_w1800/7414/Tll_Screenshot-2021-10-07-at-17.02.11.jpg';
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
export const CampusOverview = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState(storageService.getBookings);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => subscribeToStorageChanges(() => setBookings(storageService.getBookings())), []);
  const mine = bookings.filter(b => b.submittedBy === user.id || (user.societyId && b.societyId === user.societyId));
  const pending = mine.filter(b => b.status === 'Pending').length;
  const approved = mine.filter(b => b.status === 'Approved').length;
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  return <div className="campus-overview">
    <div className="overview-kicker"><p className="eyebrow">YOUR CAMPUS, {user.name.split(' ')[0].toUpperCase()}</p><span>{today}</span></div>
    <section className="overview-lead" aria-labelledby="welcome-heading">
      <div className="lead-copy"><h1 id="welcome-heading">Room for<br />your next<br /><em>big idea.</em></h1><p>From the first rehearsal to the final applause.<br className="desktop-break" /> Find a space. Bring your people.</p><div className="lead-actions"><Link className="button-primary" to="/student/book">Book a space <span aria-hidden="true">↗</span></Link><Link className="underlined-link" to="/availability">Check availability</Link></div><div className="society-note"><span>BOOKING ON BEHALF OF</span><strong>{user.societyName || 'Your student society'}</strong></div></div>
      <figure className="campus-figure">{!imageFailed ? <img src={campusPhoto} alt="Red sandstone buildings and planted courtyard at Thapar's Learning Laboratory" onError={() => setImageFailed(true)} fetchPriority="high" /> : <div className="photo-fallback"><span>THAPAR INSTITUTE</span><strong>A place to<br /><em>come together.</em></strong><Link to="/availability">Explore campus spaces ↗</Link></div>}<figcaption><span>THE LEARNING LABORATORY</span><span>PATIALA, PUNJAB <span aria-hidden="true">↗</span></span></figcaption></figure>
    </section>
    <section className="overview-ledger" aria-label="Booking summary"><div className="ledger-intro"><span className="eyebrow">AT A GLANCE</span><p>Your society.<br />In motion.</p></div><div className="ledger-stat"><strong>{String(mine.length).padStart(2, '0')}</strong><span>Total requests</span></div><div className="ledger-stat"><strong>{String(pending).padStart(2, '0')}</strong><span>Awaiting approval</span></div><div className="ledger-stat"><strong>{String(approved).padStart(2, '0')}</strong><span>Approved bookings</span></div><Link to="/student/bookings" className="ledger-link">Manage your<br />bookings <span aria-hidden="true">↗</span></Link></section>
    <div className="overview-bottom"><section className="request-section"><div className="section-heading"><div><span className="eyebrow">02 / YOUR SCHEDULE</span><h2>On the books.</h2></div><Link className="underlined-link" to="/student/bookings">View all requests</Link></div><div className="requests-table-wrap"><table className="requests-table"><thead><tr><th>ACTIVITY / SPACE</th><th>WHEN</th><th>STATUS</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{mine.slice(0, 4).map(b => <tr key={b.id}><td><strong>{'workshopName' in b.details ? b.details.workshopName : 'eventName' in b.details ? b.details.eventName : b.activityType}</strong><span>{b.roomName} · {b.locationName}</span></td><td><strong>{formatDate(b.date)}</strong><span>{b.startTime}–{b.endTime}</span></td><td><StatusBadge status={b.status} /></td><td><button className="request-open" aria-label={`View booking ${b.id}`} onClick={() => setSelected(b)}>↗</button></td></tr>)}</tbody></table>{mine.length === 0 && <div className="empty-requests"><p>Your next gathering starts here.</p><Link className="underlined-link" to="/student/book">Make your first booking</Link></div>}</div></section>
    <aside className="campus-directory"><span className="eyebrow">03 / EXPLORE</span><h2>Across<br /><em>campus.</em></h2><p>{storageService.getLocations().length} locations. A space for every kind of gathering.</p><div className="directory-links">{[['Lecture theatres', 'LT'], ['Library Plaza', 'LP'], ['Main auditorium', 'Main Auditorium']].map(([name, id], i) => <Link key={id} to={`/availability?location=${encodeURIComponent(id)}`}><span>0{i + 1}</span><strong>{name}</strong><span aria-hidden="true">↗</span></Link>)}</div><Link className="underlined-link" to="/availability">See all spaces</Link></aside></div>
    <p className="photo-credit">Architecture photograph: <a href="https://mcculloughmulvin.com/projects/thapar-university-learning-centre" target="_blank" rel="noreferrer">McCullough Mulvin Architects</a></p>
    <BookingDetailsModal isOpen={!!selected} booking={selected} onClose={() => setSelected(null)} canManage={false} onCancel={b => { if (window.confirm(`Cancel booking ${b.id}?`)) { storageService.updateBookingStatus(b.id, 'Cancelled', { rejectionReason: 'Cancelled by applicant student.' }); setSelected(null); } }} />
  </div>;
};
