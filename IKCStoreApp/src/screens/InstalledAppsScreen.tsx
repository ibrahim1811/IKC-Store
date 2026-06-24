import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InstalledApps from 'react-native-installed-apps';
import { fetchPublishedApps, type AppData } from '../services/firebase';
import AppCard from '../components/AppCard';
import type { RootStackParamList } from '../navigation/types';

interface InstalledAppEntry {
  packageName: string;
  versionCode: number;
}

export default function InstalledAppsScreen() {
  const [apps, setApps] = useState<(AppData & { needsUpdate: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const load = useCallback(async () => {
    const [storeApps, deviceApps] = await Promise.all([
      fetchPublishedApps(),
      InstalledApps.getApps() as Promise<InstalledAppEntry[]>,
    ]);

    const deviceMap = new Map(deviceApps.map(a => [a.packageName, a.versionCode]));

    const installed = storeApps
      .filter(a => deviceMap.has(a.packageName))
      .map(a => ({
        ...a,
        needsUpdate: a.currentVersionCode > (deviceMap.get(a.packageName) ?? 0),
      }));

    setApps(installed);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#4f46e5" />;

  return (
    <FlatList
      data={apps}
      keyExtractor={a => a.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      ListEmptyComponent={<Text style={styles.empty}>Yüklü IKC uygulaması bulunamadı.</Text>}
      renderItem={({ item }) => (
        <AppCard
          app={item}
          badge={item.needsUpdate ? 'Güncelle' : undefined}
          onPress={() => nav.navigate('AppDetail', { appId: item.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  center: { flex: 1 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 48 },
});
