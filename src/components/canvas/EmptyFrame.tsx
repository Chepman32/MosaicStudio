import React, { useMemo } from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Canvas, Path, Rect } from '@shopify/react-native-skia';
import type { PhotoLayer } from '../../types/projects';
import { createClipForMask, getMaskCentroid, getMaskStroke } from '../../utils/maskUtils';

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

  const displayWidth = layer.dimensions.width * viewportScale;
  const displayHeight = layer.dimensions.height * viewportScale;

  const clipPath = useMemo(
    () => createClipForMask(layer.mask, displayWidth, displayHeight),
    [layer.mask, displayWidth, displayHeight],
  );

  const stroke = useMemo(() => {
    if (!clipPath) {
      return null;
    }
    const scaleX =
      layer.dimensions.width === 0 ? 1 : displayWidth / layer.dimensions.width;
    const scaleY =
      layer.dimensions.height === 0 ? 1 : displayHeight / layer.dimensions.height;
    const scale = Math.min(scaleX, scaleY);
    return getMaskStroke(layer.mask, scale);
  }, [clipPath, displayHeight, displayWidth, layer.dimensions.height, layer.dimensions.width, layer.mask]);

  const centroid = useMemo(() => {
    const center = getMaskCentroid(layer.mask, displayWidth, displayHeight);
    if (center) {
      return center;
    }
    return {
      x: displayWidth / 2,
      y: displayHeight / 2,
    };
  }, [displayHeight, displayWidth, layer.mask]);

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
      <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
        {clipPath ? (
          <>
            <Path
              path={clipPath}
              color="rgba(200, 200, 200, 0.25)"
            />
            <Path
              path={clipPath}
              color="rgba(155, 127, 255, 0.5)"
              style="stroke"
              strokeWidth={stroke?.width ?? 2}
              strokeJoin={stroke?.join}
              strokeCap={stroke?.cap}
            />
          </>
        ) : (
          <>
            <Rect
              x={0}
              y={0}
              width={displayWidth}
              height={displayHeight}
              color="rgba(200, 200, 200, 0.25)"
            />
            <Rect
              x={0}
              y={0}
              width={displayWidth}
              height={displayHeight}
              color="rgba(155, 127, 255, 0.5)"
              style="stroke"
              strokeWidth={2}
            />
          </>
        )}
      </Canvas>
      <View
        pointerEvents="none"
        style={[
          styles.iconWrapper,
          {
            left: centroid.x,
            top: centroid.y,
          },
        ]}
      >
        <Text style={styles.icon}>+</Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
    color: 'rgba(155, 127, 255, 0.8)',
    fontWeight: '300',
  },
  iconWrapper: {
    position: 'absolute',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
});
