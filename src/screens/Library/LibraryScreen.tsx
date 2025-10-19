import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '../../navigation/NavigationContext';
import { useProjectStore } from '../../stores/useProjectStore';
import { useTheme } from '../../theme/ThemeContext';

export const LibraryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const projects = useProjectStore((state) =>
    Object.values(state.projects).sort((a, b) => b.modifiedAt - a.modifiedAt),
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={{
          paddingTop: theme.spacing(12),
          paddingHorizontal: theme.spacing(5),
          marginBottom: theme.spacing(4),
        }}
      >
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Library
        </Text>
        <Text style={{ color: theme.colors.textSecondary }}>
          {projects.length} collages stored locally
        </Text>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: theme.spacing(4), paddingBottom: theme.spacing(10) }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate({ route: 'editor', projectId: item.id })}
            style={[
              styles.item,
              {
                padding: theme.spacing(4),
                marginBottom: theme.spacing(3),
                borderRadius: theme.radius.l,
              },
            ]}
          >
            <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>
              {item.name}
            </Text>
            <Text style={{ color: theme.colors.textSecondary }}>
              Updated {new Date(item.modifiedAt).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
  },
  item: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemTitle: {
    fontSize: 18,
  },
});
