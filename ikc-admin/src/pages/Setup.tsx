/**
 * Tek kullanımlık admin hesabı oluşturma sayfası.
 * Kullanıldıktan sonra bu dosyayı sil ve App.tsx'ten route'u kaldır.
 */
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Setup() {
  const [done, setDone] = useState(false);
  const [uid, setUid] = useState('');
  const [error, setError] = useState('');

  const [password, setPassword] = useState('');

  const handleSetup = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, 'ikcdeveloper@gmail.com', password);
      setUid(cred.user.uid);
      setDone(true);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 480, margin: '4rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.1)' }}>
      <h2>Admin Kurulum (Tek Kullanım)</h2>
      {done ? (
        <>
          <p style={{ color: '#22c55e', fontWeight: 700 }}>Admin hesabı oluşturuldu!</p>
          <p>Aşağıdaki UID'yi kopyala ve:</p>
          <ul>
            <li><code>firebase/firestore.rules</code></li>
            <li><code>firebase/storage.rules</code></li>
          </ul>
          <p>dosyalarındaki <code>ADMIN_UID_BURAYA</code> kısmını güncelle, ardından bu sayfayı sil.</p>
          <code style={{ display: 'block', background: '#f1f5f9', padding: '0.75rem', borderRadius: 6, wordBreak: 'break-all' }}>{uid}</code>
        </>
      ) : (
        <>
          {error && <p style={{ color: '#ef4444' }}>{error}</p>}
          <input type="password" placeholder="Şifren" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 6, width: '100%' }} />
          <button onClick={handleSetup} style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Admin Hesabı Oluştur
          </button>
        </>
      )}
    </div>
  );
}
