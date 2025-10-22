import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
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

  const backgroundColor = useMemo(() => {
    if (!project.canvas.background) {
      return 'rgba(255,255,255,0.08)';
    }
    if (project.canvas.background.type === 'color') {
      return project.canvas.background.value;
    }
    return 'rgba(255,255,255,0.08)';
  }, [project.canvas.background]);

  const backgroundImage = useMemo(() => {
    if (!project.canvas.background) {
      return undefined;
    }
    if (
      project.canvas.background.type === 'photo' &&
      typeof project.canvas.background.value === 'string' &&
      project.canvas.background.value.length > 0
    ) {
      return project.canvas.background.value;
    }
    return undefined;
  }, [project.canvas.background]);

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
      onLayout={handleLayout}
    >
      <View
        style={[
          styles.aspectWrapper,
          {
            borderRadius,
            aspectRatio,
          },
        ]}
      >
        {backgroundImage ? (
          <Image
            source={{ uri: backgroundImage }}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, { borderRadius }]}
          />
        ) : null}
        <View style={styles.layersContainer} pointerEvents="none">
          {!hasMeasured
            ? null
            : sortedLayers.map((layer) => {
            if ('hidden' in layer && layer.hidden) {
              return null;
            }

            if (isPhotoLayer(layer)) {
              const width = layer.dimensions.width * scale;
              const height = layer.dimensions.height * scale;
              const layerBorderRadius = Math.max(borderRadius * 0.5, 6);
              const transforms = [
                { translateX: layer.transform.x * scale },
                { translateY: layer.transform.y * scale },
                { scale: layer.transform.scale },
                { rotate: `${layer.transform.rotation}rad` },
              ];

              const hasImage = layer.sourceUri.length > 0;

              return (
                <View
                  key={layer.id}
                  style={[
                    styles.photoLayer,
                    {
                      width,
                      height,
                      opacity: layer.opacity,
                      zIndex: layer.zIndex,
                      transform: transforms,
                      borderRadius: layerBorderRadius,
                    },
                  ]}
                >
                  {hasImage ? (
                    <Image
                      source={{ uri: layer.sourceUri }}
                      resizeMode="cover"
                      style={[
                        styles.photo,
                        {
                          borderRadius: layerBorderRadius,
                        },
                      ]}
                    />
                  ) : (
                    showPlaceholders && (
                      <View
                        style={[
                          styles.placeholder,
                          { borderRadius: layerBorderRadius },
                        ]}
                      >
                        <Text style={styles.placeholderText}>Add Photo</Text>
                      </View>
                    )
                  )}
                </View>
              );
            }

            if (isTextLayer(layer)) {
              const transforms = [
                { translateX: layer.transform.x * scale },
                { translateY: layer.transform.y * scale },
                { scale: layer.transform.scale },
                { rotate: `${layer.transform.rotation}rad` },
              ];

              return (
                <Text
                  key={layer.id}
                  numberOfLines={2}
                  style={[
                    styles.textLayer,
                    {
                      color: layer.color,
                      fontSize: layer.fontSize * scale,
                      zIndex: layer.zIndex,
                      transform: transforms,
                    },
                  ]}
                >
                  {layer.text}
                </Text>
              );
            }

            return null;
          })}
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
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  photoLayer: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 12,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
