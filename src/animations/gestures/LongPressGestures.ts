import { Gesture } from 'react-native-gesture-handler';

export const createLongPressGesture = (
  onActive: () => void,
  duration = 500,
) =>
  Gesture.LongPress()
    .minDuration(duration)
    .onStart(onActive);
