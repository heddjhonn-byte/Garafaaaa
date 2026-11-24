import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../atoms/AppText';
import { colors, spacing } from '../../theme';

export default function AppHeader({ role, name }) {
  return (
    <View style={styles.header}>
      <View>
        <AppText variant="caption" color="#BFDBFE" style={styles.brand}>GARRAFAYA</AppText>
        <AppText color="#FFFFFF" style={styles.name}>{name || 'Bienvenido'}</AppText>
      </View>
      <View style={styles.role}>
        <AppText variant="caption" color="#FFFFFF">{role}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.navy,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  brand: { fontWeight: '700', letterSpacing: 1.2 },
  name: { fontSize: 17, fontWeight: '700', marginTop: 3 },
  role: { backgroundColor: '#1D4168', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
});
