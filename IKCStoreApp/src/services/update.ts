import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';

export interface UpdateInfo {
  hasUpdate: boolean;
  appId: string;
  appName: string;
  newVersion: string;
  newVersionCode: number;
  apkUrl: string;
  changelog: string;
}

export async function checkForUpdate(appId: string): Promise<UpdateInfo | null> {
  const doc = await firestore().collection('apps').doc(appId).get();
  if (!doc.exists) return null;

  const data = doc.data()!;
  const remoteVersionCode: number = data.currentVersionCode;
  const localVersionCode = Number(await DeviceInfo.getBuildNumber());

  return {
    hasUpdate: remoteVersionCode > localVersionCode,
    appId,
    appName: data.name,
    newVersion: data.currentVersion,
    newVersionCode: remoteVersionCode,
    apkUrl: data.apkUrl,
    changelog: data.changelog,
  };
}

// IKC Store kendi kendini kontrol eder — package name buraya yazılacak
export const IKC_STORE_APP_ID = 'IKC_STORE_FIRESTORE_APP_ID';
