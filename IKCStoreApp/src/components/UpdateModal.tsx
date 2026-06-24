import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { UpdateInfo } from '../services/update';
import { downloadApk } from '../services/download';
import InstallApk from 'react-native-install-apk';

interface Props {
  update: UpdateInfo;
  onDismiss: () => void;
}

export default function UpdateModal({ update, onDismiss }: Props) {
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setDownloading(true);
    setError('');
    try {
      const path = await downloadApk(update.appId, update.apkUrl, setProgress);
      await InstallApk.install(path);
    } catch {
      setError('İndirme başarısız. Tekrar dene.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Yeni Sürüm Mevcut</Text>
          <Text style={styles.version}>{update.appName} — v{update.newVersion}</Text>
          {update.changelog ? <Text style={styles.changelog}>{update.changelog}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {downloading ? (
            <View style={styles.progressWrap}>
              <ActivityIndicator color="#4f46e5" />
              <Text style={styles.progressText}>İndiriliyor... {progress}%</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity onPress={onDismiss} style={styles.skipBtn}>
                <Text style={styles.skipText}>Sonra</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} style={styles.updateBtn}>
                <Text style={styles.updateText}>Güncelle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%', maxWidth: 320 },
  title: { fontWeight: '700', fontSize: 18, marginBottom: 4, color: '#111' },
  version: { color: '#4f46e5', fontWeight: '600', marginBottom: 8 },
  changelog: { color: '#6b7280', fontSize: 13, marginBottom: 16 },
  error: { color: '#ef4444', fontSize: 13, marginBottom: 8 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  progressText: { color: '#374151' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  skipBtn: { padding: 10 },
  skipText: { color: '#6b7280', fontWeight: '600' },
  updateBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  updateText: { color: '#fff', fontWeight: '700' },
});
