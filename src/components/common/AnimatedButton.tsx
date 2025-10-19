import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeContext';

interface AnimatedButtonProps {
  label: string;
  onPress?: () => void;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ label, onPress }) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[
          styles.button,
          {
            paddingVertical: theme.spacing(4),
            paddingHorizontal: theme.spacing(6),
            borderRadius: theme.radius.l,
            backgroundColor: theme.colors.accent,
          },
        ]}
      >
        <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
