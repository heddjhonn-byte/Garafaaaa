import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../atoms/AppText';
import SurfaceCard from '../atoms/SurfaceCard';
import { colors, spacing } from '../../theme';

export default function MetricCard({ label, value, detail }) {
  return (
    <SurfaceCard style={styles.card}>
      <AppText variant="caption" color={colors.muted}>{label}</AppText>
      <AppText variant="metric" color={colors.navy} style={styles.value}>{value ?? '—'}</AppText>
      {detail ? <AppText variant="caption" color={colors.muted}>{detail}</AppText> : <View />}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: spacing.xs, minWidth: '46%' },
  value: { marginVertical: 3 },
});
