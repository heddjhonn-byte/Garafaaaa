import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../atoms/AppText';
import { colors, spacing } from '../../theme';

export default function AuthTemplate({ title, subtitle, children }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brandMark}><AppText variant="heading" color="#FFFFFF">GY</AppText></View>
        <AppText variant="title" style={styles.title}>GarrafaYa</AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
        <View style={styles.form}>
          <AppText variant="heading" style={styles.formTitle}>{title}</AppText>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  brandMark: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.primary, borderRadius: 18, height: 56, justifyContent: 'center', width: 56 },
  title: { color: colors.navy, marginTop: spacing.md, textAlign: 'center' },
  subtitle: { color: colors.muted, marginTop: spacing.xs, textAlign: 'center' },
  form: { backgroundColor: '#FFFFFF', borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginTop: spacing.xl, padding: spacing.md },
  formTitle: { marginBottom: spacing.md },
});
