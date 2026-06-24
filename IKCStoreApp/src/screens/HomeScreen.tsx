import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchPublishedApps, type AppData } from '../services/firebase';
import AppCard from '../components/AppCard';
import type { RootStackParamList } from '../navigation/types';

export default function HomeScreen() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const load = useCallback(async () => {
    const data = await fetchPublishedApps();
    setApps(data);
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
      ListEmptyComponent={<Text style={styles.empty}>Henüz uygulama yok.</Text>}
      renderItem={({ item }) => (
        <AppCard app={item} onPress={() => nav.navigate('AppDetail', { appId: item.id })} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  center: { flex: 1 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 48 },
});
