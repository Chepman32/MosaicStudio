import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useProjectStore } from '../../stores/useProjectStore';
import { useTheme } from '../../theme/ThemeContext';
import type { ExportOptions } from '../../types/projects';

interface ExportModalProps {
  projectId: string | null;
  onClose: () => void;
}

const DEFAULT_OPTIONS: ExportOptions = {
  quality: 'high',
  format: 'jpg',
  includeWatermark: true,
};

export const ExportModal: React.FC<ExportModalProps> = ({ projectId, onClose }) => {
  const theme = useTheme();
  const applyExport = useProjectStore((state) => state.applyExport);

  if (!projectId) {
    return null;
  }

  const handleExport = () => {
    applyExport(projectId, DEFAULT_OPTIONS);
    onClose();
  };

  return (
    <Modal visible={!!projectId} animationType="fade" transparent onRequestClose={onClose}>
      <View
        style={[
          styles.backdrop,
          { padding: theme.spacing(5) },
        ]}
      >
        <View
          style={[
            styles.modal,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.xl,
              padding: theme.spacing(6),
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing(3),
              },
            ]}
          >
            Export Collage
          </Text>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing(6) }}>
            Exports are saved to your device.
          </Text>
          <TouchableOpacity
            onPress={handleExport}
            style={[
              styles.primaryButton,
              {
                paddingVertical: theme.spacing(4),
                backgroundColor: theme.colors.accent,
                borderRadius: theme.radius.l,
              },
            ]}
          >
            <Text
              style={[
                styles.primaryButtonLabel,
                { color: theme.colors.textPrimary },
              ]}
            >
              Export
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: theme.spacing(4) }}>
            <Text
              style={[
                styles.secondaryActionLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  primaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonLabel: {
    textAlign: 'center',
    fontWeight: '600',
  },
  secondaryActionLabel: {
    textAlign: 'center',
  },
});
