import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeContext';
import { QuickActionRow } from '../../components/home/QuickActionRow';
import { RecentProjectsGrid } from '../../components/home/RecentProjectsGrid';
import { TemplatePreviewRow } from '../../components/home/TemplatePreviewRow';
import { ProjectsEditModal } from '../../components/overlays/ProjectsEditModal';
import { useProjectStore } from '../../stores/useProjectStore';

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const projectMap = useProjectStore((state) => state.projects);
  const removeProject = useProjectStore((state) => state.removeProject);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const projects = React.useMemo(
    () => Object.values(projectMap).sort((a, b) => b.modifiedAt - a.modifiedAt),
    [projectMap],
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={{
          paddingHorizontal: theme.spacing(5),
          paddingTop: theme.spacing(10),
        }}
      >
        <Text
          style={[
            styles.subtitle,
            { color: theme.colors.textSecondary, marginBottom: theme.spacing(2) },
          ]}
        >
          Welcome back
        </Text>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Mosaic Studio
        </Text>
      </Animated.View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: theme.spacing(20),
        }}
      >
        <QuickActionRow />
        <RecentProjectsGrid
          projects={projects}
          onEditPress={() => setIsEditModalOpen(true)}
        />
        <TemplatePreviewRow />
      </ScrollView>

      <ProjectsEditModal
        isVisible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        projects={projects}
        onDeleteProject={removeProject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
});
