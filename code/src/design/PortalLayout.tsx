import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService, subscribeToStorageChanges } from '../services/storageService';
import type { UserRole } from '../types';

export const PortalLayout = () => {
  const { user, switchRole, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<'account' | 'notifications' | null>(null);
  const [notifications, setNotifications] = useState(storageService.getNotifications);
  const controls = useRef<HTMLDivElement>(null);
  useEffect(() => { window.scrollTo(0, 0); setMenuOpen(false); setPanel(null); }, [pathname]);
  useEffect(() => subscribeToStorageChanges(() => setNotifications(storageService.getNotifications())), []);
  useEffect(() => {
    const dismiss = (e: MouseEvent) => { if (!controls.current?.contains(e.target as Node)) setPanel(null); };
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setPanel(null); setMenuOpen(false); } };
    document.addEventListener('mousedown', dismiss); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', dismiss); document.removeEventListener('keydown', escape); };
  }, []);
  const updates = notifications.filter(n => !n.recipientRole || n.recipientRole === 'all' || n.recipientRole === user.role);
  const unread = updates.filter(n => !n.read).length;
  const chooseRole = (role: UserRole) => { switchRole(role); navigate(`/${role}/dashboard`); setPanel(null); };
  const links = user.role === 'student' ? [['Overview', '/student/dashboard'], ['Find a space', '/availability'], ['My bookings', '/student/bookings'], ['Updates', '/student/notifications']] : user.role === 'incharge' ? [['Overview', '/incharge/dashboard'], ['Pending requests', '/incharge/pending'], ['All bookings', '/incharge/bookings'], ['Availability', '/availability'], ['Updates', '/student/notifications']] : [['Overview', '/admin/dashboard'], ['Rooms', '/admin/rooms'], ['Societies', '/admin/societies'], ['Bookings', '/incharge/bookings'], ['Reports', '/admin/reports'], ['Availability', '/availability']];
  return <div className="portal-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="masthead">
      <Link to="/" className="wordmark" aria-label="Campus Reserve home"><span>CAMPUS</span><span>RESERVE<span className="wordmark-period">.</span></span></Link>
      <div className="institution">THAPAR INSTITUTE<span>RESOURCE & BOOKING OFFICE</span></div>
      <div className="masthead-controls" ref={controls}>
        <button className="notification-trigger" aria-label={`Notifications, ${unread} unread`} aria-expanded={panel === 'notifications'} onClick={() => setPanel(panel === 'notifications' ? null : 'notifications')}><Bell size={19} strokeWidth={1.4} />{unread > 0 && <span>{unread}</span>}</button>
        <button className="account-trigger" aria-expanded={panel === 'account'} onClick={() => setPanel(panel === 'account' ? null : 'account')}><span className="account-initials">{user.name.split(' ').slice(0, 2).map(n => n[0]).join('')}</span><span className="account-name">{user.name}<small>{user.role === 'student' ? 'Society representative' : user.role === 'admin' ? 'Campus administration' : 'Permission in-charge'}</small></span><ChevronDown size={14} /></button>
        <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        {panel === 'account' && <div className="header-panel account-panel"><p className="eyebrow">Demo account</p><p className="panel-name">{user.name}</p><p className="panel-secondary">{user.email}</p><div className="role-list">{(['student', 'incharge', 'admin'] as UserRole[]).map(role => <button key={role} onClick={() => chooseRole(role)} aria-current={user.role === role ? 'true' : undefined}>{role === 'student' ? 'Student / society' : role === 'incharge' ? 'Permission in-charge' : 'Campus admin'}<span>{user.role === role ? 'Selected' : 'Switch'}</span></button>)}</div><button className="signout-link" onClick={() => { logout(); navigate('/login'); }}>Sign out</button></div>}
        {panel === 'notifications' && <div className="header-panel notifications-panel"><div className="panel-title"><h2>Updates</h2><button aria-label="Close notifications" onClick={() => setPanel(null)}><X size={18} /></button></div><button className="text-link" onClick={() => updates.forEach(n => storageService.markNotificationAsRead(n.id))}>Mark all as read</button><div className="notification-list">{updates.length === 0 && <p>No updates yet.</p>}{updates.slice(0, 5).map(n => <button key={n.id} className={n.read ? 'read' : ''} onClick={() => { storageService.markNotificationAsRead(n.id); navigate(user.role === 'incharge' ? '/incharge/pending' : '/student/notifications'); setPanel(null); }}><strong>{n.title}</strong><span>{n.message}</span><small>{n.timestamp}</small></button>)}</div></div>}
      </div>
    </header>
    <div className={`navigation-bar ${menuOpen ? 'is-open' : ''}`}><nav aria-label="Main navigation">{links.map(([label, path], i) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><span className="nav-number">0{i + 1}</span>{label}</NavLink>)}</nav>{user.role === 'student' && <NavLink className="nav-reserve" to="/student/book">New booking <span aria-hidden="true">↗</span></NavLink>}</div>
    <main id="main-content" className={`portal-main ${pathname === '/student/dashboard' ? 'home-route' : 'legacy-route'}`}><Outlet /></main>
    <footer className="portal-footer"><span>Campus Reserve</span><span>Thapar Institute · Patiala</span><span>Spaces for what comes next.</span></footer>
  </div>;
};
