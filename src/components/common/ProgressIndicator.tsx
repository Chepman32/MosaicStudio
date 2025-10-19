import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';

export const ProgressIndicator: React.FC = () => {
  const theme = useTheme();
  return (
    <View style={{ padding: theme.spacing(4) }}>
      <ActivityIndicator color={theme.colors.accent} />
    </View>
  );
};
