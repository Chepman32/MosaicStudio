import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface RotatableContainerProps {
  children: React.ReactNode;
}

export const RotatableContainer: React.FC<RotatableContainerProps> = ({ children }) => {
  const rotation = useSharedValue(0);

  const rotateGesture = Gesture.Rotation().onChange((event) => {
    rotation.value += event.rotationChange;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}rad` }],
  }));

  return (
    <GestureDetector gesture={rotateGesture}>
      <Animated.View style={animatedStyle}>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 12,
  },
});
