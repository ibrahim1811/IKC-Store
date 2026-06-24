import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { fetchApp, type AppData } from '../services/firebase';
import { downloadApk } from '../services/download';
import InstallApk from 'react-native-install-apk';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

export default function AppDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AppDetail'>>();
  const [app, setApp] = useState<AppData | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApp(route.params.appId).then(setApp);
  }, [route.params.appId]);

  if (!app) return <ActivityIndicator style={styles.center} size="large" color="#4f46e5" />;

  const handleInstall = async () => {
    setDownloading(true);
    setError('');
    setProgress(0);
    try {
      const path = await downloadApk(app.id, app.apkUrl, setProgress);
      await InstallApk.install(path);
    } catch {
      setError('İndirme başarısız oldu. Tekrar dene.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: app.iconUrl }} style={styles.icon} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{app.name}</Text>
          <Text style={styles.category}>{app.category}</Text>
          <Text style={styles.version}>v{app.currentVersion} · {(app.apkSize / 1024 / 1024).toFixed(1)} MB</Text>
        </View>
      </View>

      {app.screenshots.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.screenshots}>
          {app.screenshots.map((s, i) => (
            <Image key={i} source={{ uri: s }} style={styles.screenshot} />
          ))}
        </ScrollView>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkında</Text>
        <Text style={styles.description}>{app.description}</Text>
      </View>

      {app.changelog ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Güncellemeler</Text>
          <Text style={styles.description}>{app.changelog}</Text>
        </View>
      ) : null}

      <View style={styles.stats}>
        <Text style={styles.stat}>{app.downloads} indirme</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.installBtn, downloading && styles.installBtnDisabled]}
        onPress={handleInstall}
        disabled={downloading}
      >
        <Text style={styles.installBtnText}>
          {downloading ? `İndiriliyor... ${progress}%` : 'İndir ve Kur'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1 },
  header: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  icon: { width: 80, height: 80, borderRadius: 18, backgroundColor: '#e5e7eb' },
  headerInfo: { flex: 1, marginLeft: 16 },
  name: { fontWeight: '700', fontSize: 20, color: '#111' },
  category: { color: '#6b7280', marginTop: 4 },
  version: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  screenshots: { paddingVertical: 16, paddingLeft: 16, backgroundColor: '#fff', marginTop: 1 },
  screenshot: { width: width * 0.45, height: width * 0.8, borderRadius: 8, marginRight: 8 },
  section: { backgroundColor: '#fff', padding: 16, marginTop: 8 },
  sectionTitle: { fontWeight: '700', fontSize: 14, color: '#374151', marginBottom: 8 },
  description: { color: '#4b5563', lineHeight: 20 },
  stats: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', marginTop: 8 },
  stat: { color: '#6b7280', fontSize: 13 },
  error: { color: '#ef4444', textAlign: 'center', margin: 16 },
  installBtn: { margin: 16, backgroundColor: '#4f46e5', borderRadius: 12, padding: 16, alignItems: 'center' },
  installBtnDisabled: { opacity: 0.6 },
  installBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  bottomPad: { height: 32 },
});
