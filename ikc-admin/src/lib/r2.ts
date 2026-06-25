import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
  region: 'auto',
  endpoint: import.meta.env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = import.meta.env.VITE_R2_BUCKET;
const PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

export async function uploadToR2(
  file: File,
  folder: string,
  onProgress: (pct: number) => void
): Promise<string> {
  const key = `${folder}/${Date.now()}_${file.name.replace(/\s/g, '_')}`;
  const contentType = file.type || 'application/octet-stream';

  const signedUrl = await getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 3600 }
  );

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`HTTP ${xhr.status}`)));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.ontimeout = () => reject(new Error('Upload timeout'));
    xhr.timeout = 0;
    xhr.send(file);
  });

  return `${PUBLIC_URL}/${key}`;
}

export async function deleteFromR2(url: string): Promise<void> {
  const key = url.replace(`${PUBLIC_URL}/`, '');
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
