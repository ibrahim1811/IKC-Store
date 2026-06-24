import { useRef, useState } from 'react';
import { uploadToR2 } from '../lib/r2';

interface Props {
  path: string;
  label: string;
  accept: string;
  onUploaded: (url: string, size?: number) => void;
}

export default function FileUpload({ path, label, accept, onUploaded }: Props) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setDone(false);
    setError('');
    setProgress(0);
    try {
      const url = await uploadToR2(file, path, setProgress);
      onUploaded(url, file.size);
      setDone(true);
    } catch {
      setError('Yükleme başarısız.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={S.wrap}>
      <label style={S.label}>{label}</label>
      <div
        style={{ ...S.dropzone, ...(uploading ? S.dropzoneActive : {}) }}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={{ display: 'none' }} />
        {uploading ? (
          <div style={S.progressWrap}>
            <div style={{ ...S.progressBar, width: `${progress}%` }} />
            <span style={S.progressText}>{progress}%</span>
          </div>
        ) : done ? (
          <span style={S.doneText}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Yüklendi
          </span>
        ) : (
          <span style={S.hint}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Dosya seç veya sürükle
          </span>
        )}
      </div>
      {error && <span style={S.error}>{error}</span>}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.02em' },
  dropzone: {
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.875rem',
    cursor: 'pointer',
    transition: 'border-color var(--transition)',
    position: 'relative',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.02)',
  },
  dropzoneActive: { borderColor: 'var(--border-focus)' },
  hint: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-3)', fontSize: 12 },
  progressWrap: { height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', position: 'relative' },
  progressBar: { height: '100%', background: 'var(--accent)', borderRadius: 99, transition: 'width 0.15s ease' },
  progressText: { position: 'absolute', right: 0, top: -18, fontSize: 11, color: 'var(--text-2)' },
  doneText: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: 'var(--success)', fontSize: 12, fontWeight: 600 },
  error: { color: 'var(--danger)', fontSize: 11 },
};
