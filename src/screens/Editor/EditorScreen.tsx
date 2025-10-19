import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator } from 'react-native';

import { SAMPLE_TEMPLATES } from '../../constants/templates';
import { useNavigation } from '../../navigation/NavigationContext';
import { useProjectStore } from '../../stores/useProjectStore';
import { useTheme } from '../../theme/ThemeContext';
import { useUIStore } from '../../stores/useUIStore';
import { TopToolbar } from '../../components/editor/TopToolbar';
import { BottomControlBar } from '../../components/editor/BottomControlBar';
import { PhotoLayer } from '../../components/canvas/PhotoLayer';
import type { PhotoLayer as PhotoLayerType } from '../../types/projects';

interface EditorScreenProps {
  projectId: string | null;
  templateId: string | null;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_WIDTH = SCREEN_WIDTH - 32;
const CANVAS_HEIGHT = SCREEN_HEIGHT - 300;

export const EditorScreen: React.FC<EditorScreenProps> = ({
  projectId,
  templateId,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const project = useProjectStore((state) =>
    projectId ? state.projects[projectId] : null,
  );
  const updateLayer = useProjectStore((state) => state.updateLayer);
  const deleteLayer = useProjectStore((state) => state.deleteLayer);
  const renameProject = useProjectStore((state) => state.renameProject);
  const createFromTemplate = useProjectStore(
    (state) => state.createFromTemplate,
  );
  const createBlank = useProjectStore((state) => state.createBlankProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const setTemplateDrawer = useUIStore((state) => state.setTemplateDrawer);
  const openExportModal = useUIStore((state) => state.openExportModal);

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

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

  const handleAddPhotos = useCallback(() => {
    // Will be implemented with PhotoPicker
    console.log('Add photos');
  }, []);

  const handleTemplates = useCallback(() => {
    setTemplateDrawer({ isOpen: true });
  }, [setTemplateDrawer]);

  const handleBackgrounds = useCallback(() => {
    // Will be implemented with BackgroundPanel
    console.log('Backgrounds');
  }, []);

  const handleLayers = useCallback(() => {
    // Will be implemented with LayersPanel
    console.log('Layers');
  }, []);

  const handleFilters = useCallback(() => {
    // Will be implemented with FilterSheet
    console.log('Filters');
  }, []);

  const handleCrop = useCallback(() => {
    // Will be implemented with CropTool
    console.log('Crop');
  }, []);

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
        onExport={handleExport}
        onRename={handleRename}
      />

      <View
        style={[
          styles.canvasContainer,
          {
            backgroundColor: project.canvas.background.value,
            margin: theme.spacing(4),
            borderRadius: theme.radius.l,
          },
        ]}
      >
        {project.layers
          .filter((layer): layer is import('../../types/projects').PhotoLayer =>
            'sourceUri' in layer
          )
          .map((layer) => (
            <PhotoLayer
              key={layer.id}
              layer={layer}
              isSelected={selectedLayerId === layer.id}
              onSelect={setSelectedLayerId}
              onTransformUpdate={handleLayerTransformUpdate}
              onDelete={handleLayerDelete}
            />
          ))}
      </View>

      <BottomControlBar
        selectedLayerId={selectedLayerId}
        onAddPhotos={handleAddPhotos}
        onTemplates={handleTemplates}
        onBackgrounds={handleBackgrounds}
        onLayers={handleLayers}
        onFilters={handleFilters}
        onCrop={handleCrop}
        onFlip={handleFlip}
        onDelete={handleLayerDelete}
      />
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
    overflow: 'hidden',
  },
});
