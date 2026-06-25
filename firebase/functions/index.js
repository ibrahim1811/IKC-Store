const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

// Yeni versiyon kaydedilince tetiklenir
exports.onVersionSaved = onDocumentCreated(
  'versions/{appId}/history/{versionId}',
  async (event) => {
    const appId = event.params.appId;
    const versionData = event.data.data();

    // Uygulama bilgisini al
    const appDoc = await getFirestore().collection('apps').doc(appId).get();
    if (!appDoc.exists) return;

    const app = appDoc.data();
    if (app.status !== 'published') return;

    const appName = app.name;
    const newVersion = versionData.versionName;

    // Tüm FCM token'larını topla
    const usersSnap = await getFirestore().collection('users').get();
    const tokens = usersSnap.docs
      .map(d => d.data().fcmToken)
      .filter(t => typeof t === 'string' && t.length > 0);

    if (tokens.length === 0) return;

    // 500'lü gruplara böl (FCM limiti)
    const chunks = [];
    for (let i = 0; i < tokens.length; i += 500) {
      chunks.push(tokens.slice(i, i + 500));
    }

    await Promise.all(
      chunks.map(chunk =>
        getMessaging().sendEachForMulticast({
          tokens: chunk,
          notification: {
            title: `${appName} güncellendi`,
            body: `Yeni sürüm v${newVersion} yayında!`,
          },
          android: {
            notification: {
              channelId: 'updates',
              priority: 'high',
            },
          },
          data: { appId },
        })
      )
    );
  }
);
