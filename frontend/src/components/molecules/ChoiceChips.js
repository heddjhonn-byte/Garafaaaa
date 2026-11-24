import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AppText from '../atoms/AppText';
import { colors, spacing } from '../../theme';

export default function ChoiceChips({ options, value, onChange, label }) {
  return (
    <View style={styles.wrapper}>
      {label ? <AppText variant="caption" style={styles.label}>{label}</AppText> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              style={[styles.chip, selected && styles.selected]}
            >
              <AppText variant="caption" color={selected ? '#FFFFFF' : colors.text} style={styles.chipText}>{option.label}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7, marginBottom: spacing.md },
  label: { color: colors.muted, fontWeight: '700' },
  row: { gap: 8 },
  chip: { backgroundColor: '#FFFFFF', borderColor: colors.border, borderRadius: 20, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: '700' },
});
