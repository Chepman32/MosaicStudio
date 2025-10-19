import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import type { PhotoLayer as PhotoLayerType } from '../../types/projects';

interface PhotoLayerProps {
  layer: PhotoLayerType;
  isSelected: boolean;
  onSelect: (layerId: string) => void;
  onTransformUpdate: (
    layerId: string,
    transform: PhotoLayerType['transform']
  ) => void;
  onDelete?: (layerId: string) => void;
  viewportScale?: number;
}

export const PhotoLayer: React.FC<PhotoLayerProps> = ({
  layer,
  isSelected,
  onSelect,
  onTransformUpdate,
  onDelete: _onDelete,
  viewportScale = 1,
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

  useEffect(() => {
    translateX.value = layer.transform.x;
    translateY.value = layer.transform.y;
    scale.value = layer.transform.scale;
    rotation.value = layer.transform.rotation;
    startX.value = layer.transform.x;
    startY.value = layer.transform.y;
  }, [
    layer.transform.x,
    layer.transform.y,
    layer.transform.scale,
    layer.transform.rotation,
    translateX,
    translateY,
    scale,
    rotation,
    startX,
    startY,
  ]);

  useEffect(() => {
    viewport.value = Math.max(viewportScale, 0.0001);
  }, [viewportScale, viewport]);

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

  const composed = Gesture.Simultaneous(
    panGesture,
    Gesture.Simultaneous(pinchGesture, rotationGesture),
    doubleTapGesture
  );

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

  return (
    <GestureDetector gesture={composed}>
      <Animated.Image
        source={{ uri: layer.sourceUri }}
        style={[
          styles.photo,
          {
            width: layer.dimensions.width * viewportScale,
            height: layer.dimensions.height * viewportScale,
          },
          animatedStyle,
          isSelected && styles.selected,
        ]}
        resizeMode="cover"
      />
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  photo: {
    position: 'absolute',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#9B7FFF',
  },
});
