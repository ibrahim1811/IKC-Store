import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { App } from '../lib/types';
import { useNavigate } from 'react-router-dom';

export default function AppList() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'apps'), orderBy('updatedAt', 'desc'));
    getDocs(q).then(snap => {
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() } as App)));
      setLoading(false);
    });
  }, []);

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.heading}>Uygulamalar</h1>
          <p style={S.sub}>{apps.length} uygulama kayıtlı</p>
        </div>
        <button onClick={() => navigate('/apps/new')} style={S.addBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yeni Uygulama
        </button>
      </div>

      {loading ? (
        <div style={S.centerLoader}>
          <div style={S.spinner} />
        </div>
      ) : apps.length === 0 ? (
        <div style={S.empty}>
          <div style={S.emptyIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </div>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Henüz uygulama eklenmedi</p>
          <button onClick={() => navigate('/apps/new')} style={{ ...S.addBtn, marginTop: 12 }}>İlk uygulamayı ekle</button>
        </div>
      ) : (
        <div style={S.grid}>
          {apps.map(app => <AppCard key={app.id} app={app} onClick={() => navigate(`/apps/${app.id}`)} />)}
        </div>
      )}
    </div>
  );
}

function AppCard({ app, onClick }: { app: App; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...S.card, ...(hovered ? S.cardHover : {}) }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={S.cardTop}>
        {app.iconUrl
          ? <img src={app.iconUrl} alt="" style={S.icon} />
          : <div style={S.iconPlaceholder}>{app.name?.[0] ?? '?'}</div>
        }
        <span className={`badge ${app.status === 'published' ? 'badge-published' : 'badge-draft'}`}>
          {app.status === 'published' ? 'Yayında' : 'Taslak'}
        </span>
      </div>

      <h3 style={S.appName}>{app.name}</h3>
      <p style={S.appDesc}>{app.description?.slice(0, 60)}{(app.description?.length ?? 0) > 60 ? '…' : ''}</p>

      <div style={S.cardMeta}>
        <span className="mono" style={S.pkg}>{app.packageName}</span>
      </div>

      <div style={S.cardFooter}>
        <div style={S.stat}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          {app.downloads ?? 0}
        </div>
        <span className="mono" style={S.version}>v{app.currentVersion}</span>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: 1100 },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' },
  heading: { fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: 2 },
  sub: { fontSize: 13, color: 'var(--text-3)' },

  addBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '0.55rem 1rem',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none', borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 0 16px var(--accent-glow)',
  },

  centerLoader: { display: 'flex', justifyContent: 'center', paddingTop: '6rem' },
  spinner: {
    width: 28, height: 28,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },

  empty: { textAlign: 'center', paddingTop: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  emptyIcon: {
    width: 56, height: 56,
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },

  card: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    cursor: 'pointer',
    transition: 'background var(--transition), border-color var(--transition), transform var(--transition)',
  },
  cardHover: {
    background: 'var(--card-hover)',
    borderColor: 'rgba(167,139,250,0.3)',
    transform: 'translateY(-2px)',
  },

  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' },
  icon: { width: 44, height: 44, borderRadius: 10, objectFit: 'cover' },
  iconPlaceholder: {
    width: 44, height: 44, borderRadius: 10,
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700,
  },

  appName: { fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4, letterSpacing: '-0.02em' },
  appDesc: { fontSize: 12, color: 'var(--text-3)', marginBottom: '0.875rem', lineHeight: 1.5 },

  cardMeta: { marginBottom: '0.875rem' },
  pkg: { color: 'var(--text-3)', fontSize: 11, background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.5rem', borderRadius: 4 },

  cardFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: '0.75rem',
    borderTop: '1px solid var(--border)',
  },
  stat: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-3)' },
  version: { fontSize: 11, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '0.15rem 0.5rem', borderRadius: 4 },
};
