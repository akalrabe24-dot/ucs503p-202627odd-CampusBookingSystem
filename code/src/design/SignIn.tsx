import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../data/mockData';
import { campusPhoto } from './CampusOverview';
import { demoMode, errorMessage, requireSupabase, supabase } from '../services/supabase';
import type { User } from '../types';

export const SignIn = () => {
  const { loginAs, isAuthenticated, profileError, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(demoMode ? 'aayati.sharma@thapar.edu' : '');
  const [password, setPassword] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const signIn = (user: User) => { loginAs(user); navigate(`/${user.role}/dashboard`); };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (demoMode) {
      signIn(DEMO_USERS.find(user => user.email.toLowerCase() === email.trim().toLowerCase()) ?? DEMO_USERS[0]);
      return;
    }
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  };
  if (!demoMode && isAuthenticated) return <Navigate to="/" replace />;
  return <main className="signin-page"><section className="signin-story"><Link to="/" className="wordmark" aria-label="Campus Reserve home"><span>CAMPUS</span><span>RESERVE.</span></Link><div className="signin-title"><span className="eyebrow">THAPAR INSTITUTE · PATIALA</span><h1>Good things<br />start with<br /><em>a space.</em></h1></div>{!imageFailed && <img className="signin-image" src={campusPhoto} alt="Thapar Learning Laboratory courtyard" onError={() => setImageFailed(true)} />}<p className="signin-caption">The Learning Laboratory · McCullough Mulvin Architects</p></section><section className="signin-form-side"><div className="signin-form-wrap"><span className="eyebrow">YOUR CAMPUS. YOUR NEXT CHAPTER.</span><h2>Welcome back.</h2><p>Book a room, gather your society, make something happen.</p>{(error || profileError) && <p role="alert">{error || profileError}</p>}{!demoMode && !supabase && <p role="status">Campus sign-in requires the Supabase connection settings.</p>}{profileError ? <button type="button" onClick={() => Promise.resolve(logout()).catch(err => setError(errorMessage(err)))}>Sign out</button> : <form onSubmit={submit}><label htmlFor="email">Institute email</label><input id="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder={demoMode ? 'Not required for demo accounts' : undefined} required={!demoMode} /><button type="button" className="underlined-link login-help" onClick={() => setShowHelp(!showHelp)} aria-expanded={showHelp}>Need help signing in?</button>{showHelp && <p className="signin-help" role="status">{demoMode ? 'Choose a demo account to explore the portal.' : 'Contact your campus administrator for account access or a password reset.'}</p>}<button type="submit" className="button-primary" disabled={busy || (!demoMode && !supabase)}>Enter the portal <span aria-hidden="true">↗</span></button></form>}{demoMode && <><div className="signin-demo"><span className="eyebrow">OR EXPLORE A DEMO ACCOUNT</span>{DEMO_USERS.map(user => <button key={user.id} onClick={() => signIn(user)}><span>{user.role === 'student' ? 'Student / society' : user.role === 'admin' ? 'Campus admin' : 'Permission in-charge'}</span><span aria-hidden="true">↗</span></button>)}</div><p className="signin-footnote">Demo access · Data stays in this browser.</p></>}</div></section></main>;
};
