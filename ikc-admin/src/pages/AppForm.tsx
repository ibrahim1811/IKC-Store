import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  doc, getDoc, setDoc, addDoc, collection, serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { App } from '../lib/types';
import FileUpload from '../components/FileUpload';
import VersionHistory from './VersionHistory';

const emptyApp: Omit<App, 'id'> = {
  name: '', packageName: '', description: '', iconUrl: '',
  category: '', currentVersion: '', currentVersionCode: 0,
  apkUrl: '', apkSize: 0, screenshots: [], changelog: '',
  status: 'draft', downloads: 0,
};

export default function AppForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const [form, setForm] = useState<Omit<App, 'id'>>(emptyApp);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'info' | 'versions'>('info');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNew && id) {
      getDoc(doc(db, 'apps', id)).then(snap => {
        if (snap.exists()) setForm(snap.data() as Omit<App, 'id'>);
      });
    }
  }, [id, isNew]);

  const set = (field: keyof typeof form, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, updatedAt: serverTimestamp() };
    if (isNew) {
      const ref = await addDoc(collection(db, 'apps'), {
        ...data, publishedAt: null, downloads: 0
      });
      // yeni sürüm kaydı oluştur
      await addVersionRecord(ref.id);
      navigate(`/apps/${ref.id}`);
    } else {
      await setDoc(doc(db, 'apps', id!), data, { merge: true });
      await addVersionRecord(id!);
    }
    setSaving(false);
  };

  const addVersionRecord = async (appId: string) => {
    if (!form.apkUrl || !form.currentVersion) return;
    await addDoc(collection(db, 'versions', appId, 'history'), {
      versionName: form.currentVersion,
      versionCode: form.currentVersionCode,
      apkUrl: form.apkUrl,
      changelog: form.changelog,
      releasedAt: Timestamp.now(),
    });
  };

  const toggleStatus = () =>
    set('status', form.status === 'published' ? 'draft' : 'published');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.back}>← Geri</button>
        <h2>{isNew ? 'Yeni Uygulama' : form.name}</h2>
        <div style={styles.actions}>
          <button onClick={toggleStatus} style={{
            ...styles.statusBtn,
            background: form.status === 'published' ? '#f59e0b' : '#22c55e'
          }}>
            {form.status === 'published' ? 'Taslağa Al' : 'Yayına Al'}
          </button>
          <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {!isNew && (
        <div style={styles.tabs}>
          <button onClick={() => setTab('info')} style={tab === 'info' ? styles.tabActive : styles.tab}>Bilgiler</button>
          <button onClick={() => setTab('versions')} style={tab === 'versions' ? styles.tabActive : styles.tab}>Versiyon Geçmişi</button>
        </div>
      )}

      {tab === 'versions' && !isNew ? (
        <VersionHistory appId={id!} />
      ) : (
        <div style={styles.grid}>
          <Field label="Uygulama Adı" value={form.name} onChange={v => set('name', v)} />
          <Field label="Paket Adı" value={form.packageName} onChange={v => set('packageName', v)} placeholder="com.ikc.yolbilen" />
          <Field label="Kategori" value={form.category} onChange={v => set('category', v)} />
          <Field label="Versiyon Adı" value={form.currentVersion} onChange={v => set('currentVersion', v)} placeholder="1.0.0" />
          <Field label="Versiyon Kodu" value={String(form.currentVersionCode)} onChange={v => set('currentVersionCode', Number(v))} type="number" />
          <div style={styles.fullWidth}>
            <Field label="Açıklama" value={form.description} onChange={v => set('description', v)} multiline />
          </div>
          <div style={styles.fullWidth}>
            <Field label="Changelog" value={form.changelog} onChange={v => set('changelog', v)} multiline />
          </div>
          <div>
            <FileUpload
              path={`apps/${form.packageName || 'app'}/icons`}
              label="İkon"
              accept="image/*"
              onUploaded={url => set('iconUrl', url)}
            />
            {form.iconUrl && <img src={form.iconUrl} alt="icon" style={styles.preview} />}
          </div>
          <div>
            <FileUpload
              path={`apps/${form.packageName || 'app'}/apks`}
              label="APK Dosyası"
              accept=".apk"
              onUploaded={(url, size) => { set('apkUrl', url); if (size) set('apkSize', size); }}
            />
            {form.apkUrl && <a href={form.apkUrl} target="_blank" rel="noreferrer" style={styles.link}>Mevcut APK</a>}
          </div>
          <div style={styles.fullWidth}>
            <FileUpload
              path={`apps/${form.packageName || 'app'}/screenshots`}
              label="Ekran Görüntüsü Ekle"
              accept="image/*"
              onUploaded={url => set('screenshots', [...form.screenshots, url])}
            />
            <div style={styles.screenshots}>
              {form.screenshots.map((s, i) => (
                <div key={i} style={styles.ssWrap}>
                  <img src={s} alt="" style={styles.screenshot} />
                  <button
                    onClick={() => set('screenshots', form.screenshots.filter((_, j) => j !== i))}
                    style={styles.removeBtn}
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, multiline, type, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; type?: string; placeholder?: string;
}) {
  const common = {
    padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px',
    fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' as const,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} style={{ ...common, minHeight: '80px', resize: 'vertical' }} />
        : <input type={type ?? 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={common} />
      }
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '2rem', maxWidth: '900px' },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  back: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#4f46e5' },
  actions: { marginLeft: 'auto', display: 'flex', gap: '0.5rem' },
  saveBtn: { padding: '0.6rem 1.2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  statusBtn: { padding: '0.6rem 1.2rem', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' },
  tab: { padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', borderRadius: '6px' },
  tabActive: { padding: '0.5rem 1rem', background: '#eef2ff', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 600, borderRadius: '6px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  fullWidth: { gridColumn: '1 / -1' },
  preview: { width: 64, height: 64, borderRadius: '12px', objectFit: 'cover', marginTop: '0.5rem' },
  link: { display: 'block', marginTop: '0.5rem', color: '#4f46e5', fontSize: '0.85rem' },
  screenshots: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' },
  ssWrap: { position: 'relative' },
  screenshot: { width: 80, height: 140, objectFit: 'cover', borderRadius: '6px' },
  removeBtn: { position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '99px', width: 20, height: 20, cursor: 'pointer', fontSize: '0.8rem', lineHeight: '1' },
};
