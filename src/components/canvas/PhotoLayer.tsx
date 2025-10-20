import React, { useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import type { PhotoLayer as PhotoLayerType } from '../../types/projects';

const MIN_DIMENSION = 60;
const HANDLE_SIZE = 20;

interface PhotoLayerProps {
  layer: PhotoLayerType;
  isSelected: boolean;
  onSelect: (layerId: string) => void;
  onTransformUpdate: (
    layerId: string,
    transform: PhotoLayerType['transform']
  ) => void;
  onResize: (
    layerId: string,
    size: { width: number; height: number; x: number; y: number },
    edge: 'left' | 'right' | 'top' | 'bottom'
  ) => void;
  onResizeUpdate?: (
    layerId: string,
    size: { width: number; height: number; x: number; y: number },
    edge: 'left' | 'right' | 'top' | 'bottom'
  ) => void;
  onDelete?: (layerId: string) => void;
  viewportScale?: number;
  isSwapSource?: boolean;
  isSwapModeActive?: boolean;
}

export const PhotoLayer: React.FC<PhotoLayerProps> = ({
  layer,
  isSelected,
  onSelect,
  onTransformUpdate,
  onResize,
  onResizeUpdate,
  onDelete: _onDelete,
  viewportScale = 1,
  isSwapSource = false,
  isSwapModeActive = false,
}) => {
  const translateX = useSharedValue(layer.transform.x);
  const translateY = useSharedValue(layer.transform.y);
  const scale = useSharedValue(layer.transform.scale);
  const rotation = useSharedValue(layer.transform.rotation);
  const savedScale = useSharedValue(layer.transform.scale);
  const savedRotation = useSharedValue(layer.transform.rotation);
  const startX = useSharedValue(layer.transform.x);
  const startY = useSharedValue(layer.transform.y);
  const viewport = useSharedValue(Math.max(viewportScale, 0.0001));
  const width = useSharedValue(layer.dimensions.width);
  const height = useSharedValue(layer.dimensions.height);
  const resizeStartWidth = useSharedValue(layer.dimensions.width);
  const resizeStartHeight = useSharedValue(layer.dimensions.height);
  const resizeStartX = useSharedValue(layer.transform.x);
  const resizeStartY = useSharedValue(layer.transform.y);

  useEffect(() => {
    translateX.value = withSpring(layer.transform.x, { damping: 50, stiffness: 300 });
    translateY.value = withSpring(layer.transform.y, { damping: 50, stiffness: 300 });
    scale.value = layer.transform.scale;
    rotation.value = layer.transform.rotation;
    startX.value = layer.transform.x;
    startY.value = layer.transform.y;
    width.value = withSpring(layer.dimensions.width, { damping: 50, stiffness: 300 });
    height.value = withSpring(layer.dimensions.height, { damping: 50, stiffness: 300 });
    resizeStartWidth.value = layer.dimensions.width;
    resizeStartHeight.value = layer.dimensions.height;
    resizeStartX.value = layer.transform.x;
    resizeStartY.value = layer.transform.y;
  }, [
    layer.transform.x,
    layer.transform.y,
    layer.transform.scale,
    layer.transform.rotation,
    layer.dimensions.width,
    layer.dimensions.height,
    translateX,
    translateY,
    scale,
    rotation,
    startX,
    startY,
    width,
    height,
    resizeStartWidth,
    resizeStartHeight,
    resizeStartX,
    resizeStartY,
  ]);

  useEffect(() => {
    viewport.value = Math.max(viewportScale, 0.0001);
  }, [viewportScale, viewport]);

  const notifyResize = useCallback(
    (size: { width: number; height: number; x: number; y: number }, edge: 'left' | 'right' | 'top' | 'bottom') => {
      onResize(layer.id, size, edge);
    },
    [layer.id, onResize]
  );

  const notifyResizeUpdate = useCallback(
    (size: { width: number; height: number; x: number; y: number }, edge: 'left' | 'right' | 'top' | 'bottom') => {
      if (onResizeUpdate) {
        onResizeUpdate(layer.id, size, edge);
      }
    },
    [layer.id, onResizeUpdate]
  );

  const leftHandleGesture = Gesture.Pan()
    .onStart(() => {
      resizeStartWidth.value = width.value;
      resizeStartX.value = translateX.value;
    })
    .onUpdate((event) => {
      const delta = event.translationX / viewport.value;
      const nextWidth = Math.max(MIN_DIMENSION, resizeStartWidth.value - delta);
      width.value = nextWidth;
      translateX.value = resizeStartX.value + (resizeStartWidth.value - nextWidth);

      runOnJS(notifyResizeUpdate)({
        width: width.value,
        height: height.value,
        x: translateX.value,
        y: translateY.value,
      }, 'left');
    })
    .onEnd(() => {
      runOnJS(notifyResize)({
        width: width.value,
        height: height.value,
        x: translateX.value,
        y: translateY.value,
      }, 'left');
    });

  const rightHandleGesture = Gesture.Pan()
    .onStart(() => {
      resizeStartWidth.value = width.value;
    })
    .onUpdate((event) => {
      const delta = event.translationX / viewport.value;
      width.value = Math.max(MIN_DIMENSION, resizeStartWidth.value + delta);

      runOnJS(notifyResizeUpdate)({
        width: width.value,
        height: height.value,
        x: translateX.value,
        y: translateY.value,
      }, 'right');
    })
    .onEnd(() => {
      runOnJS(notifyResize)({
        width: width.value,
        height: height.value,
        x: translateX.value,
        y: translateY.value,
      }, 'right');
    });

  const topHandleGesture = Gesture.Pan()
    .onStart(() => {
      resizeStartHeight.value = height.value;
      resizeStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      const delta = event.translationY / viewport.value;
      const nextHeight = Math.max(MIN_DIMENSION, resizeStartHeight.value - delta);
      height.value = nextHeight;
      translateY.value = resizeStartY.value + (resizeStartHeight.value - nextHeight);

      runOnJS(notifyResizeUpdate)({
        width: width.value,
        height: height.value,
        x: translateX.value,
        y: translateY.value,
      }, 'top');
    })
    .onEnd(() => {
      runOnJS(notifyResize)({
        width: width.value,
        height: height.value,
        x: translateX.value,
        y: translateY.value,
      }, 'top');
    });

  const bottomHandleGesture = Gesture.Pan()
    .onStart(() => {
      resizeStartHeight.value = height.value;
    })
    .onUpdate((event) => {
      const delta = event.translationY / viewport.value;
      height.value = Math.max(MIN_DIMENSION, resizeStartHeight.value + delta);

      runOnJS(notifyResizeUpdate)({
        width: width.value,
        height: height.value,
        x: translateX.value,
        y: translateY.value,
      }, 'bottom');
    })
    .onEnd(() => {
      runOnJS(notifyResize)({
        width: width.value,
        height: height.value,
        x: translateX.value,
        y: translateY.value,
      }, 'bottom');
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      runOnJS(onSelect)(layer.id);
    })
    .onUpdate((e) => {
      const divisor = viewport.value;
      translateX.value = startX.value + e.translationX / divisor;
      translateY.value = startY.value + e.translationY / divisor;
    })
    .onEnd(() => {
      runOnJS(onTransformUpdate)(layer.id, {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.2, Math.min(5.0, savedScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(onTransformUpdate)(layer.id, {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    });

  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      savedRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      runOnJS(onTransformUpdate)(layer.id, {
        x: translateX.value,
        y: translateY.value,
        scale: scale.value,
        rotation: rotation.value,
      });
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      runOnJS(onSelect)(layer.id);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      // Reset to original size/rotation
      scale.value = withSpring(1.0);
      rotation.value = withSpring(0);
      runOnJS(onTransformUpdate)(layer.id, {
        x: translateX.value,
        y: translateY.value,
        scale: 1.0,
        rotation: 0,
      });
    });

  tapGesture.requireExternalGestureToFail(doubleTapGesture);
  panGesture.requireExternalGestureToFail(leftHandleGesture);
  panGesture.requireExternalGestureToFail(rightHandleGesture);
  panGesture.requireExternalGestureToFail(topHandleGesture);
  panGesture.requireExternalGestureToFail(bottomHandleGesture);

  const composed = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTapGesture, tapGesture),
    panGesture,
    Gesture.Simultaneous(pinchGesture, rotationGesture)
  );

  const sizeStyle = useAnimatedStyle(() => ({
    width: width.value * viewport.value,
    height: height.value * viewport.value,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value * viewport.value },
      { translateY: translateY.value * viewport.value },
      { scale: scale.value },
      { rotateZ: `${rotation.value}rad` },
    ],
    opacity: layer.opacity,
    zIndex: layer.zIndex,
  }));

  const imageStyle = useAnimatedStyle(() => {
    if (!layer.crop) {
      return {
        width: '100%',
        height: '100%',
      };
    }

    const displayWidth = width.value * viewport.value;
    const displayHeight = height.value * viewport.value;
    const cropWidth = layer.crop.width;
    const cropHeight = layer.crop.height;

    return {
      width: displayWidth / cropWidth,
      height: displayHeight / cropHeight,
      left: -(layer.crop.x * displayWidth) / cropWidth,
      top: -(layer.crop.y * displayHeight) / cropHeight,
    };
  });

  const leftHandleStyle = useAnimatedStyle(() => ({
    left: -HANDLE_SIZE / 2,
    top: (height.value * viewport.value) / 2 - HANDLE_SIZE / 2,
  }));

  const rightHandleStyle = useAnimatedStyle(() => ({
    right: -HANDLE_SIZE / 2,
    top: (height.value * viewport.value) / 2 - HANDLE_SIZE / 2,
  }));

  const topHandleStyle = useAnimatedStyle(() => ({
    top: -HANDLE_SIZE / 2,
    left: (width.value * viewport.value) / 2 - HANDLE_SIZE / 2,
  }));

  const bottomHandleStyle = useAnimatedStyle(() => ({
    bottom: -HANDLE_SIZE / 2,
    left: (width.value * viewport.value) / 2 - HANDLE_SIZE / 2,
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          styles.photo,
          sizeStyle,
          styles.photoContent,
          animatedStyle,
          isSelected && styles.selected,
          isSwapSource && styles.swapSource,
          isSwapModeActive && !isSwapSource && styles.swapCandidate,
        ]}
      >
        <Animated.Image
          source={{ uri: layer.sourceUri }}
          style={[
            styles.image,
            imageStyle,
          ]}
          resizeMode="cover"
        />
        {isSelected && (
          <>
            <GestureDetector gesture={leftHandleGesture}>
              <Animated.View
                style={[
                  styles.handle,
                  styles.handleVertical,
                  leftHandleStyle,
                ]}
              />
            </GestureDetector>
            <GestureDetector gesture={rightHandleGesture}>
              <Animated.View
                style={[
                  styles.handle,
                  styles.handleVertical,
                  rightHandleStyle,
                ]}
              />
            </GestureDetector>
            <GestureDetector gesture={topHandleGesture}>
              <Animated.View
                style={[
                  styles.handle,
                  styles.handleHorizontal,
                  topHandleStyle,
                ]}
              />
            </GestureDetector>
            <GestureDetector gesture={bottomHandleGesture}>
              <Animated.View
                style={[
                  styles.handle,
                  styles.handleHorizontal,
                  bottomHandleStyle,
                ]}
              />
            </GestureDetector>
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  photo: {
    position: 'absolute',
  },
  photoContent: {
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#9B7FFF',
  },
  swapSource: {
    borderColor: '#FF8F4C',
  },
  swapCandidate: {
    borderWidth: 2,
    borderColor: '#9B7FFF55',
  },
  handle: {
    position: 'absolute',
    backgroundColor: '#9B7FFF',
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  handleVertical: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
  },
  handleHorizontal: {
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
  },
});
