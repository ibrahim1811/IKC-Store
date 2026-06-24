import RNFS from 'react-native-fs';
import { incrementDownloads } from './firebase';

export async function downloadApk(
  appId: string,
  apkUrl: string,
  onProgress: (percent: number) => void
): Promise<string> {
  const destPath = `${RNFS.ExternalDirectoryPath}/${appId}-${Date.now()}.apk`;

  await incrementDownloads(appId);

  const download = RNFS.downloadFile({
    fromUrl: apkUrl,
    toFile: destPath,
    progress: res => {
      const percent = Math.round((res.bytesWritten / res.contentLength) * 100);
      onProgress(percent);
    },
    progressInterval: 200,
  });

  const result = await download.promise;
  if (result.statusCode !== 200) throw new Error('İndirme başarısız');

  return destPath;
}
