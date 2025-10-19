import { Directions, Gesture } from 'react-native-gesture-handler';

export const createSwipeToDeleteGesture = (onDelete: () => void) =>
  Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(onDelete);
