import React from 'react';
import { Canvas, Group, Image, Path, Rect, Skia, useImage } from '@shopify/react-native-skia';
import type { PhotoLayer as PhotoLayerType } from '../../types/projects';
import { createClipForMask, getMaskStroke } from '../../utils/maskUtils';

interface SkiaRendererProps {
  width: number;
  height: number;
  backgroundColor: string;
  layers: PhotoLayerType[];
  backgroundImageUri?: string | null;
}

export const SkiaRenderer: React.FC<SkiaRendererProps> = ({
  width,
  height,
  backgroundColor,
  layers,
  backgroundImageUri,
}) => {
  const sortedLayers = React.useMemo(() => {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex);
  }, [layers]);

  const backgroundImage = useImage(backgroundImageUri ?? null);

  return (
    <Canvas style={{ width, height, position: 'absolute', top: 0, left: 0 }}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        color={backgroundColor}
      />

      {backgroundImage ? (
        <Image
          image={backgroundImage}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        />
      ) : null}

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
  const stroke = React.useMemo(() => getMaskStroke(layer.mask, 1), [layer.mask]);

  // Handle cropping like PhotoLayerImage does
  const { drawWidth, drawHeight, offsetX, offsetY } = React.useMemo(() => {
    if (
      !layer.crop ||
      !Number.isFinite(layer.crop.width) ||
      !Number.isFinite(layer.crop.height) ||
      layer.crop.width <= 0 ||
      layer.crop.height <= 0
    ) {
      return {
        drawWidth: width,
        drawHeight: height,
        offsetX: 0,
        offsetY: 0,
      };
    }

    const drawWidth = width / layer.crop.width;
    const drawHeight = height / layer.crop.height;
    const offsetX = -(layer.crop.x * width) / layer.crop.width;
    const offsetY = -(layer.crop.y * height) / layer.crop.height;

    return { drawWidth, drawHeight, offsetX, offsetY };
  }, [layer.crop, width, height]);

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
        x={offsetX}
        y={offsetY}
        width={drawWidth}
        height={drawHeight}
        fit="cover"
        paint={paint}
      />
      {clip && stroke ? (
        <Path
          path={clip}
          style="stroke"
          strokeWidth={stroke.width}
          color={stroke.color}
          strokeJoin={stroke.join}
          strokeCap={stroke.cap}
        />
      ) : null}
    </Group>
  );
};
