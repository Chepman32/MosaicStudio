import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { usePurchaseStore } from '../../stores/usePurchaseStore';
import { useTheme } from '../../theme/ThemeContext';
import { useUIStore } from '../../stores/useUIStore';

const SETTINGS_SECTIONS = [
  {
    title: 'Premium',
    items: [
      { id: 'restore', label: 'Restore Purchases', action: 'restore' },
      { id: 'upgrade', label: 'Upgrade to Premium', action: 'upgrade' },
    ],
  },
  {
    title: 'Editor',
    items: [
      { id: 'canvas', label: 'Default Canvas Size', action: 'canvas' },
      { id: 'snap', label: 'Snap to Grid', action: 'snap' },
    ],
  },
] as const;

export const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const openPremiumSheet = useUIStore((state) => state.openPremiumSheet);
  const isPremium = usePurchaseStore((state) =>
    Object.values(state.activeEntitlements).some(Boolean),
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing(5) }}>
        <Text
          style={[
            styles.title,
            { color: theme.colors.textPrimary, marginBottom: theme.spacing(4) },
          ]}
        >
          Settings
        </Text>
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: theme.spacing(6) }}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary, marginBottom: theme.spacing(2) },
              ]}
            >
              {section.title}
            </Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  if (item.action === 'upgrade') {
                    openPremiumSheet('premium');
                  }
                }}
                style={[
                  styles.item,
                  {
                    padding: theme.spacing(4),
                    borderRadius: theme.radius.l,
                    marginBottom: theme.spacing(2),
                  },
                ]}
              >
                <Text style={[styles.itemLabel, { color: theme.colors.textPrimary }]}>
                  {item.label}
                </Text>
                {item.id === 'upgrade' ? (
                  <Text style={{ color: theme.colors.textSecondary }}>
                    {isPremium ? 'You are premium' : 'Unlock all features'}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
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
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  item: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemLabel: {
    fontSize: 16,
  },
});
