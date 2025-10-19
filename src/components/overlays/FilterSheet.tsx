import React, { useState, useMemo } from 'react';
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
import Slider from '@react-native-community/slider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;

interface Filter {
  id: string;
  name: string;
  category: 'basic' | 'preset' | 'artistic' | 'advanced';
  isPremium: boolean;
}

const FILTERS: Filter[] = [
  { id: 'none', name: 'None', category: 'basic', isPremium: false },
  { id: 'brightness', name: 'Brightness', category: 'basic', isPremium: false },
  { id: 'contrast', name: 'Contrast', category: 'basic', isPremium: false },
  { id: 'saturation', name: 'Saturation', category: 'basic', isPremium: false },
  { id: 'vintage', name: 'Vintage', category: 'preset', isPremium: false },
  { id: 'bw', name: 'B&W', category: 'preset', isPremium: false },
  { id: 'sepia', name: 'Sepia', category: 'preset', isPremium: false },
  { id: 'cinematic', name: 'Cinematic', category: 'preset', isPremium: false },
  { id: 'oil', name: 'Oil Paint', category: 'artistic', isPremium: true },
  { id: 'watercolor', name: 'Watercolor', category: 'artistic', isPremium: true },
  { id: 'sketch', name: 'Sketch', category: 'artistic', isPremium: true },
  { id: 'hdr', name: 'HDR', category: 'advanced', isPremium: true },
  { id: 'vignette', name: 'Vignette', category: 'advanced', isPremium: true },
  { id: 'blur', name: 'Blur', category: 'advanced', isPremium: true },
];

interface FilterSheetProps {
  isVisible: boolean;
  onClose: () => void;
  currentFilter?: string;
  onApplyFilter: (filterId: string, intensity: number) => void;
  photoUri: string;
  isPremium: boolean;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isVisible,
  onClose,
  currentFilter = 'none',
  onApplyFilter,
  photoUri,
  isPremium,
}) => {
  const theme = useTheme();
  const translateY = useSharedValue(SHEET_HEIGHT);
  const [selectedFilter, setSelectedFilter] = useState(currentFilter);
  const [intensity, setIntensity] = useState(100);

  React.useEffect(() => {
    translateY.value = isVisible ? withSpring(0) : withTiming(SHEET_HEIGHT);
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

  const handleFilterSelect = (filterId: string, isPremiumFilter: boolean) => {
    if (isPremiumFilter && !isPremium) {
      // Show premium sheet
      return;
    }
    setSelectedFilter(filterId);
  };

  const handleApply = () => {
    onApplyFilter(selectedFilter, intensity);
    onClose();
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
              styles.sheet,
              {
                backgroundColor: theme.colors.surface,
                height: SHEET_HEIGHT,
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
                { color: theme.colors.textPrimary, marginBottom: theme.spacing(4) },
              ]}
            >
              Filters
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterStrip}
              contentContainerStyle={styles.filterStripContent}
            >
              {FILTERS.map((filter) => (
                <FilterPreview
                  key={filter.id}
                  filter={filter}
                  isSelected={selectedFilter === filter.id}
                  onSelect={handleFilterSelect}
                  photoUri={photoUri}
                  isPremium={isPremium}
                />
              ))}
            </ScrollView>

            <View style={[styles.controls, { paddingHorizontal: theme.spacing(4) }]}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
                Intensity
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={intensity}
                onValueChange={setIntensity}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.textTertiary}
                thumbTintColor={theme.colors.primary}
              />
              <Text style={[styles.intensityValue, { color: theme.colors.textPrimary }]}>
                {Math.round(intensity)}%
              </Text>
            </View>

            <View style={[styles.actions, { paddingHorizontal: theme.spacing(4) }]}>
              <Pressable
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor: theme.colors.textTertiary },
                ]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, { color: theme.colors.textPrimary }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.applyButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={handleApply}
              >
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                  Apply
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

interface FilterPreviewProps {
  filter: Filter;
  isSelected: boolean;
  onSelect: (id: string, isPremium: boolean) => void;
  photoUri: string;
  isPremium: boolean;
}

const FilterPreview: React.FC<FilterPreviewProps> = ({
  filter,
  isSelected,
  onSelect,
  photoUri,
  isPremium,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1.0);
    });
    onSelect(filter.id, filter.isPremium);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.filterPreview,
          {
            borderColor: isSelected ? theme.colors.primary : 'transparent',
            borderWidth: isSelected ? 3 : 0,
          },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.previewImage,
            { backgroundColor: theme.colors.backgroundAlt },
          ]}
        >
          {filter.isPremium && !isPremium && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.filterName,
            { color: theme.colors.textSecondary, marginTop: theme.spacing(1) },
          ]}
          numberOfLines={1}
        >
          {filter.name}
        </Text>
      </Animated.View>
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
  sheet: {
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
    paddingHorizontal: 20,
  },
  filterStrip: {
    marginBottom: 24,
  },
  filterStripContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterPreview: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 4,
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,215,0,0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 12,
  },
  filterName: {
    fontSize: 12,
    textAlign: 'center',
  },
  controls: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  intensityValue: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 2,
  },
  applyButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
