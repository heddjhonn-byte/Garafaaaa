import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { colors, spacing } from '../../theme';

export default function PrimaryButton({ title, onPress, loading = false, disabled = false, secondary = false, style }) {
  const unavailable = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={unavailable}
      onPress={onPress}
      style={[
        styles.button,
        secondary && styles.secondary,
        unavailable && styles.disabled,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={secondary ? colors.primary : '#FFFFFF'} />
        : <AppText color={secondary ? colors.primary : '#FFFFFF'} style={styles.label}>{title}</AppText>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondary: { backgroundColor: colors.paleBlue },
  disabled: { opacity: 0.55 },
  label: { fontWeight: '700' },
});
