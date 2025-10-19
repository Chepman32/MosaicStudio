import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface ResizableFrameProps {
  initialSize: { width: number; height: number };
}

export const ResizableFrame: React.FC<ResizableFrameProps> = ({ initialSize }) => {
  const width = useSharedValue(initialSize.width);
  const height = useSharedValue(initialSize.height);

  const pinchGesture = Gesture.Pinch().onChange((event) => {
    width.value = initialSize.width * event.scale;
    height.value = initialSize.height * event.scale;
  });

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
  }));

  return (
    <GestureDetector gesture={pinchGesture}>
      <Animated.View style={[styles.frame, animatedStyle]}>
        <View style={styles.handle} />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
