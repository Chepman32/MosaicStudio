import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import type { CollageProject } from '../../types/projects';
import { ProjectPreview } from '../projects/ProjectPreview';

interface RecentProjectsGridProps {
  projects: CollageProject[];
  onEditPress?: () => void;
}

export const RecentProjectsGrid: React.FC<RecentProjectsGridProps> = ({
  projects,
  onEditPress,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const renderItem = ({ item, index }: { item: CollageProject; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index * 50)}
      style={[
        styles.card,
        {
          margin: theme.spacing(2),
          borderRadius: theme.radius.xl,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate({ route: 'editor', projectId: item.id })}
        accessibilityRole="button"
        style={{ padding: theme.spacing(4) }}
      >
        <ProjectPreview
          project={item}
          borderRadius={theme.radius.l}
          style={[
            styles.thumbnail,
            {
              borderRadius: theme.radius.l,
              marginBottom: theme.spacing(3),
            },
          ]}
        />
        <Text
          style={[
            styles.projectName,
            { color: theme.colors.textPrimary },
          ]}
        >
          {item.name}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: theme.spacing(1) }}>
          Updated {new Date(item.modifiedAt).toLocaleString()}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (!projects.length) {
    return null;
  }

  return (
    <View style={{ paddingVertical: theme.spacing(4) }}>
      <View style={[
        styles.headerContainer,
        { paddingHorizontal: theme.spacing(5), marginBottom: theme.spacing(3) }
      ]}>
        <Text
          style={[
            styles.header,
            { color: theme.colors.textPrimary },
          ]}
        >
          Your Projects
        </Text>
        {onEditPress && (
          <TouchableOpacity onPress={onEditPress} style={styles.editButton}>
            <Text style={[styles.editText, { color: theme.colors.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={projects}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: theme.spacing(3) }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
  },
});
