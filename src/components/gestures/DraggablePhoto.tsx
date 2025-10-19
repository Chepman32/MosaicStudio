import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface DraggablePhotoProps {
  uri: string;
  size: number;
}

export const DraggablePhoto: React.FC<DraggablePhotoProps> = ({ uri, size }) => {
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translationX.value += event.changeX;
      translationY.value += event.changeY;
    })
    .onEnd(() => {
      translationX.value = withSpring(translationX.value, { damping: 15, stiffness: 150 });
      translationY.value = withSpring(translationY.value, { damping: 15, stiffness: 150 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        <Image source={{ uri }} style={[styles.image, { width: size, height: size }]} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 12,
  },
});
