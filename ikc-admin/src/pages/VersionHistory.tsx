import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AppVersion } from '../lib/types';

interface Props { appId: string; }

export default function VersionHistory({ appId }: Props) {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'versions', appId, 'history'),
      orderBy('releasedAt', 'desc')
    );
    getDocs(q).then(snap => {
      setVersions(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppVersion)));
      setLoading(false);
    });
  }, [appId]);

  if (loading) return <div>Yükleniyor...</div>;
  if (versions.length === 0) return <p style={{ color: '#888' }}>Henüz versiyon kaydı yok.</p>;

  return (
    <table style={styles.table}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {['Versiyon','Kod','Tarih','Changelog','APK'].map(h => (
            <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {versions.map(v => (
          <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
            <td style={styles.td}>{v.versionName}</td>
            <td style={styles.td}>{v.versionCode}</td>
            <td style={styles.td}>{v.releasedAt ? new Date((v.releasedAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString('tr-TR') : '-'}</td>
            <td style={{ ...styles.td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.changelog}</td>
            <td style={styles.td}><a href={v.apkUrl} target="_blank" rel="noreferrer" style={styles.link}>İndir</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: { width: '100%', borderCollapse: 'collapse', background: 'var(--surface)', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' },
  td: { padding: '0.75rem 0.875rem', fontSize: 13, color: 'var(--text-1)' },
  link: { color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' },
};
