import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../data/mockData';
import { campusPhoto } from './CampusOverview';
import type { User } from '../types';

export const SignIn = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('aayati.sharma@thapar.edu');
  const [password, setPassword] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const signIn = (user: User) => { loginAs(user); navigate(`/${user.role}/dashboard`); };
  const submit = (event: FormEvent) => { event.preventDefault(); signIn(DEMO_USERS.find(user => user.email.toLowerCase() === email.trim().toLowerCase()) || DEMO_USERS[0]); };
  return <main className="signin-page"><section className="signin-story"><Link to="/" className="wordmark" aria-label="Campus Reserve home"><span>CAMPUS</span><span>RESERVE.</span></Link><div className="signin-title"><span className="eyebrow">THAPAR INSTITUTE · PATIALA</span><h1>Good things<br />start with<br /><em>a space.</em></h1></div>{!imageFailed && <img className="signin-image" src={campusPhoto} alt="Thapar Learning Laboratory courtyard" onError={() => setImageFailed(true)} />}<p className="signin-caption">The Learning Laboratory · McCullough Mulvin Architects</p></section><section className="signin-form-side"><div className="signin-form-wrap"><span className="eyebrow">YOUR CAMPUS. YOUR NEXT CHAPTER.</span><h2>Welcome back.</h2><p>Book a room, gather your society, make something happen.</p><form onSubmit={submit}><label htmlFor="email">Institute email</label><input id="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /><label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Not required for demo accounts" /><button type="button" className="underlined-link login-help" onClick={() => setShowHelp(!showHelp)} aria-expanded={showHelp}>Need help signing in?</button>{showHelp && <p className="signin-help" role="status">This is a local demonstration. Choose an account below to explore the portal; no password is verified.</p>}<button type="submit" className="button-primary">Enter the portal <span aria-hidden="true">↗</span></button></form><div className="signin-demo"><span className="eyebrow">OR EXPLORE A DEMO ACCOUNT</span>{DEMO_USERS.map(user => <button key={user.id} onClick={() => signIn(user)}><span>{user.role === 'student' ? 'Student / society' : user.role === 'admin' ? 'Campus admin' : 'Permission in-charge'}</span><span aria-hidden="true">↗</span></button>)}</div><p className="signin-footnote">Demo access · Data stays in this browser.</p></div></section></main>;
};
