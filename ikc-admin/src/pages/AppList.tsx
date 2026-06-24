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
    const fetchApps = async () => {
      const q = query(collection(db, 'apps'), orderBy('updatedAt', 'desc'));
      const snap = await getDocs(q);
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() } as App)));
      setLoading(false);
    };
    fetchApps();
  }, []);

  if (loading) return <div style={styles.center}>Yükleniyor...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Uygulamalar</h2>
        <button onClick={() => navigate('/apps/new')} style={styles.addBtn}>+ Yeni Uygulama</button>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Ad</th>
            <th>Paket Adı</th>
            <th>Versiyon</th>
            <th>Durum</th>
            <th>İndirme</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {apps.map(app => (
            <tr key={app.id}>
              <td style={styles.appName}>
                {app.iconUrl && <img src={app.iconUrl} alt="" style={styles.icon} />}
                {app.name}
              </td>
              <td style={styles.mono}>{app.packageName}</td>
              <td>{app.currentVersion} ({app.currentVersionCode})</td>
              <td>
                <span style={{ ...styles.badge, background: app.status === 'published' ? '#22c55e' : '#f59e0b' }}>
                  {app.status === 'published' ? 'Yayında' : 'Taslak'}
                </span>
              </td>
              <td>{app.downloads ?? 0}</td>
              <td>
                <button onClick={() => navigate(`/apps/${app.id}`)} style={styles.editBtn}>Düzenle</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {apps.length === 0 && <p style={styles.empty}>Henüz uygulama yok.</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '2rem' },
  center: { textAlign: 'center', padding: '4rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  addBtn: { padding: '0.6rem 1.2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' },
  appName: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem' },
  icon: { width: 32, height: 32, borderRadius: '6px', objectFit: 'cover' },
  mono: { fontFamily: 'monospace', fontSize: '0.85rem' },
  badge: { padding: '0.2rem 0.7rem', borderRadius: '99px', color: '#fff', fontSize: '0.8rem', fontWeight: 600 },
  editBtn: { padding: '0.4rem 0.9rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  empty: { textAlign: 'center', color: '#888', marginTop: '3rem' },
};
