import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { AppData } from '../services/firebase';

interface Props {
  app: AppData;
  onPress: () => void;
  badge?: string;
  hasUpdate?: boolean;
}

export default function AppCard({ app, onPress, badge, hasUpdate }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View>
        <Image source={{ uri: app.iconUrl }} style={styles.icon} />
        {hasUpdate && <View style={styles.updateDot} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{app.name}</Text>
        <Text style={styles.meta}>
          {app.category} · v{app.currentVersion}
          {(app.ratingCount ?? 0) > 0
            ? ` · ${'★'.repeat(Math.round((app.ratingSum ?? 0) / (app.ratingCount ?? 1)))} (${app.ratingCount})`
            : ''}
        </Text>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#10101E',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 13,
    backgroundColor: '#1E1E3A',
  },
  updateDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F87171',
    borderWidth: 2,
    borderColor: '#10101E',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
    color: '#F1F1FF',
    letterSpacing: -0.2,
  },
  meta: {
    color: '#9090B0',
    fontSize: 12,
    marginTop: 3,
  },
  badge: {
    backgroundColor: '#6366F1',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    color: '#5A5A78',
    fontSize: 24,
    marginLeft: 4,
    lineHeight: 28,
  },
});
