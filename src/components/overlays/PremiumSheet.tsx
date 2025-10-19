import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { usePurchaseStore } from '../../stores/usePurchaseStore';
import { useTheme } from '../../theme/ThemeContext';

interface PremiumSheetProps {
  isVisible: boolean;
  onClose: () => void;
  feature: string | null;
}

export const PremiumSheet: React.FC<PremiumSheetProps> = ({
  isVisible,
  onClose,
  feature,
}) => {
  const theme = useTheme();
  const setEntitlements = usePurchaseStore((state) => state.setEntitlements);

  const handleSubscribe = () => {
    setEntitlements({
      entitlements: {
        premiumTemplates: true,
        premiumFilters: true,
        aiArrange: true,
        pdfExport: true,
        watermarkToggle: true,
        cloudBackup: true,
      },
      subscriptionProductId: 'com.mosaicstudio.premium.yearly',
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View
        style={styles.backdrop}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: theme.radius.xxl,
              borderTopRightRadius: theme.radius.xxl,
              padding: theme.spacing(6),
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
            ]}
          >
            Unlock Premium
          </Text>
          {feature ? (
            <Text
              style={{
                color: theme.colors.textSecondary,
                marginTop: theme.spacing(2),
              }}
            >
              Access {feature}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={handleSubscribe}
            style={[
              styles.primaryButton,
              {
                marginTop: theme.spacing(6),
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
              Subscribe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: theme.spacing(4) }}>
            <Text
              style={[
                styles.dismissLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Not now
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {},
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  primaryButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonLabel: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissLabel: {
    textAlign: 'center',
  },
});
