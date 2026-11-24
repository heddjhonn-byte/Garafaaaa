import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

export default function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" color={colors.muted}>{label}</AppText>
      <AppText style={styles.value}>{value ?? '—'}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  value: { flexShrink: 1, fontWeight: '600', textAlign: 'right' },
});
