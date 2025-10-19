import React from 'react';
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
}

export const PhotoLayer: React.FC<PhotoLayerProps> = ({
  layer,
  isSelected,
  onSelect,
  onTransformUpdate,
  onDelete,
}) => {
  const translateX = useSharedValue(layer.transform.x);
  const translateY = useSharedValue(layer.transform.y);
  const scale = useSharedValue(layer.transform.scale);
  const rotation = useSharedValue(layer.transform.rotation);
  const savedScale = useSharedValue(layer.transform.scale);
  const savedRotation = useSharedValue(layer.transform.rotation);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(onSelect)(layer.id);
    })
    .onUpdate((e) => {
      translateX.value = layer.transform.x + e.translationX;
      translateY.value = layer.transform.y + e.translationY;
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
      { translateX: translateX.value },
      { translateY: translateY.value },
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
            width: layer.dimensions.width,
            height: layer.dimensions.height,
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
