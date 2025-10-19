import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

interface BottomControlBarProps {
  selectedLayerId: string | null;
  onAddPhotos: () => void;
  onTemplates: () => void;
  onBackgrounds: () => void;
  onLayers: () => void;
  onFilters?: () => void;
  onCrop?: () => void;
  onFlip?: () => void;
  onDelete?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BottomControlBar: React.FC<BottomControlBarProps> = ({
  selectedLayerId,
  onAddPhotos,
  onTemplates,
  onBackgrounds,
  onLayers,
  onFilters,
  onCrop,
  onFlip,
  onDelete,
}) => {
  const theme = useTheme();

  const defaultButtons = [
    { icon: '+', label: 'Add Photos', onPress: onAddPhotos },
    { icon: '⊞', label: 'Templates', onPress: onTemplates },
    { icon: '◐', label: 'Backgrounds', onPress: onBackgrounds },
    { icon: '⧉', label: 'Layers', onPress: onLayers },
  ];

  const editingButtons = [
    { icon: '✨', label: 'Filters', onPress: onFilters },
    { icon: '⊡', label: 'Crop', onPress: onCrop },
    { icon: '⇄', label: 'Flip', onPress: onFlip },
    { icon: '🗑', label: 'Delete', onPress: onDelete, destructive: true },
  ];

  const buttons = selectedLayerId ? editingButtons : defaultButtons;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${theme.colors.surface}CC`,
          borderRadius: theme.radius.pill,
          marginHorizontal: theme.spacing(4),
          marginBottom: theme.spacing(4),
        },
      ]}
    >
      {buttons.map((button, index) => (
        <ControlButton
          key={index}
          icon={button.icon}
          label={button.label}
          onPress={button.onPress}
          destructive={button.destructive}
        />
      ))}
    </View>
  );
};

interface ControlButtonProps {
  icon: string;
  label: string;
  onPress?: () => void;
  destructive?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  label,
  onPress,
  destructive,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[styles.button, animatedStyle]}
    >
      <Text
        style={[
          styles.icon,
          {
            color: destructive ? theme.colors.error : theme.colors.textPrimary,
          },
        ]}
      >
        {icon}
      </Text>
      <Text
        style={[
          styles.label,
          {
            color: destructive
              ? theme.colors.error
              : theme.colors.textSecondary,
            fontSize: 10,
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 68,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    minWidth: 60,
  },
  icon: {
    fontSize: 28,
    marginBottom: 4,
  },
  label: {
    textAlign: 'center',
  },
});
