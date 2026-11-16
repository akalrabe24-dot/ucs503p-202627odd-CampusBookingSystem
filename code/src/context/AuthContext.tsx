import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { demoMode, errorMessage, requireSupabase, supabase } from '../services/supabase';
import { refreshPortal, resetPortal } from '../services/storageService';

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  profileError?: string;
  loginAs: (user: User) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void | Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'campus_portal_auth_user';
const guest: User = { id: '', name: '', email: '', role: 'student' };

type ProviderProps = { children: React.ReactNode };

function DemoAuth({ children }: ProviderProps) {
  const [user, setUser] = useState<User>(() => {
    try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) ?? 'null') ?? DEMO_USERS[0]; }
    catch { return DEMO_USERS[0]; }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  useEffect(() => { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)); }, [user]);
  const loginAs = (selected: User) => { setUser(selected); setIsAuthenticated(true); };
  const switchRole = (role: UserRole) => loginAs(DEMO_USERS.find(item => item.role === role) ?? DEMO_USERS[0]);
  return <AuthContext.Provider value={{ user, isAuthenticated, loginAs, switchRole,
    logout: () => setIsAuthenticated(false) }}>{children}</AuthContext.Provider>;
}

function SupabaseAuth({ children }: ProviderProps) {
  const [account, setAccount] = useState<string | null>();
  const [profile, setProfile] = useState<User | null>(null);
  const [failure, setFailure] = useState<{ account: string; message: string }>();
  const [dataIssue, setDataIssue] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!supabase) { setAccount(null); return; }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccount(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!account) return;
    let active = true;
    let timer: number | undefined;
    let ready = false;
    resetPortal(account);
    const refresh = async () => {
      try {
        await refreshPortal();
        if (active) setDataIssue('');
        return true;
      } catch (error) {
        if (active) setDataIssue(errorMessage(error));
        return false;
      }
    };

    const start = async () => {
      try {
        const { data, error } = await requireSupabase().from('profiles').select('*').eq('id', account).maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Ask the campus administrator to provision a portal profile for your account.');
        if (!active) return;
        ready = await refresh();
        if (active && ready) setProfile(data as User);
        if (active) timer = window.setInterval(() => {
          void refresh().then(ok => {
            if (active && ok && !ready) { ready = true; setProfile(data as User); }
          });
        }, 30_000);
      } catch (error) {
        if (active) setFailure({ account, message: errorMessage(error) });
      }
    };
    const onFocus = () => { if (ready) void refresh(); };
    void start();
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      resetPortal(null);
    };
  }, [account, attempt]);

  const logout = async () => {
    const { error } = await requireSupabase().auth.signOut({ scope: 'local' });
    if (error) throw error;
    setProfile(null);
    setFailure(undefined);
    setDataIssue('');
  };
  const user = account && profile?.id === account ? profile : guest;
  const profileError = account && failure?.account === account ? failure.message : undefined;
  if (account === undefined || (account && !user.id && !profileError)) {
    return <main aria-busy={!dataIssue}>
      <p role="status">{dataIssue || 'Connecting to the campus portal…'}</p>
      {dataIssue && <button onClick={() => setAttempt(value => value + 1)}>Retry</button>}
    </main>;
  }
  const unavailable = () => { throw new Error('Demo accounts are disabled in Supabase mode.'); };
  return <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user.id), profileError,
    loginAs: unavailable, switchRole: unavailable, logout }}>
    {account && dataIssue && <p role="alert">Could not refresh campus data. {dataIssue}</p>}
    {children}
  </AuthContext.Provider>;
}

export function AuthProvider(props: ProviderProps) {
  return demoMode ? <DemoAuth {...props} /> : <SupabaseAuth {...props} />;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
