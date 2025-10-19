import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../theme/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.7;

type BackgroundTab = 'colors' | 'gradients' | 'textures';

const PRESET_COLORS = [
  '#F5F5F7', // Light gray
  '#FFFFFF', // White
  '#000000', // Black
  '#FF6B9D', // Coral
  '#9B7FFF', // Purple
  '#FFD700', // Gold
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FF5722', // Red-Orange
  '#E91E63', // Pink
  '#9C27B0', // Deep Purple
  '#00BCD4', // Cyan
  '#CDDC39', // Lime
  '#FF9800', // Orange
  '#795548', // Brown
  '#607D8B', // Blue Gray
  '#FFC107', // Amber
  '#8BC34A', // Light Green
  '#3F51B5', // Indigo
  '#673AB7', // Deep Purple
];

const PRESET_GRADIENTS = [
  { id: 'purple-pink', name: 'Twilight', colors: ['#6B4FE0', '#9B7FFF', '#FF6B9D'] },
  { id: 'blue-green', name: 'Ocean', colors: ['#2196F3', '#00BCD4'] },
  { id: 'orange-red', name: 'Sunset', colors: ['#FF9800', '#FF5722'] },
  { id: 'pink-purple', name: 'Rose', colors: ['#E91E63', '#9C27B0'] },
  { id: 'green-blue', name: 'Forest', colors: ['#4CAF50', '#2196F3'] },
  { id: 'gold-orange', name: 'Golden Hour', colors: ['#FFD700', '#FF9800'] },
];

interface BackgroundPanelProps {
  isVisible: boolean;
  onClose: () => void;
  currentBackground: string;
  onBackgroundChange: (background: string) => void;
}

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
  isVisible,
  onClose,
  currentBackground,
  onBackgroundChange,
}) => {
  const theme = useTheme();
  const translateY = useSharedValue(PANEL_HEIGHT);
  const [activeTab, setActiveTab] = useState<BackgroundTab>('colors');

  React.useEffect(() => {
    translateY.value = isVisible ? withSpring(0) : withTiming(PANEL_HEIGHT);
  }, [isVisible, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        onClose();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleColorSelect = (color: string) => {
    onBackgroundChange(color);
  };

  const handleGradientSelect = (gradient: typeof PRESET_GRADIENTS[0]) => {
    // For now, just use the first color of the gradient
    // In a full implementation, this would store gradient data
    onBackgroundChange(gradient.colors[0]);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.panel,
              {
                backgroundColor: theme.colors.surface,
                height: PANEL_HEIGHT,
              },
              animatedStyle,
            ]}
          >
            <View
              style={[
                styles.handle,
                { backgroundColor: theme.colors.textTertiary },
              ]}
            />

            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textPrimary,
                  paddingHorizontal: theme.spacing(4),
                  marginBottom: theme.spacing(3),
                },
              ]}
            >
              Background
            </Text>

            {/* Tabs */}
            <View style={[styles.tabs, { paddingHorizontal: theme.spacing(4) }]}>
              <TabButton
                label="Colors"
                isActive={activeTab === 'colors'}
                onPress={() => setActiveTab('colors')}
              />
              <TabButton
                label="Gradients"
                isActive={activeTab === 'gradients'}
                onPress={() => setActiveTab('gradients')}
              />
              <TabButton
                label="Textures"
                isActive={activeTab === 'textures'}
                onPress={() => setActiveTab('textures')}
              />
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={[
                styles.contentContainer,
                { paddingHorizontal: theme.spacing(4) },
              ]}
            >
              {activeTab === 'colors' && (
                <View style={styles.colorGrid}>
                  {PRESET_COLORS.map((color) => (
                    <ColorSwatch
                      key={color}
                      color={color}
                      isSelected={currentBackground === color}
                      onSelect={() => handleColorSelect(color)}
                    />
                  ))}
                </View>
              )}

              {activeTab === 'gradients' && (
                <View style={styles.gradientList}>
                  {PRESET_GRADIENTS.map((gradient) => (
                    <GradientPreview
                      key={gradient.id}
                      gradient={gradient}
                      isSelected={false}
                      onSelect={() => handleGradientSelect(gradient)}
                    />
                  ))}
                </View>
              )}

              {activeTab === 'textures' && (
                <View style={styles.textureGrid}>
                  <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
                    Textures coming soon
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        {
          backgroundColor: isActive ? theme.colors.primary : 'transparent',
          borderRadius: theme.radius.pill,
        },
      ]}
    >
      <Text
        style={[
          styles.tabText,
          {
            color: isActive ? '#FFF' : theme.colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

interface ColorSwatchProps {
  color: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, isSelected, onSelect }) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1.0);
    });
    onSelect();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.colorSwatch,
          {
            backgroundColor: color,
            borderColor: isSelected ? theme.colors.primary : theme.colors.textTertiary,
            borderWidth: isSelected ? 3 : 1,
          },
          animatedStyle,
        ]}
      >
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

interface GradientPreviewProps {
  gradient: typeof PRESET_GRADIENTS[0];
  isSelected: boolean;
  onSelect: () => void;
}

const GradientPreview: React.FC<GradientPreviewProps> = ({
  gradient,
  isSelected,
  onSelect,
}) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onSelect}
      style={[
        styles.gradientPreview,
        {
          borderColor: isSelected ? theme.colors.primary : 'transparent',
          borderRadius: theme.radius.m,
        },
      ]}
    >
      <View
        style={[
          styles.gradientColors,
          { borderRadius: theme.radius.m },
        ]}
      >
        {gradient.colors.map((color, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              backgroundColor: color,
              ...(index === 0 && { borderTopLeftRadius: theme.radius.m, borderBottomLeftRadius: theme.radius.m }),
              ...(index === gradient.colors.length - 1 && { borderTopRightRadius: theme.radius.m, borderBottomRightRadius: theme.radius.m }),
            }}
          />
        ))}
      </View>
      <Text
        style={[
          styles.gradientName,
          { color: theme.colors.textPrimary, marginTop: theme.spacing(2) },
        ]}
      >
        {gradient.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 24,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gradientList: {
    gap: 16,
  },
  gradientPreview: {
    borderWidth: 3,
  },
  gradientColors: {
    flexDirection: 'row',
    height: 80,
    overflow: 'hidden',
  },
  gradientName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textureGrid: {
    padding: 20,
  },
});
