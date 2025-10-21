import React from 'react';
import { Canvas, Group, Image, useImage, rect, Skia } from '@shopify/react-native-skia';
import type { PhotoLayer as PhotoLayerType } from '../../types/projects';
import { createClipForMask } from '../../utils/maskUtils';

interface SkiaRendererProps {
  width: number;
  height: number;
  backgroundColor: string;
  layers: PhotoLayerType[];
}

export const SkiaRenderer: React.FC<SkiaRendererProps> = ({
  width,
  height,
  backgroundColor,
  layers,
}) => {
  const sortedLayers = React.useMemo(() => {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);

  return (
    <Canvas style={{ width, height }}>
      {/* Background */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        color={backgroundColor}
      />

      {/* Render each layer */}
      {sortedLayers.map((layer) => (
        <SkiaPhotoLayer key={layer.id} layer={layer} />
      ))}
    </Canvas>
  );
};

interface SkiaPhotoLayerProps {
  layer: PhotoLayerType;
}

const SkiaPhotoLayer: React.FC<SkiaPhotoLayerProps> = ({ layer }) => {
  const image = useImage(layer.sourceUri);

  if (!image) {
    return null;
  }

  const { x, y, scale, rotation } = layer.transform;
  const { width, height } = layer.dimensions;
  const clip = React.useMemo(
    () => createClipForMask(layer.mask, width, height),
    [layer.mask, width, height],
  );

  // Apply filters if any
  const paint = React.useMemo(() => {
    if (!layer.filters || layer.filters.length === 0) {
      return undefined;
    }

    const p = Skia.Paint();
    // Apply filters here (will be implemented in FilterSheet)
    return p;
  }, [layer.filters]);

  return (
    <Group
      transform={[
        { translateX: x + width / 2 },
        { translateY: y + height / 2 },
        { scale },
        { rotate: rotation },
        { translateX: -width / 2 },
        { translateY: -height / 2 },
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
        paint={paint}
      />
    </Group>
  );
};
