import React from 'react';
import { StyleSheet, View, Text, Pressable, TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeContext';

interface TopToolbarProps {
  projectName: string;
  onBack: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport: () => void;
  onMore?: () => void;
  onRename?: (name: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TopToolbar: React.FC<TopToolbarProps> = ({
  projectName,
  onBack,
  onUndo,
  onRedo,
  onExport,
  onMore,
  onRename,
  canUndo = false,
  canRedo = false,
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(projectName);

  const handleNameSubmit = () => {
    if (onRename && editedName.trim()) {
      onRename(editedName.trim());
    }
    setIsEditing(false);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${theme.colors.surface}CC`,
          paddingTop: theme.spacing(12),
          paddingBottom: theme.spacing(4),
          paddingHorizontal: theme.spacing(4),
        },
      ]}
    >
      <View style={styles.leftSection}>
        <ToolbarButton icon="←" onPress={onBack} />
        <ToolbarButton
          icon="↶"
          onPress={onUndo}
          disabled={!canUndo}
        />
        <ToolbarButton
          icon="↷"
          onPress={onRedo}
          disabled={!canRedo}
        />
      </View>

      <View style={styles.centerSection}>
        {isEditing ? (
          <TextInput
            value={editedName}
            onChangeText={setEditedName}
            onBlur={handleNameSubmit}
            onSubmitEditing={handleNameSubmit}
            autoFocus
            style={[
              styles.nameInput,
              {
                color: theme.colors.textPrimary,
                fontSize: 18,
              },
            ]}
          />
        ) : (
          <Pressable onPress={() => setIsEditing(true)}>
            <Text
              style={[
                styles.projectName,
                {
                  color: theme.colors.textPrimary,
                  fontSize: 18,
                },
              ]}
              numberOfLines={1}
            >
              {projectName}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.rightSection}>
        <ToolbarButton icon="↗" onPress={onExport} />
        <ToolbarButton icon="⋮" onPress={onMore} />
      </View>
    </View>
  );
};

interface ToolbarButtonProps {
  icon: string;
  onPress?: () => void;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  onPress,
  disabled,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0);
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.button,
        animatedStyle,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonIcon,
          {
            color: disabled
              ? theme.colors.textTertiary
              : theme.colors.textPrimary,
          },
        ]}
      >
        {icon}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 88,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonIcon: {
    fontSize: 24,
  },
  projectName: {
    fontWeight: '600',
  },
  nameInput: {
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 200,
    paddingHorizontal: 8,
  },
});
