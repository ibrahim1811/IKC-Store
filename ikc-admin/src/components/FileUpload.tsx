import { useRef, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setDone(false);
    setProgress(0);

    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      () => { setUploading(false); },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        onUploaded(url, file.size);
        setUploading(false);
        setDone(true);
      }
    );
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>{label}</label>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} style={styles.input} />
      {uploading && (
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          <span style={styles.progressText}>{progress}%</span>
        </div>
      )}
      {done && <span style={styles.done}>Yüklendi</span>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  input: { padding: '0.5rem', border: '1px solid #ddd', borderRadius: '6px' },
  progressBar: { position: 'relative', height: '20px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' },
  progressFill: { height: '100%', background: '#4f46e5', transition: 'width 0.2s' },
  progressText: { position: 'absolute', right: '0.5rem', top: '2px', fontSize: '0.75rem', color: '#fff' },
  done: { color: '#22c55e', fontSize: '0.85rem', fontWeight: 600 },
};
