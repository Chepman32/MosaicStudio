import { Gesture } from 'react-native-gesture-handler';

export const buildPinchRotateGesture = (
  onScale: (scale: number) => void,
  onRotation: (rotation: number) => void,
) =>
  Gesture.Simultaneous(
    Gesture.Pinch().onChange((event) => onScale(event.scale)),
    Gesture.Rotation().onChange((event) => onRotation(event.rotation)),
  );
