import { PRODUCT_CATALOG } from './ProductCatalog';
import { usePurchaseStore } from '../../stores/usePurchaseStore';

export class PurchaseManager {
  static async restore(): Promise<void> {
    // Placeholder: integrate with react-native-iap
    const setEntitlements = usePurchaseStore.getState().setEntitlements;
    setEntitlements({
      entitlements: {
        premiumTemplates: true,
        premiumFilters: true,
        aiArrange: true,
        pdfExport: true,
        watermarkToggle: true,
        cloudBackup: true,
      },
      subscriptionProductId: PRODUCT_CATALOG[0].id,
    });
  }
}
