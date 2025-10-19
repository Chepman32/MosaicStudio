import React from 'react';
import { Text } from 'react-native';

interface GestureIconProps {
  name: string;
}

export const GestureIcon: React.FC<GestureIconProps> = ({ name }) => {
  return <Text accessibilityRole="image">{name}</Text>;
};
