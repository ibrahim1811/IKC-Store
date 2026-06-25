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
  ratingSum?: number;
  ratingCount?: number;
}

export interface CommentData {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  rating: number;
  createdAt: any;
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
  const data = doc.data();
  return data ? ({ id: doc.id, ...data } as AppData) : null;
}

async function ensureAuth() {
  const current = auth().currentUser;
  if (!current) {
    await auth().signInAnonymously();
  }
  return auth().currentUser!;
}

export async function trackUniqueDownload(appId: string) {
  const user = await ensureAuth();
  const appRef = firestore().collection('apps').doc(appId);
  const downloaderRef = appRef.collection('downloaders').doc(user.uid);

  await firestore().runTransaction(async tx => {
    const downloaderDoc = await tx.get(downloaderRef);
    if (!downloaderDoc.exists) {
      tx.set(downloaderRef, { downloadedAt: firestore.FieldValue.serverTimestamp() });
      tx.update(appRef, { downloads: firestore.FieldValue.increment(1) });
    }
  });
}

export async function fetchComments(appId: string): Promise<CommentData[]> {
  const snap = await firestore()
    .collection('apps').doc(appId)
    .collection('comments')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommentData));
}

export async function addComment(appId: string, text: string, displayName: string, rating: number) {
  const user = await ensureAuth();
  const appRef = firestore().collection('apps').doc(appId);
  const commentRef = appRef.collection('comments').doc();

  const batch = firestore().batch();
  batch.set(commentRef, {
    uid: user.uid,
    displayName: displayName.trim() || 'Anonim',
    text: text.trim(),
    rating,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  if (rating > 0) {
    batch.update(appRef, {
      ratingSum: firestore.FieldValue.increment(rating),
      ratingCount: firestore.FieldValue.increment(1),
    });
  }
  await batch.commit();
}

export async function toggleFavorite(appId: string): Promise<boolean> {
  const user = await ensureAuth();
  const ref = firestore()
    .collection('users').doc(user.uid)
    .collection('favorites').doc(appId);
  const doc = await ref.get();
  if (doc.data()) {
    await ref.delete();
    return false;
  }
  await ref.set({ savedAt: firestore.FieldValue.serverTimestamp() });
  return true;
}

export async function checkFavorite(appId: string): Promise<boolean> {
  const user = await ensureAuth();
  const doc = await firestore()
    .collection('users').doc(user.uid)
    .collection('favorites').doc(appId)
    .get();
  return doc.data() !== undefined;
}

export async function fetchFavorites(): Promise<AppData[]> {
  const user = await ensureAuth();
  const snap = await firestore()
    .collection('users').doc(user.uid)
    .collection('favorites')
    .get();
  const ids = snap.docs.map(d => d.id);
  if (ids.length === 0) return [];
  const appSnap = await firestore()
    .collection('apps')
    .where(firestore.FieldPath.documentId(), 'in', ids)
    .get();
  return appSnap.docs.map(d => ({ id: d.id, ...d.data() } as AppData));
}

export async function saveFcmToken(token: string) {
  const user = await ensureAuth();
  await firestore()
    .collection('users').doc(user.uid)
    .set({ fcmToken: token, updatedAt: firestore.FieldValue.serverTimestamp() }, { merge: true });
}
