import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { checkForUpdate, IKC_STORE_APP_ID } from './src/services/update';
import type { UpdateInfo } from './src/services/update';
import UpdateModal from './src/components/UpdateModal';

export default function App() {
  const [pendingUpdate, setPendingUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    checkForUpdate(IKC_STORE_APP_ID).then(info => {
      if (info?.hasUpdate) setPendingUpdate(info);
    });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <AppNavigator />
      {pendingUpdate && (
        <UpdateModal update={pendingUpdate} onDismiss={() => setPendingUpdate(null)} />
      )}
    </SafeAreaProvider>
  );
}
