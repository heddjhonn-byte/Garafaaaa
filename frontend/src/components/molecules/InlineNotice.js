import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../atoms/AppText';

export default function InlineNotice({ message, type = 'error' }) {
  if (!message) return null;
  const color = type === 'success' ? '#166534' : '#991B1B';
  const backgroundColor = type === 'success' ? '#DCFCE7' : '#FEE2E2';
  return (
    <View style={[styles.notice, { backgroundColor }]}>
      <AppText variant="caption" color={color}>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { borderRadius: 10, marginBottom: 12, padding: 12 },
});
