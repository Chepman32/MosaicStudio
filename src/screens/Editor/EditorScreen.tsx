import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import { nanoid } from 'nanoid/non-secure';

import { SAMPLE_TEMPLATES } from '../../constants/templates';
import { useNavigation } from '../../navigation/NavigationContext';
import { useProjectStore } from '../../stores/useProjectStore';
import { useTheme } from '../../theme/ThemeContext';
import { useUIStore } from '../../stores/useUIStore';
import { TopToolbar } from '../../components/editor/TopToolbar';
import { BottomControlBar } from '../../components/editor/BottomControlBar';
import { PhotoLayer } from '../../components/canvas/PhotoLayer';
import { EmptyFrame } from '../../components/canvas/EmptyFrame';
import { BackgroundPanel } from '../../components/overlays/BackgroundPanel';
import { LayersPanel } from '../../components/overlays/LayersPanel';
import { FilterSheet } from '../../components/overlays/FilterSheet';
import { CropTool } from '../../components/editor/CropTool';
import { usePhotoPicker } from '../../components/editor/PhotoPicker';
import type { PhotoLayer as PhotoLayerType } from '../../types/projects';

// Keep resizing logic consistent with PhotoLayer
const MIN_DIMENSION = 60;

interface EditorScreenProps {
  projectId: string | null;
  templateId: string | null;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_CANVAS_WIDTH = SCREEN_WIDTH - 32;
const DEFAULT_CANVAS_HEIGHT = SCREEN_HEIGHT - 300;

export const EditorScreen: React.FC<EditorScreenProps> = ({
  projectId,
  templateId,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const project = useProjectStore((state) =>
    projectId ? state.projects[projectId] : null,
  );
  const updateProject = useProjectStore((state) => state.updateProject);
  const updateLayer = useProjectStore((state) => state.updateLayer);
  const deleteLayer = useProjectStore((state) => state.deleteLayer);
  const duplicateLayer = useProjectStore((state) => state.duplicateLayer);
  const toggleLayerVisibility = useProjectStore((state) => state.toggleLayerVisibility);
  const updateCanvasBackground = useProjectStore((state) => state.updateCanvasBackground);
  const renameProject = useProjectStore((state) => state.renameProject);
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);
  const undoStack = useProjectStore((state) => state.undoStack);
  const redoStack = useProjectStore((state) => state.redoStack);
  const createFromTemplate = useProjectStore(
    (state) => state.createFromTemplate,
  );
  const createBlank = useProjectStore((state) => state.createBlankProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const openExportModal = useUIStore((state) => state.openExportModal);
  const backgroundPanelOpen = useUIStore((state) => state.backgroundPanelOpen);
  const layersPanelOpen = useUIStore((state) => state.layersPanelOpen);
  const filterSheetLayerId = useUIStore((state) => state.filterSheetLayerId);
  const cropToolLayerId = useUIStore((state) => state.cropToolLayerId);
  const openBackgroundPanel = useUIStore((state) => state.openBackgroundPanel);
  const closeBackgroundPanel = useUIStore((state) => state.closeBackgroundPanel);
  const closeLayersPanel = useUIStore((state) => state.closeLayersPanel);
  const openFilterSheet = useUIStore((state) => state.openFilterSheet);
  const closeFilterSheet = useUIStore((state) => state.closeFilterSheet);
  const openCropTool = useUIStore((state) => state.openCropTool);
  const closeCropTool = useUIStore((state) => state.closeCropTool);

  const { pickPhotos } = usePhotoPicker();

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [swapSourceLayerId, setSwapSourceLayerId] = useState<string | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    if (!projectId) {
      if (templateId) {
        const template = SAMPLE_TEMPLATES.find((item) => item.id === templateId);
        if (template) {
          const newProject = createFromTemplate(template);
          setCurrentProject(newProject.id);
          navigation.reset({ route: 'editor', projectId: newProject.id, templateId });
          return;
        }
      }
      const created = createBlank('Untitled Collage');
      setCurrentProject(created.id);
      navigation.reset({ route: 'editor', projectId: created.id, templateId: null });
    }
  }, [createBlank, createFromTemplate, navigation, projectId, setCurrentProject, templateId]);

  useEffect(() => {
    if (!project) {
      setCanvasScale(1);
      return;
    }

    const baseWidth = Math.max(DEFAULT_CANVAS_WIDTH, 1);
    const baseHeight = Math.max(DEFAULT_CANVAS_HEIGHT, 1);
    const scaleX = baseWidth / project.canvas.width;
    const scaleY = baseHeight / project.canvas.height;
    const nextScale = Math.min(scaleX, scaleY);

    if (!Number.isFinite(nextScale) || nextScale <= 0) {
      return;
    }

    setCanvasScale((current) =>
      Math.abs(nextScale - current) > 0.001 ? nextScale : current
    );
  }, [project]);

  useEffect(() => {
    if (!selectedLayerId) {
      setSwapSourceLayerId(null);
    }
  }, [selectedLayerId]);

  const handleLayerTransformUpdate = useCallback(
    (layerId: string, transform: PhotoLayerType['transform']) => {
      if (project) {
        updateLayer(project.id, layerId, { transform });
      }
    },
    [project, updateLayer]
  );

  const handleLayerDelete = useCallback(() => {
    if (project && selectedLayerId) {
      deleteLayer(project.id, selectedLayerId);
      setSelectedLayerId(null);
      setSwapSourceLayerId(null);
    }
  }, [project, selectedLayerId, deleteLayer]);

  const handleBack = useCallback(() => {
    navigation.navigate({ route: 'home' });
  }, [navigation]);

  const handleExport = useCallback(() => {
    if (project) {
      openExportModal(project.id);
    }
  }, [project, openExportModal]);

  const handleCanvasLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (!project) return;

      const { width, height } = event.nativeEvent.layout;
      if (width <= 0 || height <= 0) {
        return;
      }

      const scaleX = width / project.canvas.width;
      const scaleY = height / project.canvas.height;
      const nextScale = Math.min(scaleX, scaleY);

      if (!Number.isFinite(nextScale) || nextScale <= 0) {
        return;
      }

      setCanvasScale((current) =>
        Math.abs(nextScale - current) > 0.001 ? nextScale : current
      );
    },
    [project],
  );

  const handleAddPhotoToFrame = useCallback(async (layerId: string) => {
    if (!project) return;
    const photos = await pickPhotos();

    if (photos.length > 0) {
      const photo = photos[0];
      updateLayer(project.id, layerId, {
        sourceUri: photo.uri,
      });
    }
  }, [project, pickPhotos, updateLayer]);

  const handleBackgrounds = useCallback(() => {
    openBackgroundPanel();
  }, [openBackgroundPanel]);

  const handleShuffle = useCallback(() => {
    if (!project) return;

    const filledLayers = project.layers.filter(
      (layer): layer is PhotoLayerType =>
        'sourceUri' in layer && !!layer.sourceUri
    );

    if (filledLayers.length < 2) {
      return;
    }

    const shuffledUris = filledLayers.map((layer) => layer.sourceUri);
    for (let i = shuffledUris.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledUris[i], shuffledUris[j]] = [shuffledUris[j], shuffledUris[i]];
    }

    updateProject(
      project.id,
      (current) => ({
        ...current,
        layers: current.layers.map((layer) => {
          if (!('sourceUri' in layer)) {
            return layer;
          }
          const index = filledLayers.findIndex((item) => item.id === layer.id);
          if (index === -1) {
            return layer;
          }
          return {
            ...layer,
            sourceUri: shuffledUris[index] ?? layer.sourceUri,
          };
        }),
      }),
      { pushHistory: true }
    );
  }, [project, updateProject]);

  const handleSticker = useCallback(() => {
    console.log('Sticker tool not implemented yet');
  }, []);

  const handleWatermark = useCallback(() => {
    console.log('Watermark tool not implemented yet');
  }, []);

  const handleFilters = useCallback(() => {
    if (selectedLayerId) {
      openFilterSheet(selectedLayerId);
    }
  }, [selectedLayerId, openFilterSheet]);

  const handleCrop = useCallback(() => {
    if (selectedLayerId) {
      openCropTool(selectedLayerId);
    }
  }, [selectedLayerId, openCropTool]);

  const handleSwap = useCallback(() => {
    if (!selectedLayerId) {
      return;
    }
    setSwapSourceLayerId((current) =>
      current === selectedLayerId ? null : selectedLayerId
    );
  }, [selectedLayerId]);

  const handleRename = useCallback(
    (name: string) => {
      if (project) {
        renameProject(project.id, name);
      }
    },
    [project, renameProject]
  );

  const handleBackgroundChange = useCallback(
    (background: string) => {
      if (project) {
        updateCanvasBackground(project.id, background);
      }
    },
    [project, updateCanvasBackground]
  );

  const handleLayerSelect = useCallback(
    (layerId: string) => {
      if (swapSourceLayerId && project) {
        if (swapSourceLayerId !== layerId) {
          updateProject(
            project.id,
            (current) => {
              const sourceLayer = current.layers.find(
                (layer): layer is PhotoLayerType =>
                  'sourceUri' in layer && layer.id === swapSourceLayerId
              );
              const targetLayer = current.layers.find(
                (layer): layer is PhotoLayerType =>
                  'sourceUri' in layer && layer.id === layerId
              );

              if (!sourceLayer || !targetLayer) {
                return current;
              }

              const nextLayers = current.layers.map((layer) => {
                if (!('sourceUri' in layer)) {
                  return layer;
                }
                if (layer.id === sourceLayer.id) {
                  return { ...layer, sourceUri: targetLayer.sourceUri };
                }
                if (layer.id === targetLayer.id) {
                  return { ...layer, sourceUri: sourceLayer.sourceUri };
                }
                return layer;
              });

              return { ...current, layers: nextLayers };
            },
            { pushHistory: true }
          );
        }

        setSwapSourceLayerId(null);
        setSelectedLayerId(layerId);
        return;
      }

      setSelectedLayerId(layerId);
    },
    [project, swapSourceLayerId, updateProject]
  );

  const handleLayerVisibilityToggle = useCallback(
    (layerId: string) => {
      if (project) {
        toggleLayerVisibility(project.id, layerId);
      }
    },
    [project, toggleLayerVisibility]
  );

  const handleLayerDuplicate = useCallback(
    (layerId: string) => {
      if (project) {
        duplicateLayer(project.id, layerId);
      }
    },
    [project, duplicateLayer]
  );

  const handleLayerResize = useCallback(
    (
      layerId: string,
      size: { width: number; height: number; x: number; y: number },
      edge: 'left' | 'right' | 'top' | 'bottom'
    ) => {
      if (!project) {
        return;
      }

      const layer = project.layers.find(
        (item): item is PhotoLayerType => 'sourceUri' in item && item.id === layerId
      );

      if (!layer) {
        return;
      }

      const EDGE_THRESHOLD = 20;

      // Find adjacent layer that shares this edge
      const adjacentLayer = project.layers.find((item): item is PhotoLayerType => {
        if (!('sourceUri' in item) || item.id === layerId) {
          return false;
        }

        const currentRight = layer.transform.x + layer.dimensions.width;
        const currentBottom = layer.transform.y + layer.dimensions.height;
        const otherRight = item.transform.x + item.dimensions.width;
        const otherBottom = item.transform.y + item.dimensions.height;

        const overlapVertical = !(
          layer.transform.y >= otherBottom ||
          currentBottom <= item.transform.y
        );
        const overlapHorizontal = !(
          layer.transform.x >= otherRight ||
          currentRight <= item.transform.x
        );

        switch (edge) {
          case 'right':
            return overlapVertical && Math.abs(currentRight - item.transform.x) < EDGE_THRESHOLD;
          case 'left':
            return overlapVertical && Math.abs(layer.transform.x - otherRight) < EDGE_THRESHOLD;
          case 'bottom':
            return overlapHorizontal && Math.abs(currentBottom - item.transform.y) < EDGE_THRESHOLD;
          case 'top':
            return overlapHorizontal && Math.abs(layer.transform.y - otherBottom) < EDGE_THRESHOLD;
          default:
            return false;
        }
      });

      // Update current layer
      updateLayer(project.id, layerId, {
        dimensions: {
          width: size.width,
          height: size.height,
        },
        transform: {
          ...layer.transform,
          x: size.x,
          y: size.y,
        },
      });

      // Update adjacent layer if found to fill the gap
      if (adjacentLayer) {
        const newRight = size.x + size.width;
        const newBottom = size.y + size.height;
        const adjacentRight = adjacentLayer.transform.x + adjacentLayer.dimensions.width;
        const adjacentBottom = adjacentLayer.transform.y + adjacentLayer.dimensions.height;

        switch (edge) {
          case 'right': {
            // Adjacent tile should start exactly where current tile ends
            const newAdjacentWidth = adjacentRight - newRight;
            if (newAdjacentWidth > MIN_DIMENSION) {
              updateLayer(project.id, adjacentLayer.id, {
                dimensions: {
                  width: newAdjacentWidth,
                  height: adjacentLayer.dimensions.height,
                },
                transform: {
                  ...adjacentLayer.transform,
                  x: newRight,
                },
              });
            }
            break;
          }
          case 'left': {
            // Adjacent tile should end exactly where current tile starts
            const newAdjacentWidth = size.x - adjacentLayer.transform.x;
            if (newAdjacentWidth > MIN_DIMENSION) {
              updateLayer(project.id, adjacentLayer.id, {
                dimensions: {
                  width: newAdjacentWidth,
                  height: adjacentLayer.dimensions.height,
                },
              });
            }
            break;
          }
          case 'bottom': {
            // Adjacent tile should start exactly where current tile ends
            const newAdjacentHeight = adjacentBottom - newBottom;
            if (newAdjacentHeight > MIN_DIMENSION) {
              updateLayer(project.id, adjacentLayer.id, {
                dimensions: {
                  width: adjacentLayer.dimensions.width,
                  height: newAdjacentHeight,
                },
                transform: {
                  ...adjacentLayer.transform,
                  y: newBottom,
                },
              });
            }
            break;
          }
          case 'top': {
            // Adjacent tile should end exactly where current tile starts
            const newAdjacentHeight = size.y - adjacentLayer.transform.y;
            if (newAdjacentHeight > MIN_DIMENSION) {
              updateLayer(project.id, adjacentLayer.id, {
                dimensions: {
                  width: adjacentLayer.dimensions.width,
                  height: newAdjacentHeight,
                },
              });
            }
            break;
          }
        }
      }
    },
    [project, updateLayer]
  );

  const handleApplyFilter = useCallback(
    (filterId: string, intensity: number) => {
      if (project && filterSheetLayerId) {
        updateLayer(project.id, filterSheetLayerId, {
          filters: [{ id: filterId, intensity }],
        });
      }
    },
    [project, filterSheetLayerId, updateLayer]
  );

  const handleApplyCrop = useCallback(
    (crop: { x: number; y: number; width: number; height: number }) => {
      if (project && cropToolLayerId) {
        const targetLayer = project.layers.find(
          (item): item is PhotoLayerType =>
            'sourceUri' in item && item.id === cropToolLayerId
        );

        updateLayer(project.id, cropToolLayerId, {
          crop: {
            ...crop,
            rotation: targetLayer?.crop?.rotation ?? 0,
          },
        });
      }
    },
    [project, cropToolLayerId, updateLayer]
  );

  const handleCanvasPress = useCallback(() => {
    setSelectedLayerId(null);
    setSwapSourceLayerId(null);
  }, []);

  if (!project) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const filterLayer = filterSheetLayerId
    ? project.layers.find(
        (layer): layer is PhotoLayerType =>
          'sourceUri' in layer && layer.id === filterSheetLayerId
      )
    : undefined;

  const cropLayer = cropToolLayerId
    ? project.layers.find(
        (layer): layer is PhotoLayerType =>
          'sourceUri' in layer && layer.id === cropToolLayerId
      )
    : undefined;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <TopToolbar
        projectName={project.name}
        onBack={handleBack}
        onUndo={undo}
        onRedo={redo}
        onExport={handleExport}
        onRename={handleRename}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />

      <View
        style={[
          styles.canvasContainer,
          {
            margin: theme.spacing(4),
            borderRadius: theme.radius.l,
            backgroundColor: project.canvas.background.value,
          },
        ]}
        onLayout={handleCanvasLayout}
      >
        <View
          style={[
            styles.canvasInner,
            {
              width: project.canvas.width * canvasScale,
              height: project.canvas.height * canvasScale,
              borderRadius: theme.radius.l,
              backgroundColor: project.canvas.background.value,
            },
          ]}
        >
          <Pressable
            style={[StyleSheet.absoluteFillObject, { zIndex: 0 }]}
            onPress={handleCanvasPress}
          />
          {project.layers
            .filter((layer): layer is import('../../types/projects').PhotoLayer =>
              'sourceUri' in layer
            )
            .map((layer) =>
              layer.sourceUri ? (
                <PhotoLayer
                  key={layer.id}
                  layer={layer}
                  isSelected={selectedLayerId === layer.id}
                  onSelect={handleLayerSelect}
                  onTransformUpdate={handleLayerTransformUpdate}
                  onResize={handleLayerResize}
                  onDelete={handleLayerDelete}
                  viewportScale={canvasScale}
                  isSwapSource={swapSourceLayerId === layer.id}
                  isSwapModeActive={!!swapSourceLayerId}
                />
              ) : (
                <EmptyFrame
                  key={layer.id}
                  layer={layer}
                  viewportScale={canvasScale}
                  onPress={handleAddPhotoToFrame}
                />
              )
            )}
        </View>
      </View>

      <BottomControlBar
        selectedLayerId={selectedLayerId}
        onBackgrounds={handleBackgrounds}
        onShuffle={handleShuffle}
        onSticker={handleSticker}
        onWatermark={handleWatermark}
        onCrop={handleCrop}
        onFilters={handleFilters}
        onSwap={handleSwap}
        onDelete={handleLayerDelete}
      />

      <BackgroundPanel
        isVisible={backgroundPanelOpen}
        onClose={closeBackgroundPanel}
        currentBackground={project.canvas.background.value}
        onBackgroundChange={handleBackgroundChange}
      />

      <LayersPanel
        isVisible={layersPanelOpen}
        onClose={closeLayersPanel}
        layers={project.layers.filter((layer): layer is PhotoLayerType =>
          'sourceUri' in layer
        )}
        selectedLayerId={selectedLayerId}
        onLayerSelect={handleLayerSelect}
        onLayerVisibilityToggle={handleLayerVisibilityToggle}
        onLayerLockToggle={() => {}}
        onLayerDelete={(layerId) => deleteLayer(project.id, layerId)}
        onLayerDuplicate={handleLayerDuplicate}
        onLayerReorder={() => {}}
      />

      {filterSheetLayerId && (
        <FilterSheet
          isVisible={!!filterSheetLayerId}
          onClose={closeFilterSheet}
          currentFilter={filterLayer?.filters[0]?.id || 'none'}
          onApplyFilter={handleApplyFilter}
          photoUri={filterLayer?.sourceUri || ''}
          isPremium={false}
        />
      )}

      {cropToolLayerId && (
        <CropTool
          isVisible={!!cropToolLayerId}
          onClose={closeCropTool}
          photoUri={cropLayer?.sourceUri || ''}
          currentCrop={cropLayer?.crop}
          onApplyCrop={handleApplyCrop}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasInner: {
    position: 'relative',
    overflow: 'hidden',
  },
});
