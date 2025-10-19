import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SAMPLE_TEMPLATES } from '../../constants/templates';
import { useProjectStore } from '../../stores/useProjectStore';
import { useTheme } from '../../theme/ThemeContext';

interface TemplateDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TemplateDrawer: React.FC<TemplateDrawerProps> = ({
  isVisible,
  onClose,
}) => {
  const theme = useTheme();
  const createFromTemplate = useProjectStore(
    (state) => state.createFromTemplate,
  );
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);
  const handleSelect = (templateId: string) => {
    const template = SAMPLE_TEMPLATES.find((item) => item.id === templateId);
    if (!template) return;
    const project = createFromTemplate(template);
    setCurrentProject(project.id);
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              padding: theme.spacing(5),
              borderTopLeftRadius: theme.radius.xxl,
              borderTopRightRadius: theme.radius.xxl,
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              { marginBottom: theme.spacing(4) },
            ]}
          />
          {SAMPLE_TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              onPress={() => handleSelect(template.id)}
              style={{ marginBottom: theme.spacing(4) }}
            >
              <Text style={[styles.templateName, { color: theme.colors.textPrimary }]}>
                {template.name}
              </Text>
              <Text style={{ color: theme.colors.textSecondary }}>
                {template.category}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeLabel, { color: theme.colors.textSecondary }]}>
              Close
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    maxHeight: '70%',
  },
  handle: {
    height: 4,
    width: 36,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
  templateName: {
    fontSize: 18,
  },
  closeLabel: {
    textAlign: 'center',
  },
});
