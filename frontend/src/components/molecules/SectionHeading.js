import React from 'react';
import { View } from 'react-native';
import AppText from '../atoms/AppText';
import { spacing } from '../../theme';

export default function SectionHeading({ title, subtitle, action }) {
  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
      <View style={{ flex: 1 }}>
        <AppText variant="heading">{title}</AppText>
        {subtitle ? <AppText variant="caption" style={{ marginTop: 4 }}>{subtitle}</AppText> : null}
      </View>
      {action}
    </View>
  );
}
