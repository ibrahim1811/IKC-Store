import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Login from './pages/Login';
import AppList from './pages/AppList';
import AppForm from './pages/AppForm';
import Setup from './pages/Setup';

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  if (user === undefined) return <div style={{ textAlign: 'center', padding: '4rem' }}>Yükleniyor...</div>;

  return (
    <BrowserRouter>
      {user ? (
        <div style={styles.layout}>
          <nav style={styles.nav}>
            <span style={styles.navTitle}>IKC Store Admin</span>
            <button onClick={() => auth.signOut()} style={styles.signOut}>Çıkış</button>
          </nav>
          <main style={styles.main}>
            <Routes>
              <Route path="/" element={<AppList />} />
              <Route path="/apps/:id" element={<AppForm />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            {/* /setup rotası sadece ilk kurulum için — kullanıldıktan sonra kaldır */}
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

const styles: Record<string, React.CSSProperties> = {
  layout: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' },
  nav: { background: '#1a1a2e', padding: '0 2rem', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  navTitle: { color: '#fff', fontWeight: 700, fontSize: '1.1rem' },
  signOut: { background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.3rem 0.9rem', borderRadius: '6px', cursor: 'pointer' },
  main: { flex: 1 },
};
