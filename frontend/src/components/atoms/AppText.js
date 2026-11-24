import React from 'react';
import { Text } from 'react-native';
import { colors } from '../../theme';

export default function AppText({ children, variant = 'body', color, style, ...props }) {
  const variants = {
    title: { fontSize: 24, fontWeight: '700' },
    heading: { fontSize: 18, fontWeight: '700' },
    body: { fontSize: 15, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
    metric: { fontSize: 23, fontWeight: '700' },
  };
  return (
    <Text
      {...props}
      style={[{ color: color || colors.text, ...variants[variant] }, style]}
    >
      {children}
    </Text>
  );
}
