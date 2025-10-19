import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  LayoutChangeEvent,
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
  const addLayer = useProjectStore((state) => state.addLayer);
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
  const setTemplateDrawer = useUIStore((state) => state.setTemplateDrawer);
  const openExportModal = useUIStore((state) => state.openExportModal);
  const backgroundPanelOpen = useUIStore((state) => state.backgroundPanelOpen);
  const layersPanelOpen = useUIStore((state) => state.layersPanelOpen);
  const filterSheetLayerId = useUIStore((state) => state.filterSheetLayerId);
  const cropToolLayerId = useUIStore((state) => state.cropToolLayerId);
  const openBackgroundPanel = useUIStore((state) => state.openBackgroundPanel);
  const closeBackgroundPanel = useUIStore((state) => state.closeBackgroundPanel);
  const openLayersPanel = useUIStore((state) => state.openLayersPanel);
  const closeLayersPanel = useUIStore((state) => state.closeLayersPanel);
  const openFilterSheet = useUIStore((state) => state.openFilterSheet);
  const closeFilterSheet = useUIStore((state) => state.closeFilterSheet);
  const openCropTool = useUIStore((state) => state.openCropTool);
  const closeCropTool = useUIStore((state) => state.closeCropTool);

  const { pickPhotos } = usePhotoPicker();

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
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

  const handleTemplates = useCallback(() => {
    setTemplateDrawer({ isOpen: true });
  }, [setTemplateDrawer]);

  const handleBackgrounds = useCallback(() => {
    openBackgroundPanel();
  }, [openBackgroundPanel]);

  const handleLayers = useCallback(() => {
    openLayersPanel();
  }, [openLayersPanel]);

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

  const handleFlip = useCallback(() => {
    if (project && selectedLayerId) {
      const layer = project.layers.find((l) => l.id === selectedLayerId);
      if (layer) {
        updateLayer(project.id, selectedLayerId, {
          transform: {
            ...layer.transform,
            scale: -layer.transform.scale,
          },
        });
      }
    }
  }, [project, selectedLayerId, updateLayer]);

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
      setSelectedLayerId(layerId);
    },
    []
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
        updateLayer(project.id, cropToolLayerId, { crop });
      }
    },
    [project, cropToolLayerId, updateLayer]
  );

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
                  onSelect={setSelectedLayerId}
                  onTransformUpdate={handleLayerTransformUpdate}
                  onDelete={handleLayerDelete}
                  viewportScale={canvasScale}
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
        onTemplates={handleTemplates}
        onBackgrounds={handleBackgrounds}
        onLayers={handleLayers}
        onFilters={handleFilters}
        onCrop={handleCrop}
        onFlip={handleFlip}
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
          currentFilter={
            project.layers.find((l) => l.id === filterSheetLayerId)?.filters[0]?.id || 'none'
          }
          onApplyFilter={handleApplyFilter}
          photoUri={
            project.layers.find((l) => l.id === filterSheetLayerId)?.sourceUri || ''
          }
          isPremium={false}
        />
      )}

      {cropToolLayerId && (
        <CropTool
          isVisible={!!cropToolLayerId}
          onClose={closeCropTool}
          photoUri={
            project.layers.find((l) => l.id === cropToolLayerId)?.sourceUri || ''
          }
          currentCrop={
            project.layers.find((l) => l.id === cropToolLayerId)?.crop
          }
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
