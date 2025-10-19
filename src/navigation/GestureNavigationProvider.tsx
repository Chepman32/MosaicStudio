import React, { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';

import {
  NavigationContext,
  NavigationContextValue,
} from './NavigationContext';

const INITIAL_ROUTE = { route: 'home' } as const;

export const GestureNavigationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [stack, setStack] = useState([INITIAL_ROUTE]);
  const { width } = useWindowDimensions();

  const navigate = useCallback((params: NavigationContextValue['activeRoute']) => {
    setStack((prev) => [...prev, params]);
  }, []);

  const goBack = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const reset = useCallback((params: NavigationContextValue['activeRoute']) => {
    setStack([params]);
  }, []);

  const activeRoute = stack[stack.length - 1];

  const contextValue = useMemo<NavigationContextValue>(
    () => ({ state: { stack }, activeRoute, navigate, goBack, reset }),
    [activeRoute, goBack, navigate, reset, stack],
  );

  const edgeGesture = useMemo(() => {
    const EDGE_THRESHOLD = Math.min(48, width * 0.1);
    return Gesture.Pan()
      .onStart((event) => {
        const isLeftEdge = event.absoluteX < EDGE_THRESHOLD;
        const isRightEdge = event.absoluteX > width - EDGE_THRESHOLD;
        if (isLeftEdge) {
          runOnJS(navigate)({ route: 'library' });
        } else if (isRightEdge) {
          runOnJS(navigate)({ route: 'settings' });
        }
      })
      .maxPointers(1)
      .activeOffsetX([-10, 10]);
  }, [navigate, width]);

  return (
    <NavigationContext.Provider value={contextValue}>
      <GestureDetector gesture={edgeGesture}>
        <Animated.View style={styles.full}>{children}</Animated.View>
      </GestureDetector>
    </NavigationContext.Provider>
  );
};

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
});
