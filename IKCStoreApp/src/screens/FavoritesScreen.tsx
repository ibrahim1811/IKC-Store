import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchFavorites, type AppData } from '../services/firebase';
import AppCard from '../components/AppCard';
import type { RootStackParamList } from '../navigation/types';

export default function FavoritesScreen() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const load = useCallback(async () => {
    const data = await fetchFavorites();
    setApps(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

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
          apps.length > 0
            ? <Text style={styles.sectionLabel}>{apps.length} favori</Text>
            : null
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyText}>Henüz favori yok.</Text>
            <Text style={styles.emptySubText}>Uygulama sayfasında ♡ ikonuna dokun.</Text>
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
  emptyIcon: { fontSize: 48, marginBottom: 12, color: '#5A5A78' },
  emptyText: { color: '#5A5A78', fontSize: 15 },
  emptySubText: { color: '#3A3A5C', fontSize: 12, marginTop: 6 },
});
