import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SAMPLE_TEMPLATES } from '../../constants/templates';
import { useNavigation } from '../../navigation/NavigationContext';
import { useProjectStore } from '../../stores/useProjectStore';
import { useTheme } from '../../theme/ThemeContext';
import { DraggablePhoto } from '../../components/gestures/DraggablePhoto';
interface EditorScreenProps {
  projectId: string | null;
  templateId: string | null;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  projectId,
  templateId,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const project = useProjectStore((state) =>
    projectId ? state.projects[projectId] : null,
  );
  const createFromTemplate = useProjectStore(
    (state) => state.createFromTemplate,
  );
  const createBlank = useProjectStore((state) => state.createBlankProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

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

  if (!project) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.textSecondary }}>Loading editor…</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          padding: theme.spacing(6),
        },
      ]}
    >
      <Text
        style={[
          styles.heading,
          { color: theme.colors.textPrimary, marginBottom: theme.spacing(4) },
        ]}
      >
        Editor placeholder for {project.name}
      </Text>
      <View
        style={[
          styles.canvasPlaceholder,
          {
            borderRadius: theme.radius.l,
          },
        ]}
      >
        <Text style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing(4) }}>
          Canvas will render here.
        </Text>
        <DraggablePhoto uri="https://picsum.photos/200" size={120} />
      </View>
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
  heading: {
    fontSize: 22,
    fontWeight: '600',
  },
  canvasPlaceholder: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
