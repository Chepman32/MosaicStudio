import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  LayoutChangeEvent,
} from 'react-native';

import { SAMPLE_TEMPLATES } from '../../constants/templates';
import { useNavigation } from '../../navigation/NavigationContext';
import { useProjectStore } from '../../stores/useProjectStore';
import { useTheme } from '../../theme/ThemeContext';
import { TemplateLayoutPreview } from '../templates/TemplateLayoutPreview';
import type { TemplateDefinition } from '../../types/projects';

interface TemplateDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TemplateDrawer: React.FC<TemplateDrawerProps> = ({
  isVisible,
  onClose,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const createFromTemplate = useProjectStore(
    (state) => state.createFromTemplate,
  );
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const [gridWidth, setGridWidth] = useState(0);

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

  const handleSelect = useCallback(
    (template: TemplateDefinition) => {
      const project = createFromTemplate(template);
      setCurrentProject(project.id);
      navigation.navigate({
        route: 'editor',
        projectId: project.id,
        templateId: template.id,
      });
      closeWithAnimation();
    },
    [closeWithAnimation, createFromTemplate, navigation, setCurrentProject],
  );

  const handleGridLayout = useCallback((event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  }, []);

  const columnSpacing = useMemo(() => theme.spacing(4), [theme]);
  const gridLayout = useMemo(() => {
    if (!gridWidth) {
      return { cardWidth: undefined, columns: 2 };
    }

    const twoColumnWidth = (gridWidth - columnSpacing) / 2;

    if (twoColumnWidth < 160) {
      return { cardWidth: gridWidth, columns: 1 };
    }

    return { cardWidth: twoColumnWidth, columns: 2 };
  }, [columnSpacing, gridWidth]);

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
          <View
            style={[
              styles.grid,
              {
                marginTop: theme.spacing(2),
              },
            ]}
            onLayout={handleGridLayout}
          >
            {SAMPLE_TEMPLATES.map((template, index) => {
              const isLastColumn =
                gridLayout.columns === 1
                  ? true
                  : (index + 1) % gridLayout.columns === 0;
              return (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => handleSelect(template)}
                  style={[
                    styles.card,
                    {
                      borderRadius: theme.radius.l,
                      padding: theme.spacing(3),
                      marginBottom: theme.spacing(4),
                      marginRight:
                        isLastColumn || gridLayout.columns === 1
                          ? 0
                          : columnSpacing,
                      width: gridLayout.cardWidth ?? '48%',
                    },
                  ]}
                >
                  <TemplateLayoutPreview
                    template={template}
                    borderRadius={theme.radius.m}
                    style={{ marginBottom: theme.spacing(2), width: '100%' }}
                  />
                  <Text
                    style={[
                      styles.templateName,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {template.name}
                  </Text>
                  <Text style={{ color: theme.colors.textSecondary }}>
                    {template.category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
