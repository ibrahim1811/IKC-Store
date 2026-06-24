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
        <tr>
          <th>Versiyon</th>
          <th>Kod</th>
          <th>Tarih</th>
          <th>Changelog</th>
          <th>APK</th>
        </tr>
      </thead>
      <tbody>
        {versions.map(v => (
          <tr key={v.id}>
            <td>{v.versionName}</td>
            <td>{v.versionCode}</td>
            <td>{v.releasedAt ? new Date((v.releasedAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString('tr-TR') : '-'}</td>
            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.changelog}</td>
            <td><a href={v.apkUrl} target="_blank" rel="noreferrer" style={styles.link}>İndir</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles: Record<string, React.CSSProperties> = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' },
  link: { color: '#4f46e5', fontWeight: 600 },
};
