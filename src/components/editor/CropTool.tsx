import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  Image,
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
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;

interface CropToolProps {
  isVisible: boolean;
  onClose: () => void;
  photoUri: string;
  currentCrop?: { x: number; y: number; width: number; height: number } | null;
  onApplyCrop: (crop: { x: number; y: number; width: number; height: number }) => void;
}

export const CropTool: React.FC<CropToolProps> = ({
  isVisible,
  onClose,
  photoUri,
  currentCrop,
  onApplyCrop,
}) => {
  const theme = useTheme();
  const translateY = useSharedValue(MODAL_HEIGHT);
  const [cropRect, setCropRect] = useState(
    currentCrop || { x: 0, y: 0, width: 200, height: 200 }
  );

  React.useEffect(() => {
    translateY.value = isVisible ? withSpring(0) : withTiming(MODAL_HEIGHT);
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

  const handleApply = () => {
    onApplyCrop(cropRect);
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
              styles.modal,
              {
                backgroundColor: theme.colors.surface,
                height: MODAL_HEIGHT,
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
                  marginBottom: theme.spacing(4),
                },
              ]}
            >
              Crop Image
            </Text>

            <View style={styles.cropArea}>
              <Image
                source={{ uri: photoUri }}
                style={styles.image}
                resizeMode="contain"
              />
              <View
                style={[
                  styles.cropOverlay,
                  {
                    borderColor: theme.colors.primary,
                  },
                ]}
              />
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modal: {
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
  cropArea: {
    flex: 1,
    margin: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cropOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
    width: 200,
    height: 200,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
