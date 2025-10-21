import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

import { SAMPLE_TEMPLATES } from '../../constants/templates';
import { useNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { useUIStore } from '../../stores/useUIStore';
import { usePurchaseStore } from '../../stores/usePurchaseStore';
import { TemplateLayoutPreview } from '../templates/TemplateLayoutPreview';

export const TemplatePreviewRow: React.FC = () => {
  const theme = useTheme();
  const openTemplateDrawer = useUIStore((state) => state.setTemplateDrawer);
  const openPremiumSheet = useUIStore((state) => state.openPremiumSheet);
  const navigate = useNavigation();
  const isPremiumUnlocked = usePurchaseStore((state) =>
    state.isUnlocked('premiumTemplates'),
  );

  const handleTemplatePress = (templateId: string, isPremium: boolean) => {
    if (isPremium && !isPremiumUnlocked) {
      openPremiumSheet('premiumTemplates');
      return;
    }
    navigate.navigate({ route: 'editor', templateId, projectId: undefined });
  };

  return (
    <View style={{ paddingVertical: theme.spacing(6) }}>
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing(5),
            marginBottom: theme.spacing(3),
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: theme.colors.textPrimary },
          ]}
        >
          Popular Templates
        </Text>
        <TouchableOpacity
          onPress={() => openTemplateDrawer({ isOpen: true, category: 'all' })}
          accessibilityRole="button"
        >
          <Text style={{ color: theme.colors.accent }}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing(5),
          gap: theme.spacing(4),
        }}
      >
        {SAMPLE_TEMPLATES.map((template, index) => (
          <Animated.View
            key={template.id}
            entering={FadeInRight.delay(index * 80)}
            style={[
              styles.card,
              styles.cardDimensions,
              {
                borderRadius: theme.radius.l,
                padding: theme.spacing(3),
              },
            ]}
          >
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.cardContent}
              onPress={() => handleTemplatePress(template.id, template.isPremium)}
            >
              <View
                style={[
                  styles.previewContainer,
                  {
                    borderRadius: theme.radius.m,
                    marginBottom: theme.spacing(3),
                  },
                ]}
              >
                <TemplateLayoutPreview
                  template={template}
                  useAspectRatio={false}
                  style={{ flex: 1, width: '100%' }}
                  borderRadius={theme.radius.m}
                />
              </View>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {template.name}
              </Text>
              {template.isPremium && !isPremiumUnlocked ? (
                <Text
                  style={[
                    styles.premiumBadge,
                    { color: theme.colors.accentSecondary },
                  ]}
                >
                  Premium
                </Text>
              ) : null}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'space-between',
  },
  cardDimensions: {
    width: 180,
    height: 240,
  },
  cardContent: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBadge: {
    marginTop: 4,
  },
});
