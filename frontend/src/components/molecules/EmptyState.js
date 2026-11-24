import React from 'react';
import { View } from 'react-native';
import AppText from '../atoms/AppText';

export default function EmptyState({ title = 'Sin resultados', description = 'No hay información para mostrar.' }) {
  return (
    <View style={{ alignItems: 'center', padding: 24 }}>
      <AppText variant="heading">{title}</AppText>
      <AppText style={{ marginTop: 6, textAlign: 'center' }}>{description}</AppText>
    </View>
  );
}
