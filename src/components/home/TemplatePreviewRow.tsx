import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { Canvas, Path, Rect } from '@shopify/react-native-skia';

import { SAMPLE_TEMPLATES } from '../../constants/templates';
import { useNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { useUIStore } from '../../stores/useUIStore';
import { usePurchaseStore } from '../../stores/usePurchaseStore';
import { createClipForMask, getMaskStroke } from '../../utils/maskUtils';
import type { TemplateDefinition } from '../../types/projects';

interface TemplateFramePreviewProps {
  frame: TemplateDefinition['layout']['frames'][number];
  canvasSize: { width: number; height: number };
  previewSize: { width: number; height: number };
}

const TemplateFramePreview: React.FC<TemplateFramePreviewProps> = ({
  frame,
  canvasSize,
  previewSize,
}) => {
  if (previewSize.width === 0 || previewSize.height === 0) {
    return null;
  }

  const widthPx = (frame.size.width / canvasSize.width) * previewSize.width;
  const heightPx = (frame.size.height / canvasSize.height) * previewSize.height;
  const left = (frame.position.x / canvasSize.width) * previewSize.width;
  const top = (frame.position.y / canvasSize.height) * previewSize.height;

  const clipPath = useMemo(
    () => createClipForMask(frame.mask ?? null, widthPx, heightPx),
    [frame.mask, widthPx, heightPx],
  );

  const previewScale = (() => {
    if (previewSize.width === 0 || previewSize.height === 0) {
      return 1;
    }
    const scaleX =
      canvasSize.width === 0 ? 1 : previewSize.width / canvasSize.width;
    const scaleY =
      canvasSize.height === 0 ? 1 : previewSize.height / canvasSize.height;
    return Math.min(scaleX, scaleY);
  })();

  const stroke = useMemo(() => {
    if (!clipPath) {
      return null;
    }
    return getMaskStroke(frame.mask ?? null, previewScale);
  }, [clipPath, frame.mask, previewScale]);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.framePreview,
        {
          left,
          top,
          width: widthPx,
          height: heightPx,
          transform: [{ rotate: `${frame.rotation}rad` }],
        },
      ]}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        {clipPath ? (
          <>
            <Path path={clipPath} color="rgba(155, 127, 255, 0.15)" />
            <Path
              path={clipPath}
              color={stroke?.color ?? 'rgba(155, 127, 255, 0.6)'}
              style="stroke"
              strokeWidth={stroke?.width ?? 2}
              strokeJoin={stroke?.join}
              strokeCap={stroke?.cap}
            />
          </>
        ) : (
          <>
            <Rect
              x={0}
              y={0}
              width={widthPx}
              height={heightPx}
              color="rgba(155, 127, 255, 0.15)"
            />
            <Rect
              x={0}
              y={0}
              width={widthPx}
              height={heightPx}
              color="rgba(155, 127, 255, 0.6)"
              style="stroke"
              strokeWidth={2}
            />
          </>
        )}
      </Canvas>
    </View>
  );
};

export const TemplatePreviewRow: React.FC = () => {
  const theme = useTheme();
  const openTemplateDrawer = useUIStore((state) => state.setTemplateDrawer);
  const openPremiumSheet = useUIStore((state) => state.openPremiumSheet);
  const navigate = useNavigation();
  const isPremiumUnlocked = usePurchaseStore((state) =>
    state.isUnlocked('premiumTemplates'),
  );
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  const handlePreviewLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPreviewSize({ width, height });
  };

  const handleTemplatePress = (templateId: string, isPremium: boolean) => {
    if (isPremium && !isPremiumUnlocked) {
      openPremiumSheet('premiumTemplates');
      return;
    }
    navigate.navigate({ route: 'editor', templateId, projectId: undefined });
  };

  return (
    <View style={{ paddingVertical: theme.spacing(6) }}>
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing(5),
            marginBottom: theme.spacing(3),
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: theme.colors.textPrimary },
          ]}
        >
          Popular Templates
        </Text>
        <TouchableOpacity
          onPress={() => openTemplateDrawer({ isOpen: true, category: 'all' })}
          accessibilityRole="button"
        >
          <Text style={{ color: theme.colors.accent }}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing(5),
          gap: theme.spacing(4),
        }}
      >
        {SAMPLE_TEMPLATES.map((template, index) => (
          <Animated.View
            key={template.id}
            entering={FadeInRight.delay(index * 80)}
            style={[
              styles.card,
              styles.cardDimensions,
              {
                borderRadius: theme.radius.l,
                padding: theme.spacing(3),
              },
            ]}
          >
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.cardContent}
              onPress={() => handleTemplatePress(template.id, template.isPremium)}
            >
              <View
                style={[
                  styles.preview,
                  {
                    borderRadius: theme.radius.m,
                    marginBottom: theme.spacing(3),
                    backgroundColor: template.layout.canvas.background.value,
                    overflow: 'hidden',
                  },
                ]}
                onLayout={handlePreviewLayout}
              >
                {template.layout.frames.map((frame) => (
                  <TemplateFramePreview
                    key={frame.id}
                    frame={frame}
                    canvasSize={{
                      width: template.layout.canvas.width,
                      height: template.layout.canvas.height,
                    }}
                    previewSize={previewSize}
                  />
                ))}
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {template.name}
              </Text>
              {template.isPremium && !isPremiumUnlocked ? (
                <Text
                  style={[
                    styles.premiumBadge,
                    { color: theme.colors.accentSecondary },
                  ]}
                >
                  Premium
                </Text>
              ) : null}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'space-between',
  },
  cardDimensions: {
    width: 180,
    height: 240,
  },
  cardContent: {
    flex: 1,
  },
  preview: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  framePreview: {
    position: 'absolute',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBadge: {
    marginTop: 4,
  },
});
