import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from './AppText';

const tones = {
  success: { backgroundColor: '#DCFCE7', color: '#166534' },
  warning: { backgroundColor: '#FEF3C7', color: '#92400E' },
  danger: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  neutral: { backgroundColor: '#E2E8F0', color: '#334155' },
};

export default function StatusBadge({ label, tone = 'neutral' }) {
  const style = tones[tone] || tones.neutral;
  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <AppText variant="caption" color={style.color} style={styles.text}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  text: { fontWeight: '700' },
});
