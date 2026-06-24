import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { AppData } from '../services/firebase';

interface Props {
  app: AppData;
  onPress: () => void;
  badge?: string;
}

export default function AppCard({ app, onPress, badge }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: app.iconUrl }} style={styles.icon} />
      <View style={styles.info}>
        <Text style={styles.name}>{app.name}</Text>
        <Text style={styles.category}>{app.category}</Text>
        <Text style={styles.version}>v{app.currentVersion}</Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  icon: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#e5e7eb' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '700', fontSize: 15, color: '#111' },
  category: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  version: { color: '#9ca3af', fontSize: 11, marginTop: 2 },
  badge: { backgroundColor: '#ef4444', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
