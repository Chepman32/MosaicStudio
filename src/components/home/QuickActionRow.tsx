import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useNavigation } from '../../navigation/NavigationContext';
import { useProjectStore } from '../../stores/useProjectStore';
import { useUIStore } from '../../stores/useUIStore';
import { useTheme } from '../../theme/ThemeContext';
import type { CollageProject } from '../../types/projects';

const QUICK_ACTIONS = [
  {
    id: 'blank',
    title: 'Blank Canvas',
    subtitle: 'Start from scratch',
    gradient: ['#A8C5FF', '#C5A8FF'],
    onPress: 'blank',
  },
  {
    id: 'template',
    title: 'From Template',
    subtitle: 'Browse curated layouts',
    gradient: ['#FFB8A8', '#FFA8D8'],
    onPress: 'template',
  },
  {
    id: 'ai',
    title: 'AI Arrange',
    subtitle: 'Premium feature',
    gradient: ['#FFD700', '#FFAA00'],
    onPress: 'ai',
  },
] as const;

export const QuickActionRow: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const createBlank = useProjectStore((state) => state.createBlankProject);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const setTemplateDrawer = useUIStore((state) => state.setTemplateDrawer);
  const openPremiumSheet = useUIStore((state) => state.openPremiumSheet);

  const handlePress = (actionId: (typeof QUICK_ACTIONS)[number]['onPress']) => {
    switch (actionId) {
      case 'blank': {
        const project = createBlankProject(createBlank, setCurrentProject);
        navigation.navigate({ route: 'editor', projectId: project.id });
        break;
      }
      case 'template': {
        setTemplateDrawer({ isOpen: true });
        break;
      }
      case 'ai': {
        openPremiumSheet('aiArrange');
        break;
      }
      default:
        break;
    }
  };

  return (
    <View style={{ paddingVertical: theme.spacing(6) }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing(5),
          gap: theme.spacing(4),
        }}
      >
        {QUICK_ACTIONS.map((action, index) => (
          <Animated.View
            key={action.id}
            entering={FadeInDown.delay(index * 50)}
            style={[
              styles.card,
              styles.cardStatic,
              {
                padding: theme.spacing(4),
                borderRadius: theme.radius.xxl,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handlePress(action.onPress)}
              style={styles.cardContent}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.colors.textPrimary, marginBottom: theme.spacing(1) },
                ]}
              >
                {action.title}
              </Text>
              <Text
                style={[
                  styles.cardSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {action.subtitle}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const createBlankProject = (
  create: (name: string) => CollageProject,
  setCurrent: (id: string | null) => void,
): CollageProject => {
  const project = create(`Collage ${new Date().toLocaleDateString()}`);
  setCurrent(project.id);
  return project;
};

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardStatic: {
    width: 200,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 14,
  },
});
