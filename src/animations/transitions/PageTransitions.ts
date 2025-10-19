import { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

export const pageTransition = {
  entering: FadeInRight.duration(300),
  exiting: FadeOutLeft.duration(300),
};
