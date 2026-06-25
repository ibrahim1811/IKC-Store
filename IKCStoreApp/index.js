/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { OneSignal } from 'react-native-onesignal';
import notifee, { AndroidImportance } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

OneSignal.initialize('622495e1-ec19-4310-bd00-2ef84f3c0a88');
OneSignal.Notifications.requestPermission(true);

// FCM arka plan handler (OneSignal olmayan bildirimler için)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  await notifee.createChannel({ id: 'updates', name: 'Güncellemeler', importance: AndroidImportance.HIGH });
  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? 'IKC Store',
    body: remoteMessage.notification?.body ?? '',
    android: { channelId: 'updates', smallIcon: 'ic_launcher' },
  });
});

AppRegistry.registerComponent(appName, () => App);
