import React, { useMemo, useRef, useCallback } from 'react';
import { StyleSheet, Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Canvas, Path, Rect } from '@shopify/react-native-skia';
import type { PhotoLayer } from '../../types/projects';
import { createClipForMask, getMaskCentroid, getMaskStroke, isPointInsideMask } from '../../utils/maskUtils';

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
  const shouldHandlePress = useRef(false);

  const displayWidth = useMemo(
    () => layer.dimensions.width * viewportScale,
    [layer.dimensions.width, viewportScale],
  );
  const displayHeight = useMemo(
    () => layer.dimensions.height * viewportScale,
    [layer.dimensions.height, viewportScale],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: layer.transform.x * viewportScale },
      { translateY: layer.transform.y * viewportScale },
      { scale: scale.value },
    ],
    opacity: layer.opacity,
    zIndex: layer.zIndex,
  }));

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      if (!shouldHandlePress.current) {
        const { locationX, locationY } = event.nativeEvent;
        shouldHandlePress.current = isPointInsideMask(
          layer.mask,
          displayWidth,
          displayHeight,
          locationX,
          locationY,
        );
      }

      if (shouldHandlePress.current) {
        scale.value = withSpring(0.95);
      }
    },
    [displayHeight, displayWidth, layer.mask, scale],
  );

  const handlePressOut = useCallback(() => {
    if (!shouldHandlePress.current) {
      return;
    }
    scale.value = withSpring(1.0);
  }, [scale]);

  const handlePress = useCallback(() => {
    if (!shouldHandlePress.current) {
      return;
    }
    shouldHandlePress.current = false;
    onPress(layer.id);
  }, [layer.id, onPress]);

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

  const handleShouldSetResponder = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const inside = isPointInsideMask(
        layer.mask,
        displayWidth,
        displayHeight,
        locationX,
        locationY,
      );
      shouldHandlePress.current = inside;
      return inside;
    },
    [displayWidth, displayHeight, layer.mask],
  );

  return (
    <AnimatedPressable
      onStartShouldSetResponder={handleShouldSetResponder}
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
