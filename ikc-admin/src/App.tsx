import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Login from './pages/Login';
import AppList from './pages/AppList';
import AppForm from './pages/AppForm';
import Setup from './pages/Setup';

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={S.spinner} />
    </div>
  );

  return (
    <BrowserRouter>
      {user ? (
        <div style={S.shell}>
          <aside style={S.sidebar}>
            <div style={S.glow} />
            <div style={S.brand}>
              <div style={S.logo}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--accent)" opacity=".9"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={S.brandName}>IKC Store</span>
              <span style={S.brandSub}>Admin</span>
            </div>

            <nav style={S.nav}>
              <NavLink to="/" end style={({ isActive }) => ({ ...S.navItem, ...(isActive ? S.navActive : {}) })}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                Uygulamalar
              </NavLink>
            </nav>

            <div style={S.userRow}>
              <div style={S.avatar}>{user.email?.[0].toUpperCase()}</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={S.userEmail}>{user.email}</p>
              </div>
              <button onClick={() => auth.signOut()} style={S.signOutBtn} title="Çıkış">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              </button>
            </div>
          </aside>

          <main style={S.main}>
            <Routes>
              <Route path="/" element={<AppList />} />
              <Route path="/apps/:id" element={<AppForm />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

const S: Record<string, React.CSSProperties> = {
  shell: { display: 'flex', height: '100vh', overflow: 'hidden' },

  sidebar: {
    width: 'var(--sidebar-w)',
    flexShrink: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },

  glow: {
    position: 'absolute',
    top: -60, left: -60,
    width: 200, height: 200,
    background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  brand: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '1.25rem 1rem 1rem',
    borderBottom: '1px solid var(--border)',
  },
  logo: {
    width: 32, height: 32,
    background: 'var(--accent-dim)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brandName: { fontWeight: 700, fontSize: 14, color: 'var(--text-1)', letterSpacing: '-0.02em' },
  brandSub: {
    marginLeft: 'auto',
    fontSize: 10, fontWeight: 600,
    color: 'var(--accent)',
    background: 'var(--accent-dim)',
    padding: '0.1rem 0.4rem',
    borderRadius: 4,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },

  nav: { flex: 1, padding: '0.75rem 0.5rem' },

  navItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '0.55rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-2)',
    textDecoration: 'none',
    fontSize: 13, fontWeight: 500,
    transition: 'all var(--transition)',
  },
  navActive: {
    color: 'var(--accent)',
    background: 'var(--accent-dim)',
  },

  userRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '0.75rem 1rem',
    borderTop: '1px solid var(--border)',
  },
  avatar: {
    width: 28, height: 28, borderRadius: 99,
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  userEmail: {
    fontSize: 11, color: 'var(--text-3)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  signOutBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-3)', padding: 4, borderRadius: 6,
    display: 'flex', alignItems: 'center',
    transition: 'color var(--transition)',
    flexShrink: 0,
  },

  main: { flex: 1, overflow: 'auto', background: 'var(--bg)' },

  spinner: {
    width: 32, height: 32,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
};
