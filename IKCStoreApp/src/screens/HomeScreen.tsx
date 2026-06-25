import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, FlatList, Text, TextInput,
  StyleSheet, RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchPublishedApps, type AppData } from '../services/firebase';
import AppCard from '../components/AppCard';
import type { RootStackParamList } from '../navigation/types';

export default function HomeScreen() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const load = useCallback(async () => {
    const data = await fetchPublishedApps();
    setApps(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return apps;
    const q = search.toLowerCase();
    return apps.filter(a => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q));
  }, [apps, search]);

  if (loading) return (
    <View style={styles.loadWrap}>
      <StatusBar barStyle="light-content" backgroundColor="#07070F" />
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#07070F" />

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Uygulama ara..."
          placeholderTextColor="#5A5A78"
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filtered}
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
          filtered.length > 0
            ? <Text style={styles.sectionLabel}>{filtered.length} uygulama</Text>
            : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>
              {apps.length === 0 ? 'Henüz uygulama yok.' : 'Sonuç bulunamadı.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AppCard app={item} onPress={() => nav.navigate('AppDetail', { appId: item.id })} />
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07070F' },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07070F' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchInput: {
    backgroundColor: '#10101E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#F1F1FF',
  },
  list: { padding: 16, paddingTop: 4 },
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
