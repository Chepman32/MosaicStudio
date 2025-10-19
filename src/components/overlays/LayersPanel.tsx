import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../theme/ThemeContext';
import type { PhotoLayer } from '../../types/projects';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.6;

interface LayersPanelProps {
  isVisible: boolean;
  onClose: () => void;
  layers: PhotoLayer[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityToggle: (layerId: string) => void;
  onLayerLockToggle: (layerId: string) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerReorder: (layerId: string, newIndex: number) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  isVisible,
  onClose,
  layers,
  selectedLayerId,
  onLayerSelect,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  onLayerDelete,
  onLayerDuplicate,
  onLayerReorder,
}) => {
  const theme = useTheme();
  const translateY = useSharedValue(PANEL_HEIGHT);

  React.useEffect(() => {
    translateY.value = isVisible ? withSpring(0) : withTiming(PANEL_HEIGHT);
  }, [isVisible, translateY]);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        onClose();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Sort layers by z-index (reverse order for display - top layer first)
  const sortedLayers = React.useMemo(() => {
    return [...layers].sort((a, b) => b.zIndex - a.zIndex);
  }, [layers]);

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
              styles.panel,
              {
                backgroundColor: theme.colors.surface,
                height: PANEL_HEIGHT,
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

            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.textPrimary,
                  paddingHorizontal: theme.spacing(4),
                  marginBottom: theme.spacing(4),
                },
              ]}
            >
              Layers
            </Text>

            <ScrollView
              style={styles.layersList}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {sortedLayers.map((layer, index) => (
                <LayerRow
                  key={layer.id}
                  layer={layer}
                  isSelected={selectedLayerId === layer.id}
                  onSelect={() => onLayerSelect(layer.id)}
                  onVisibilityToggle={() => onLayerVisibilityToggle(layer.id)}
                  onLockToggle={() => onLayerLockToggle(layer.id)}
                  onDelete={() => onLayerDelete(layer.id)}
                  onDuplicate={() => onLayerDuplicate(layer.id)}
                />
              ))}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

interface LayerRowProps {
  layer: PhotoLayer;
  isSelected: boolean;
  onSelect: () => void;
  onVisibilityToggle: () => void;
  onLockToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const LayerRow: React.FC<LayerRowProps> = ({
  layer,
  isSelected,
  onSelect,
  onVisibilityToggle,
  onLockToggle,
  onDelete,
  onDuplicate,
}) => {
  const theme = useTheme();
  const [showActions, setShowActions] = React.useState(false);

  return (
    <View>
      <Pressable
        onPress={onSelect}
        onLongPress={() => setShowActions(!showActions)}
        style={[
          styles.layerRow,
          {
            backgroundColor: isSelected
              ? `${theme.colors.primary}22`
              : theme.colors.backgroundAlt,
            borderColor: isSelected ? theme.colors.primary : 'transparent',
            marginHorizontal: theme.spacing(4),
            marginBottom: theme.spacing(2),
            borderRadius: theme.radius.m,
          },
        ]}
      >
        <Image
          source={{ uri: layer.sourceUri }}
          style={[styles.thumbnail, { borderRadius: theme.radius.s }]}
        />

        <View style={styles.layerInfo}>
          <Text
            style={[
              styles.layerName,
              { color: theme.colors.textPrimary },
            ]}
          >
            Layer {layer.zIndex + 1}
          </Text>
          <Text
            style={[
              styles.layerMeta,
              { color: theme.colors.textSecondary },
            ]}
          >
            {Math.round(layer.dimensions.width)} × {Math.round(layer.dimensions.height)}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={onVisibilityToggle} style={styles.controlButton}>
            <Text style={{ fontSize: 20 }}>
              {layer.opacity > 0 ? '👁' : '👁‍🗨'}
            </Text>
          </Pressable>
          <Pressable onPress={onLockToggle} style={styles.controlButton}>
            <Text style={{ fontSize: 20 }}>
              {/* Assuming we add a locked field to PhotoLayer */}
              🔓
            </Text>
          </Pressable>
        </View>
      </Pressable>

      {showActions && (
        <View
          style={[
            styles.actionsRow,
            {
              backgroundColor: theme.colors.surface,
              marginHorizontal: theme.spacing(4),
              marginBottom: theme.spacing(2),
              borderRadius: theme.radius.m,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              onDuplicate();
              setShowActions(false);
            }}
            style={styles.actionButton}
          >
            <Text style={{ color: theme.colors.textPrimary }}>Duplicate</Text>
          </Pressable>
          <View style={[styles.divider, { backgroundColor: theme.colors.textTertiary }]} />
          <Pressable
            onPress={() => {
              onDelete();
              setShowActions(false);
            }}
            style={styles.actionButton}
          >
            <Text style={{ color: theme.colors.error }}>Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
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
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  layersList: {
    flex: 1,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 2,
  },
  thumbnail: {
    width: 64,
    height: 64,
    backgroundColor: '#333',
  },
  layerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  layerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  layerMeta: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  divider: {
    width: 1,
    height: '60%',
  },
});
