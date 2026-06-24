import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
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
  const [saved, setSaved] = useState(false);
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
      const ref = await addDoc(collection(db, 'apps'), { ...data, publishedAt: null, downloads: 0 });
      await addVersionRecord(ref.id);
      navigate(`/apps/${ref.id}`);
    } else {
      await setDoc(doc(db, 'apps', id!), data, { merge: true });
      await addVersionRecord(id!);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
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

  const isPublished = form.status === 'published';

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <button onClick={() => navigate('/')} style={S.back}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Uygulamalar
        </button>

        <h1 style={S.heading}>{isNew ? 'Yeni Uygulama' : form.name || 'Düzenle'}</h1>

        <div style={S.actions}>
          <button
            onClick={() => set('status', isPublished ? 'draft' : 'published')}
            style={{ ...S.statusBtn, ...(isPublished ? S.statusDraft : S.statusPublish) }}
          >
            {isPublished ? (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>Taslağa Al</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>Yayına Al</>
            )}
          </button>

          <button onClick={handleSave} disabled={saving} style={S.saveBtn}>
            {saving ? <span style={S.btnSpinner} /> : saved ? (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Kaydedildi</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Kaydet</>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      {!isNew && (
        <div style={S.tabs}>
          <button onClick={() => setTab('info')} style={{ ...S.tab, ...(tab === 'info' ? S.tabActive : {}) }}>Bilgiler</button>
          <button onClick={() => setTab('versions')} style={{ ...S.tab, ...(tab === 'versions' ? S.tabActive : {}) }}>Versiyon Geçmişi</button>
        </div>
      )}

      {tab === 'versions' && !isNew ? (
        <div style={S.content}><VersionHistory appId={id!} /></div>
      ) : (
        <div style={S.content}>
          <div style={S.grid}>
            {/* Sol kolon */}
            <div style={S.col}>
              <Section title="Temel Bilgiler">
                <Field label="Uygulama Adı" value={form.name} onChange={v => set('name', v)} placeholder="Yolbilen" />
                <Field label="Paket Adı" value={form.packageName} onChange={v => set('packageName', v)} placeholder="com.ikc.yolbilen" mono />
                <Field label="Kategori" value={form.category} onChange={v => set('category', v)} placeholder="Navigasyon" />
                <Field label="Açıklama" value={form.description} onChange={v => set('description', v)} multiline />
              </Section>

              <Section title="Versiyon">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Versiyon Adı" value={form.currentVersion} onChange={v => set('currentVersion', v)} placeholder="1.0.0" mono />
                  <Field label="Versiyon Kodu" value={String(form.currentVersionCode)} onChange={v => set('currentVersionCode', Number(v))} type="number" mono />
                </div>
                <Field label="Değişiklikler (Changelog)" value={form.changelog} onChange={v => set('changelog', v)} multiline />
              </Section>
            </div>

            {/* Sağ kolon */}
            <div style={S.col}>
              <Section title="Medya">
                <div style={S.uploadRow}>
                  <FileUpload path={`apps/${form.packageName || 'app'}/icons`} label="Uygulama İkonu" accept="image/*" onUploaded={url => set('iconUrl', url)} />
                  {form.iconUrl && <img src={form.iconUrl} alt="icon" style={S.iconPrev} />}
                </div>
                <FileUpload path={`apps/${form.packageName || 'app'}/screenshots`} label="Ekran Görüntüsü Ekle" accept="image/*" onUploaded={url => set('screenshots', [...form.screenshots, url])} />
                {form.screenshots.length > 0 && (
                  <div style={S.screenshots}>
                    {form.screenshots.map((s, i) => (
                      <div key={i} style={S.ssWrap}>
                        <img src={s} alt="" style={S.ss} />
                        <button onClick={() => set('screenshots', form.screenshots.filter((_, j) => j !== i))} style={S.ssRemove}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="APK Dosyası">
                <FileUpload
                  path={`apps/${form.packageName || 'app'}/apks`}
                  label="APK Yükle"
                  accept=".apk"
                  onUploaded={(url, size) => { set('apkUrl', url); if (size) set('apkSize', size); }}
                />
                {form.apkUrl && (
                  <a href={form.apkUrl} target="_blank" rel="noreferrer" style={S.apkLink}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    Mevcut APK · {form.apkSize ? `${(form.apkSize / 1024 / 1024).toFixed(1)} MB` : ''}
                  </a>
                )}
              </Section>

              {/* Stats */}
              {!isNew && (
                <div style={S.statsCard}>
                  <div style={S.statItem}>
                    <span style={S.statVal}>{form.downloads ?? 0}</span>
                    <span style={S.statLabel}>İndirme</span>
                  </div>
                  <div style={S.statDivider} />
                  <div style={S.statItem}>
                    <span className={`badge ${isPublished ? 'badge-published' : 'badge-draft'}`}>
                      {isPublished ? 'Yayında' : 'Taslak'}
                    </span>
                    <span style={S.statLabel}>Durum</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={SS.wrap}>
      <p style={SS.title}>{title}</p>
      <div style={SS.body}>{children}</div>
    </div>
  );
}
const SS: Record<string, React.CSSProperties> = {
  wrap: { marginBottom: '1rem' },
  title: { fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' },
  body: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' },
};

function Field({ label, value, onChange, multiline, type, placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; type?: string; placeholder?: string; mono?: boolean;
}) {
  const inputStyle: React.CSSProperties = mono ? { fontFamily: 'var(--font-mono)', fontSize: 12 } : {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.02em' }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
        : <input type={type ?? 'text'} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      }
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: 960 },
  header: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-3)', fontSize: 13,
    transition: 'color var(--transition)',
  },
  heading: { fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em', flex: 1 },
  actions: { display: 'flex', gap: '0.5rem', marginLeft: 'auto' },

  statusBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '0.5rem 0.875rem',
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
    cursor: 'pointer',
  },
  statusPublish: { background: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.25)', color: 'var(--success)' },
  statusDraft: { background: 'rgba(252,211,77,0.08)', borderColor: 'rgba(252,211,77,0.25)', color: 'var(--warning)' },

  saveBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '0.5rem 1rem',
    background: 'var(--accent)',
    color: '#fff', border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 0 14px var(--accent-glow)',
  },
  btnSpinner: {
    width: 14, height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },

  tabs: { display: 'flex', gap: '0.25rem', marginBottom: '1.25rem' },
  tab: {
    padding: '0.45rem 0.875rem',
    background: 'none', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-2)', fontSize: 13, fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'var(--font-ui)',
  },
  tabActive: { background: 'var(--accent-dim)', borderColor: 'rgba(167,139,250,0.3)', color: 'var(--accent)' },

  content: { },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' },
  col: { display: 'flex', flexDirection: 'column' },

  uploadRow: { display: 'flex', alignItems: 'flex-start', gap: '1rem' },
  iconPrev: { width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' },
  screenshots: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  ssWrap: { position: 'relative' },
  ss: { width: 64, height: 110, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' },
  ssRemove: {
    position: 'absolute', top: 2, right: 2,
    background: 'rgba(0,0,0,0.7)', color: '#fff',
    border: 'none', borderRadius: '50%',
    width: 18, height: 18, cursor: 'pointer',
    fontSize: 12, lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  apkLink: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    color: 'var(--accent)', fontSize: 12, fontWeight: 500,
    textDecoration: 'none', marginTop: 4,
  },

  statsCard: {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '1.25rem',
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    marginTop: 0,
  },
  statItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  statVal: { fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' },
  statLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  statDivider: { width: 1, height: 36, background: 'var(--border)' },
};
