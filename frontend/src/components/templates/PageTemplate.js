import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../organisms/AppHeader';
import AppText from '../atoms/AppText';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';

export default function PageTemplate({ title, subtitle, children, onRefresh, refreshing = false, scroll = true }) {
  const { user } = useAuth();
  const body = (
    <View style={styles.content}>
      {title ? <AppText variant="title" style={styles.title}>{title}</AppText> : null}
      {subtitle ? <AppText style={styles.subtitle}>{subtitle}</AppText> : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppHeader role={user?.rol} name={user?.nombre} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
        >
          {body}
        </ScrollView>
      ) : <View style={styles.flex}>{body}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.background, flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xl },
  title: { color: colors.navy },
  subtitle: { color: colors.muted, marginTop: -spacing.sm },
});
