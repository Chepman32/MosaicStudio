import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../theme/ThemeContext';
import type { CollageProject } from '../../types/projects';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.8;

interface ProjectsEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  projects: CollageProject[];
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsEditModal: React.FC<ProjectsEditModalProps> = ({
  isVisible,
  onClose,
  projects,
  onDeleteProject,
}) => {
  const theme = useTheme();
  const translateY = useSharedValue(MODAL_HEIGHT);

  React.useEffect(() => {
    translateY.value = isVisible ? withSpring(0) : withTiming(MODAL_HEIGHT);
  }, [isVisible, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleDelete = (project: CollageProject) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteProject(project.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: CollageProject }) => (
    <View
      style={[
        styles.projectItem,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: `${theme.colors.textTertiary}40`,
        },
      ]}
    >
      <View style={styles.projectInfo}>
        <Text style={[styles.projectName, { color: theme.colors.textPrimary }]}>
          {item.name}
        </Text>
        <Text style={[styles.projectDate, { color: theme.colors.textSecondary }]}>
          Updated {new Date(item.modifiedAt).toLocaleDateString()}
        </Text>
      </View>
      <Pressable
        style={[styles.deleteButton, { backgroundColor: `${theme.colors.error}20` }]}
        onPress={() => handleDelete(item)}
      >
        <Text style={[styles.deleteText, { color: theme.colors.error }]}>Delete</Text>
      </Pressable>
    </View>
  );

  if (!isVisible) {
    return null;
  }

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.modal,
              {
                backgroundColor: theme.colors.background,
                height: MODAL_HEIGHT,
              },
              animatedStyle,
            ]}
          >
            <View
              style={[
                styles.handle,
                { backgroundColor: theme.colors.textTertiary },
              ]}
            />

            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.textPrimary,
                  },
                ]}
              >
                Edit Projects
              </Text>
              <Pressable onPress={onClose} style={styles.doneButton}>
                <Text style={[styles.doneText, { color: theme.colors.primary }]}>
                  Done
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={projects}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                    No projects yet
                  </Text>
                </View>
              }
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  doneButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 32,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectDate: {
    fontSize: 14,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});
