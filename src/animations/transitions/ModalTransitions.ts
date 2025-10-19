import { FadeIn, FadeOut } from 'react-native-reanimated';

export const modalTransition = {
  entering: FadeIn.duration(250),
  exiting: FadeOut.duration(250),
};
