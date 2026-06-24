import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_EMAIL = 'ikcdeveloper@gmail.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setError('Bu panel sadece yetkili admin içindir.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.bg1} />
      <div style={S.bg2} />

      <div style={S.card}>
        <div style={S.logoWrap}>
          <div style={S.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="var(--accent)" opacity=".9"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={S.title}>IKC Store</h1>
          <p style={S.subtitle}>Admin Paneli</p>
        </div>

        <form onSubmit={handleLogin} style={S.form}>
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ikcdeveloper@gmail.com"
              required
              autoComplete="email"
            />
          </div>
          <div style={S.field}>
            <label style={S.label}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={S.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={S.btn}>
            {loading ? (
              <span style={S.btnSpinner} />
            ) : (
              <>
                Giriş Yap
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg)',
    position: 'relative',
    overflow: 'hidden',
  },
  bg1: {
    position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
    width: 600, height: 400,
    background: 'radial-gradient(ellipse, rgba(167,139,250,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bg2: {
    position: 'absolute', bottom: -100, right: -100,
    width: 350, height: 350,
    background: 'radial-gradient(circle, rgba(103,232,249,0.07) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%', maxWidth: 360,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    backdropFilter: 'blur(12px)',
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: { textAlign: 'center', marginBottom: '1.75rem' },
  logoIcon: {
    width: 52, height: 52,
    background: 'var(--accent-dim)',
    border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: 14,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '0.875rem',
  },
  title: { fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'var(--text-3)' },

  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.02em' },

  errorBox: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--danger)',
    padding: '0.5rem 0.75rem',
    fontSize: 12,
  },

  btn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '0.7rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-ui)',
    fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity var(--transition), box-shadow var(--transition)',
    boxShadow: '0 0 20px var(--accent-glow)',
    marginTop: 4,
  },
  btnSpinner: {
    width: 16, height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
};
