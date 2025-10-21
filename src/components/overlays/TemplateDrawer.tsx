import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SAMPLE_TEMPLATES } from '../../constants/templates';
import { useProjectStore } from '../../stores/useProjectStore';
import { useTheme } from '../../theme/ThemeContext';

interface TemplateDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TemplateDrawer: React.FC<TemplateDrawerProps> = ({
  isVisible,
  onClose,
}) => {
  const theme = useTheme();
  const createFromTemplate = useProjectStore(
    (state) => state.createFromTemplate,
  );
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const handleSelect = (templateId: string) => {
    const template = SAMPLE_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    const project = createFromTemplate(template);
    setCurrentProject(project.id);
    onClose();
  };

  const translateY = useRef(new Animated.Value(0)).current;
  const isClosingRef = useRef(false);

  useEffect(() => {
    translateY.stopAnimation();
    translateY.setValue(0);
    isClosingRef.current = false;
  }, [isVisible, translateY]);

  const closeWithAnimation = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;

    Animated.timing(translateY, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onClose();
      } else {
        isClosingRef.current = false;
      }
    });
  }, [onClose, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4,
        onPanResponderMove: (_, gesture) => {
          if (isClosingRef.current) return;
          if (gesture.dy > 0) {
            translateY.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldClose = gesture.dy > 120 || gesture.vy > 1;

          if (shouldClose) {
            closeWithAnimation();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: (_, gesture) => {
          if (isClosingRef.current) return;
          if (gesture.dy > 0) {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [closeWithAnimation, translateY],
  );

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              padding: theme.spacing(5),
              borderTopLeftRadius: theme.radius.xxl,
              borderTopRightRadius: theme.radius.xxl,
            },
            { transform: [{ translateY }] },
          ]}
        >
          <View
            style={[
              styles.handleContainer,
              { marginBottom: theme.spacing(4) },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.handle} />
          </View>
          {SAMPLE_TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              onPress={() => handleSelect(template.id)}
              style={{ marginBottom: theme.spacing(4) }}
            >
              <Text style={[styles.templateName, { color: theme.colors.textPrimary }]}>
                {template.name}
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                {template.category}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '70%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  handle: {
    height: 4,
    width: 36,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
  templateName: {
    fontSize: 18,
  },
});
