import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOutUp, FadeIn } from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeContext';
import { useSplashStore } from '../../state/useSplashStore';
import { PhysicsBreakdownSplash } from '../../animations/splash/PhysicsBreakdownSplash';
import { TwistingTextSplash } from '../../animations/splash/TwistingTextSplash';

export const SplashManager: React.FC = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const { hasCompleted, markCompleted } = useSplashStore();

  useEffect(() => {
    if (hasCompleted) {
      setIsVisible(false);
    } else {
      const timeout = setTimeout(() => {
        markCompleted();
        setIsVisible(false);
      }, 2500);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [hasCompleted, markCompleted]);

  if (!isVisible) {
    return null;
  }

  const splashVariant = hasCompleted
    ? 'twisting'
    : Math.random() > 0.5
    ? 'physics'
    : 'twisting';

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOutUp.duration(400)}
      style={[
        styles.overlay,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.fill}>
        {splashVariant === 'physics' ? (
          <PhysicsBreakdownSplash />
        ) : (
          <TwistingTextSplash />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  fill: {
    flex: 1,
  },
});
