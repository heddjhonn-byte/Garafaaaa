import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import AppText from '../atoms/AppText';
import { colors } from '../../theme';

export default function LoadingState({ label = 'Cargando...' }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'center', padding: 24 }}>
      <ActivityIndicator color={colors.primary} />
      <AppText>{label}</AppText>
    </View>
  );
}
