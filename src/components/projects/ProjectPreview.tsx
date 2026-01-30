import React, { useCallback, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  ViewProps,
} from 'react-native';

import type {
  CollageProject,
  Layer,
  PhotoLayer,
  TextLayer,
} from '../../types/projects';
import { SkiaRenderer } from '../canvas/SkiaRenderer';

const isPhotoLayer = (layer: Layer): layer is PhotoLayer =>
  'sourceUri' in layer;

const isTextLayer = (layer: Layer): layer is TextLayer => 'text' in layer;

interface ProjectPreviewProps extends Pick<ViewProps, 'style'> {
  project: CollageProject;
  borderRadius?: number;
  showPlaceholders?: boolean;
}

export const ProjectPreview: React.FC<ProjectPreviewProps> = ({
  project,
  style,
  borderRadius = 14,
  showPlaceholders = true,
}) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (width === size.width && height === size.height) {
        return;
      }
      setSize({ width, height });
    },
    [size.height, size.width],
  );

  const aspectRatio = useMemo(() => {
    if (project.canvas.width === 0 || project.canvas.height === 0) {
      return 1;
    }
    return project.canvas.width / project.canvas.height;
  }, [project.canvas.height, project.canvas.width]);

  const scale = useMemo(() => {
    if (size.width === 0 || size.height === 0) {
      return 1;
    }
    const scaleX =
      project.canvas.width === 0 ? 1 : size.width / project.canvas.width;
    const scaleY =
      project.canvas.height === 0 ? 1 : size.height / project.canvas.height;
    const nextScale = Math.min(scaleX, scaleY);
    return Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1;
  }, [project.canvas.height, project.canvas.width, size.height, size.width]);

  const sortedLayers = useMemo(
    () => [...project.layers].sort((a, b) => a.zIndex - b.zIndex),
    [project.layers],
  );

  const { backgroundColor, backgroundImageUri } = useMemo(() => {
    if (!project.canvas.background) {
      return {
        backgroundColor: 'rgba(255,255,255,0.08)',
        backgroundImageUri: null as string | null,
      };
    }
    if (project.canvas.background.type === 'color') {
      return {
        backgroundColor: project.canvas.background.value,
        backgroundImageUri: null as string | null,
      };
    }
    if (
      project.canvas.background.type === 'photo' &&
      typeof project.canvas.background.value === 'string' &&
      project.canvas.background.value.length > 0
    ) {
      return {
        backgroundColor: '#000000',
        backgroundImageUri: project.canvas.background.value,
      };
    }
    return {
      backgroundColor: 'rgba(255,255,255,0.08)',
      backgroundImageUri: null as string | null,
    };
  }, [project.canvas.background]);

  const scaledPhotoLayers = useMemo(() => {
    return sortedLayers.filter(isPhotoLayer).map((layer) => ({
      ...layer,
      transform: {
        ...layer.transform,
        x: layer.transform.x * scale,
        y: layer.transform.y * scale,
      },
      dimensions: {
        width: layer.dimensions.width * scale,
        height: layer.dimensions.height * scale,
      },
    }));
  }, [scale, sortedLayers]);

  const filledPhotoLayers = useMemo(
    () => scaledPhotoLayers.filter((layer) => layer.sourceUri.length > 0),
    [scaledPhotoLayers],
  );

  const placeholderLayers = useMemo(
    () =>
      showPlaceholders
        ? scaledPhotoLayers.filter((layer) => layer.sourceUri.length === 0)
        : [],
    [scaledPhotoLayers, showPlaceholders],
  );

  const textLayers = useMemo(() => {
    return sortedLayers
      .filter(isTextLayer)
      .map((layer) => ({
        id: layer.id,
        text: layer.text,
        color: layer.color,
        fontSize: layer.fontSize * scale * layer.transform.scale,
        zIndex: layer.zIndex,
        transform: [
          { translateX: layer.transform.x * scale },
          { translateY: layer.transform.y * scale },
          { rotate: `${layer.transform.rotation}rad` },
        ],
      }));
  }, [scale, sortedLayers]);

  const hasMeasured = size.width > 0 && size.height > 0;

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.aspectWrapper,
          {
            borderRadius,
            aspectRatio,
          },
        ]}
        onLayout={handleLayout}
      >
        <View style={styles.layersContainer} pointerEvents="none">
          {hasMeasured ? (
            <>
              <SkiaRenderer
                width={size.width}
                height={size.height}
                backgroundColor={backgroundColor}
                layers={filledPhotoLayers}
                backgroundImageUri={backgroundImageUri}
              />
              {placeholderLayers.map((layer) => {
                const width = layer.dimensions.width;
                const height = layer.dimensions.height;
                const layerBorderRadius = Math.max(borderRadius * 0.5, 6);
                const transforms = [
                  { translateX: layer.transform.x + width / 2 },
                  { translateY: layer.transform.y + height / 2 },
                  { scale: layer.transform.scale },
                  { rotate: `${layer.transform.rotation}rad` },
                  { translateX: -width / 2 },
                  { translateY: -height / 2 },
                ];

                return (
                  <View
                    key={layer.id}
                    style={[
                      styles.placeholder,
                      {
                        width,
                        height,
                        borderRadius: layerBorderRadius,
                        opacity: layer.opacity,
                        zIndex: layer.zIndex,
                        transform: transforms,
                      },
                    ]}
                  >
                    <Text style={styles.placeholderText}>Add Photo</Text>
                  </View>
                );
              })}
              {textLayers.map((layer) => (
                <Text
                  key={layer.id}
                  numberOfLines={2}
                  style={[
                    styles.textLayer,
                    {
                      color: layer.color,
                      fontSize: layer.fontSize,
                      zIndex: layer.zIndex,
                      transform: layer.transform,
                    },
                  ]}
                >
                  {layer.text}
                </Text>
              ))}
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  aspectWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  layersContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  placeholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  placeholderText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  textLayer: {
    position: 'absolute',
    fontWeight: '600',
  },
});
