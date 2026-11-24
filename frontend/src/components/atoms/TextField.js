import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import AppText from './AppText';
import { colors, spacing } from '../../theme';

export default function TextField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, multiline, autoCapitalize = 'none', right }) {
  return (
    <View style={styles.wrapper}>
      {label ? <AppText variant="caption" style={styles.label}>{label}</AppText> : null}
      <View style={[styles.inputWrap, multiline && styles.multilineWrap]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          style={[styles.input, multiline && styles.multiline]}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6, marginBottom: spacing.md },
  label: { color: colors.muted, fontWeight: '700' },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  input: { color: colors.text, flex: 1, fontSize: 15, paddingVertical: 11 },
  multilineWrap: { minHeight: 100, alignItems: 'stretch' },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
});
