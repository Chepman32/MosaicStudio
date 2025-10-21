import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from 'react-native';
import { Canvas, Path, Rect } from '@shopify/react-native-skia';

import type { TemplateDefinition } from '../../types/projects';
import { createClipForMask, getMaskStroke } from '../../utils/maskUtils';

interface TemplateLayoutPreviewProps extends Pick<ViewProps, 'style'> {
  template: TemplateDefinition;
  borderRadius?: number;
  useAspectRatio?: boolean;
}

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

export const TemplateLayoutPreview: React.FC<TemplateLayoutPreviewProps> = ({
  template,
  style,
  borderRadius = 12,
  useAspectRatio = true,
}) => {
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  const handlePreviewLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width === previewSize.width && height === previewSize.height) {
      return;
    }
    setPreviewSize({ width, height });
  };

  const aspectRatio = useMemo(() => {
    if (template.layout.canvas.width === 0 || template.layout.canvas.height === 0) {
      return 1;
    }
    return template.layout.canvas.width / template.layout.canvas.height;
  }, [template.layout.canvas.height, template.layout.canvas.width]);

  return (
    <View
      style={[
        styles.preview,
        {
          borderRadius,
          backgroundColor: template.layout.canvas.background.value,
        },
        useAspectRatio ? { aspectRatio } : null,
        style,
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
  );
};

const styles = StyleSheet.create({
  preview: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  framePreview: {
    position: 'absolute',
  },
});
