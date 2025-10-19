import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import type { CollageProject } from '../../types/projects';

interface RecentProjectsGridProps {
  projects: CollageProject[];
}

export const RecentProjectsGrid: React.FC<RecentProjectsGridProps> = ({
  projects,
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
        <View
          style={[
            styles.thumbnail,
            {
              borderRadius: theme.radius.l,
              marginBottom: theme.spacing(3),
            },
          ]}
        >
          <Text style={{ color: theme.colors.textSecondary }}>Thumbnail</Text>
        </View>
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
      <View style={{ paddingHorizontal: theme.spacing(5), marginBottom: theme.spacing(3) }}>
        <Text
          style={[
            styles.header,
            { color: theme.colors.textPrimary },
          ]}
        >
          Your Projects
        </Text>
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
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
  },
});
