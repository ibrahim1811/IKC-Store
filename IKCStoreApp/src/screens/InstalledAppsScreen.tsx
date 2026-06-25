import React, { useCallback, useEffect, useRef, useState } from 'react';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, RefreshControl, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/types';
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
  const tabNav = useNavigation<BottomTabNavigationProp<TabParamList>>();

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

  const updateCount = apps.filter(a => a.needsUpdate).length;
  const notifiedRef = useRef(false);

  useEffect(() => {
    tabNav.setOptions({ tabBarBadge: updateCount > 0 ? updateCount : undefined });
  }, [updateCount, tabNav]);

  useEffect(() => {
    if (updateCount === 0 || notifiedRef.current) return;
    notifiedRef.current = true;
    (async () => {
      await notifee.createChannel({ id: 'updates', name: 'Güncellemeler', importance: AndroidImportance.HIGH });
      await notifee.displayNotification({
        title: 'Güncellemeler mevcut',
        body: `${updateCount} uygulamanın yeni sürümü var.`,
        android: { channelId: 'updates', smallIcon: 'ic_launcher' },
      });
    })().catch(() => {});
  }, [updateCount]);

  if (loading) return (
    <View style={styles.loadWrap}>
      <StatusBar barStyle="light-content" backgroundColor="#07070F" />
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07070F" />
      <FlatList
        data={apps}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor="#6366F1"
            colors={['#6366F1']}
          />
        }
        ListHeaderComponent={
          apps.length > 0 ? (
            <Text style={styles.sectionLabel}>
              {updateCount > 0 ? `${updateCount} güncelleme mevcut` : `${apps.length} uygulama yüklü`}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyText}>Yüklü IKC uygulaması bulunamadı.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppCard
            app={item}
            hasUpdate={item.needsUpdate}
            badge={item.needsUpdate ? 'Güncelle' : undefined}
            onPress={() => nav.navigate('AppDetail', { appId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07070F' },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07070F' },
  list: { padding: 16, paddingTop: 8 },
  sectionLabel: {
    color: '#5A5A78',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 2,
  },
  emptyWrap: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#5A5A78', fontSize: 15 },
});
