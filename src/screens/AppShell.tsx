import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { TemplateDrawer } from '../components/overlays/TemplateDrawer';
import { PremiumSheet } from '../components/overlays/PremiumSheet';
import { ExportModal } from '../components/overlays/ExportModal';
import { useNavigation } from '../navigation/NavigationContext';
import { useProjectStore } from '../stores/useProjectStore';
import { useUIStore } from '../stores/useUIStore';
import { useTheme } from '../theme/ThemeContext';
import { EditorScreen } from './Editor/EditorScreen';
import { HomeScreen } from './Home/HomeScreen';
import { LibraryScreen } from './Library/LibraryScreen';
import { SettingsScreen } from './Settings/SettingsScreen';

export const AppShell: React.FC = () => {
  const theme = useTheme();
  const { activeRoute } = useNavigation();
  const templateDrawer = useUIStore((state) => state.templateDrawer);
  const setTemplateDrawer = useUIStore((state) => state.setTemplateDrawer);
  const premiumSheetFeature = useUIStore((state) => state.premiumSheetFeature);
  const closePremiumSheet = useUIStore((state) => state.closePremiumSheet);
  const exportModalProjectId = useUIStore((state) => state.exportModalProjectId);
  const closeExportModal = useUIStore((state) => state.closeExportModal);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  useEffect(() => {
    if (activeRoute.route === 'editor' && activeRoute.projectId) {
      setCurrentProject(activeRoute.projectId);
    }
  }, [activeRoute, setCurrentProject]);

  const renderActiveRoute = () => {
    switch (activeRoute.route) {
      case 'home':
        return <HomeScreen />;
      case 'editor':
        return (
          <EditorScreen
            projectId={activeRoute.projectId ?? null}
            templateId={activeRoute.templateId ?? null}
          />
        );
      case 'library':
        return <LibraryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderActiveRoute()}
      <TemplateDrawer
        isVisible={templateDrawer.isOpen}
        onClose={() => setTemplateDrawer({ isOpen: false })}
      />
      <PremiumSheet
        isVisible={!!premiumSheetFeature}
        onClose={closePremiumSheet}
        feature={premiumSheetFeature}
      />
      <ExportModal projectId={exportModalProjectId} onClose={closeExportModal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
