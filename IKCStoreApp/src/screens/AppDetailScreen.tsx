import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, StatusBar,
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { fetchApp, toggleFavorite, checkFavorite, type AppData } from '../services/firebase';
import { downloadApk } from '../services/download';
import InstallApk from 'react-native-install-apk';
import InstalledApps from 'react-native-installed-apps';
import CommentSection from '../components/CommentSection';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

export default function AppDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AppDetail'>>();
  const [app, setApp] = useState<AppData | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [installedVersionCode, setInstalledVersionCode] = useState<number | null>(null);

  useEffect(() => {
    fetchApp(route.params.appId).then(setApp);
    checkFavorite(route.params.appId).then(setFavorited);
  }, [route.params.appId]);

  useFocusEffect(
    useCallback(() => {
      if (!app) return;
      InstalledApps.getApps().then((list: any[]) => {
        const found = list.find((a: any) => a.packageName === app.packageName);
        setInstalledVersionCode(found ? found.versionCode : null);
      }).catch(() => {});
    }, [app])
  );

  if (!app) return (
    <View style={styles.loadWrap}>
      <StatusBar barStyle="light-content" backgroundColor="#07070F" />
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );

  const handleFavorite = async () => {
    const next = await toggleFavorite(app!.id);
    setFavorited(next);
  };

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
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#07070F" />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: app.iconUrl }} style={styles.heroIcon} />
          <Text style={styles.heroName}>{app.name}</Text>
          <Text style={styles.heroCategory}>{app.category}</Text>
          <View style={styles.pills}>
            <Pill label={`v${app.currentVersion}`} />
            {app.apkSize ? <Pill label={`${(app.apkSize / 1024 / 1024).toFixed(1)} MB`} /> : null}
            <Pill label={`${app.downloads} indirme`} />
            {(app.ratingCount ?? 0) > 0
              ? <Pill label={`★ ${((app.ratingSum ?? 0) / (app.ratingCount ?? 1)).toFixed(1)}`} />
              : null}
          </View>
          <TouchableOpacity style={styles.favBtn} onPress={handleFavorite} activeOpacity={0.7}>
            <Text style={[styles.favIcon, favorited && styles.favIconActive]}>
              {favorited ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        {(app.screenshots?.length ?? 0) > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.screenshots}>
            {app.screenshots.map((s, i) => (
              <Image key={i} source={{ uri: s }} style={styles.screenshot} />
            ))}
          </ScrollView>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hakkında</Text>
          <Text style={styles.sectionBody}>{app.description}</Text>
        </View>

        {app.changelog ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Son Güncellemeler</Text>
            <Text style={styles.sectionBody}>{app.changelog}</Text>
          </View>
        ) : null}

        <CommentSection appId={app.id} />

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.installBtn, downloading && styles.installBtnBusy]}
          onPress={handleInstall}
          disabled={downloading}
          activeOpacity={0.85}
        >
          <Text style={styles.installBtnText}>
            {downloading
              ? `İndiriliyor  %${progress}`
              : installedVersionCode !== null && app !== null && app.currentVersionCode > installedVersionCode
                ? 'Güncelle'
                : installedVersionCode !== null
                  ? 'Yeniden Kur'
                  : 'İndir ve Kur'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={pillStyles.wrap}>
      <Text style={pillStyles.text}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: {
    backgroundColor: '#1E1E3A',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  text: { color: '#9090B0', fontSize: 12, fontWeight: '600' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07070F' },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#07070F' },
  scroll: { flex: 1 },
  hero: { alignItems: 'center', paddingTop: 32, paddingBottom: 28, paddingHorizontal: 24 },
  heroIcon: { width: 96, height: 96, borderRadius: 22, backgroundColor: '#1E1E3A', marginBottom: 16 },
  heroName: { fontSize: 26, fontWeight: '800', color: '#F1F1FF', letterSpacing: -0.5, textAlign: 'center' },
  heroCategory: { fontSize: 14, color: '#9090B0', marginTop: 4, marginBottom: 16 },
  pills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  screenshots: { paddingLeft: 16, paddingBottom: 4 },
  screenshot: {
    width: width * 0.42,
    height: width * 0.75,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#10101E',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#10101E',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  sectionLabel: {
    fontWeight: '700',
    fontSize: 11,
    color: '#5A5A78',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sectionBody: { color: '#C4C4E0', lineHeight: 22, fontSize: 14 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: '#07070F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  error: { color: '#F87171', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  installBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    padding: 17,
    alignItems: 'center',
  },
  installBtnBusy: { opacity: 0.55 },
  installBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: -0.2 },
  favBtn: { marginTop: 12 },
  favIcon: { fontSize: 28, color: '#5A5A78' },
  favIconActive: { color: '#F87171' },
});
