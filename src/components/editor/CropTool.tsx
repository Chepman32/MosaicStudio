import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  Image,
  LayoutChangeEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../theme/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.9;
const CROP_AREA_PADDING = 20;
const MIN_CROP_SIZE = 50;
const HANDLE_SIZE = 24;

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
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const cropX = useSharedValue(currentCrop?.x || 0);
  const cropY = useSharedValue(currentCrop?.y || 0);
  const cropWidth = useSharedValue(currentCrop?.width || 200);
  const cropHeight = useSharedValue(currentCrop?.height || 200);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const startHeight = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = isVisible ? withSpring(0) : withTiming(MODAL_HEIGHT);
    if (isVisible && !currentCrop && imageLayout.width > 0) {
      const defaultWidth = imageLayout.width * 0.8;
      const defaultHeight = imageLayout.height * 0.8;
      cropX.value = (imageLayout.width - defaultWidth) / 2;
      cropY.value = (imageLayout.height - defaultHeight) / 2;
      cropWidth.value = defaultWidth;
      cropHeight.value = defaultHeight;
    }
  }, [isVisible, translateY, currentCrop, imageLayout, cropX, cropY, cropWidth, cropHeight]);

  const handleImageLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setImageLayout({ width, height, x, y });
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const cropPanGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = cropX.value;
      startY.value = cropY.value;
    })
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(imageLayout.width - cropWidth.value, startX.value + e.translationX));
      const newY = Math.max(0, Math.min(imageLayout.height - cropHeight.value, startY.value + e.translationY));
      cropX.value = newX;
      cropY.value = newY;
    });

  const createResizeGesture = (corner: 'tl' | 'tr' | 'bl' | 'br') => {
    return Gesture.Pan()
      .onStart(() => {
        startX.value = cropX.value;
        startY.value = cropY.value;
        startWidth.value = cropWidth.value;
        startHeight.value = cropHeight.value;
      })
      .onUpdate((e) => {
        if (corner === 'br') {
          cropWidth.value = Math.max(MIN_CROP_SIZE, Math.min(imageLayout.width - startX.value, startWidth.value + e.translationX));
          cropHeight.value = Math.max(MIN_CROP_SIZE, Math.min(imageLayout.height - startY.value, startHeight.value + e.translationY));
        } else if (corner === 'bl') {
          const newX = Math.max(0, startX.value + e.translationX);
          const deltaX = startX.value - newX;
          cropX.value = newX;
          cropWidth.value = Math.max(MIN_CROP_SIZE, startWidth.value + deltaX);
          cropHeight.value = Math.max(MIN_CROP_SIZE, Math.min(imageLayout.height - startY.value, startHeight.value + e.translationY));
        } else if (corner === 'tr') {
          const newY = Math.max(0, startY.value + e.translationY);
          const deltaY = startY.value - newY;
          cropY.value = newY;
          cropWidth.value = Math.max(MIN_CROP_SIZE, Math.min(imageLayout.width - startX.value, startWidth.value + e.translationX));
          cropHeight.value = Math.max(MIN_CROP_SIZE, startHeight.value + deltaY);
        } else if (corner === 'tl') {
          const newX = Math.max(0, startX.value + e.translationX);
          const newY = Math.max(0, startY.value + e.translationY);
          const deltaX = startX.value - newX;
          const deltaY = startY.value - newY;
          cropX.value = newX;
          cropY.value = newY;
          cropWidth.value = Math.max(MIN_CROP_SIZE, startWidth.value + deltaX);
          cropHeight.value = Math.max(MIN_CROP_SIZE, startHeight.value + deltaY);
        }
      });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const cropOverlayStyle = useAnimatedStyle(() => ({
    left: cropX.value,
    top: cropY.value,
    width: cropWidth.value,
    height: cropHeight.value,
  }));

  const handleApply = () => {
    const crop = {
      x: cropX.value / imageLayout.width,
      y: cropY.value / imageLayout.height,
      width: cropWidth.value / imageLayout.width,
      height: cropHeight.value / imageLayout.height,
    };
    onApplyCrop(crop);
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
                onLayout={handleImageLayout}
              />

              {imageLayout.width > 0 && (
                <>
                  <View style={[styles.darkOverlay, { opacity: 0.5 }]} pointerEvents="none" />

                  <GestureDetector gesture={cropPanGesture}>
                    <Animated.View
                      style={[
                        styles.cropOverlay,
                        { borderColor: theme.colors.primary },
                        cropOverlayStyle,
                      ]}
                    >
                      <GestureDetector gesture={createResizeGesture('tl')}>
                        <View style={[styles.handle_corner, styles.handle_tl, { backgroundColor: theme.colors.primary }]} />
                      </GestureDetector>
                      <GestureDetector gesture={createResizeGesture('tr')}>
                        <View style={[styles.handle_corner, styles.handle_tr, { backgroundColor: theme.colors.primary }]} />
                      </GestureDetector>
                      <GestureDetector gesture={createResizeGesture('bl')}>
                        <View style={[styles.handle_corner, styles.handle_bl, { backgroundColor: theme.colors.primary }]} />
                      </GestureDetector>
                      <GestureDetector gesture={createResizeGesture('br')}>
                        <View style={[styles.handle_corner, styles.handle_br, { backgroundColor: theme.colors.primary }]} />
                      </GestureDetector>
                    </Animated.View>
                  </GestureDetector>
                </>
              )}
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
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  cropOverlay: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#FFF',
    backgroundColor: 'transparent',
  },
  handle_corner: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  handle_tl: {
    top: -HANDLE_SIZE / 2,
    left: -HANDLE_SIZE / 2,
  },
  handle_tr: {
    top: -HANDLE_SIZE / 2,
    right: -HANDLE_SIZE / 2,
  },
  handle_bl: {
    bottom: -HANDLE_SIZE / 2,
    left: -HANDLE_SIZE / 2,
  },
  handle_br: {
    bottom: -HANDLE_SIZE / 2,
    right: -HANDLE_SIZE / 2,
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
