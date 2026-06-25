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
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.label}>Güncelleme Mevcut</Text>
          <Text style={styles.appName}>{update.appName}</Text>
          <Text style={styles.version}>v{update.newVersion}</Text>

          {update.changelog ? (
            <View style={styles.changelogBox}>
              <Text style={styles.changelogTitle}>Yenilikler</Text>
              <Text style={styles.changelogText}>{update.changelog}</Text>
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {downloading ? (
            <View style={styles.progressRow}>
              <ActivityIndicator color="#6366F1" size="small" />
              <Text style={styles.progressText}>İndiriliyor... %{progress}</Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity onPress={onDismiss} style={styles.laterBtn} activeOpacity={0.7}>
                <Text style={styles.laterText}>Sonra</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdate} style={styles.updateBtn} activeOpacity={0.85}>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#10101E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F1F1FF',
    letterSpacing: -0.3,
  },
  version: {
    fontSize: 14,
    color: '#9090B0',
    marginTop: 2,
    marginBottom: 16,
  },
  changelogBox: {
    backgroundColor: '#1E1E3A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  changelogTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5A5A78',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  changelogText: { color: '#C4C4E0', fontSize: 13, lineHeight: 20 },
  error: { color: '#F87171', fontSize: 13, marginBottom: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  progressText: { color: '#9090B0', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  laterBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#1E1E3A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  laterText: { color: '#9090B0', fontWeight: '700', fontSize: 15 },
  updateBtn: {
    flex: 2,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  updateText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
