import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Group, Image, useImage } from '@shopify/react-native-skia';
import type { PhotoLayer as PhotoLayerType } from '../../types/projects';
import { createClipForMask } from '../../utils/maskUtils';

interface CollageCanvasProps {
  width: number;
  height: number;
  backgroundColor: string;
  layers: PhotoLayerType[];
  onLayerPress?: (layerId: string) => void;
}

export const CollageCanvas: React.FC<CollageCanvasProps> = ({
  width,
  height,
  backgroundColor,
  layers,
}) => {
  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);

  return (
    <View style={[styles.container, { width, height, backgroundColor }]}>
      <Canvas style={{ width, height }}>
        {sortedLayers.map((layer) => (
          <PhotoLayerRenderer key={layer.id} layer={layer} />
        ))}
      </Canvas>
    </View>
  );
};

interface PhotoLayerRendererProps {
  layer: PhotoLayerType;
}

const PhotoLayerRenderer: React.FC<PhotoLayerRendererProps> = ({ layer }) => {
  const image = useImage(layer.sourceUri);

  if (!image) {
    return null;
  }

  const { x, y, scale, rotation } = layer.transform;
  const { width, height } = layer.dimensions;
  const clip = useMemo(
    () => createClipForMask(layer.mask, width, height),
    [layer.mask, width, height],
  );

  return (
    <Group
      transform={[
        { translateX: x },
        { translateY: y },
        { scale },
        { rotate: rotation },
      ]}
      opacity={layer.opacity}
      clip={clip ?? undefined}
    >
      <Image
        image={image}
        x={0}
        y={0}
        width={width}
        height={height}
        fit="cover"
      />
    </Group>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
