import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { PhotoLayer } from '../../types/projects';

interface EmptyFrameProps {
  layer: PhotoLayer;
  viewportScale: number;
  onPress: (layerId: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const EmptyFrame: React.FC<EmptyFrameProps> = ({
  layer,
  viewportScale,
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: layer.transform.x * viewportScale },
      { translateY: layer.transform.y * viewportScale },
      { scale: scale.value },
    ],
    opacity: layer.opacity,
    zIndex: layer.zIndex,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0);
  };

  const handlePress = () => {
    onPress(layer.id);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.frame,
        {
          width: layer.dimensions.width * viewportScale,
          height: layer.dimensions.height * viewportScale,
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.icon}>+</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(155, 127, 255, 0.5)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  icon: {
    fontSize: 48,
    color: 'rgba(155, 127, 255, 0.8)',
    fontWeight: '300',
  },
});
