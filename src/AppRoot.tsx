import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './theme/ThemeProvider';
import { GestureNavigationProvider } from './navigation/GestureNavigationProvider';
import { SplashManager } from './screens/Splash/SplashManager';
import { AppShell } from './screens/AppShell';
import { PurchaseProvider } from './state/PurchaseProvider';
import { ProjectPersistenceProvider } from './state/ProjectPersistenceProvider';
import { SkiaProvider } from './lib/SkiaProvider';

export const AppRoot: React.FC = () => {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={styles.full}>
      <SkiaProvider>
        <PurchaseProvider>
          <ProjectPersistenceProvider>
            <ThemeProvider colorScheme={colorScheme}>
              <GestureNavigationProvider>
                <View style={styles.full}>
                  <SplashManager />
                  <AppShell />
                </View>
              </GestureNavigationProvider>
            </ThemeProvider>
          </ProjectPersistenceProvider>
        </PurchaseProvider>
      </SkiaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  full: {
    flex: 1,
  },
});
