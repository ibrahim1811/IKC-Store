import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

export { firestore, storage, auth };

export interface AppData {
  id: string;
  name: string;
  packageName: string;
  description: string;
  iconUrl: string;
  category: string;
  currentVersion: string;
  currentVersionCode: number;
  apkUrl: string;
  apkSize: number;
  screenshots: string[];
  changelog: string;
  status: 'draft' | 'published';
  downloads: number;
}

export async function fetchPublishedApps(): Promise<AppData[]> {
  const snap = await firestore()
    .collection('apps')
    .where('status', '==', 'published')
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppData));
}

export async function fetchApp(appId: string): Promise<AppData | null> {
  const doc = await firestore().collection('apps').doc(appId).get();
  return doc.exists ? ({ id: doc.id, ...doc.data() } as AppData) : null;
}

export async function incrementDownloads(appId: string) {
  await firestore()
    .collection('apps')
    .doc(appId)
    .update({ downloads: firestore.FieldValue.increment(1) });
}
