import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
  getAvailablePurchases,
  type Product,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { Platform } from 'react-native';
import { PRODUCT_CATALOG } from './ProductCatalog';
import { usePurchaseStore } from '../../stores/usePurchaseStore';

export class PurchaseManager {
  private static isInitialized = false;
  private static purchaseUpdateSubscription: any;
  private static purchaseErrorSubscription: any;

  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await initConnection();
      this.isInitialized = true;

      // Set up purchase listeners
      this.purchaseUpdateSubscription = purchaseUpdatedListener(
        async (purchase: Purchase) => {
          const receipt = purchase.transactionId;
          if (receipt) {
            try {
              // Verify purchase with Apple/Google
              await this.handlePurchaseUpdate(purchase);
              // Finish the transaction
              await finishTransaction({ purchase, isConsumable: false });
            } catch (error) {
              console.error('Error handling purchase:', error);
            }
          }
        }
      );

      this.purchaseErrorSubscription = purchaseErrorListener(
        (error: PurchaseError) => {
          console.warn('Purchase error:', error);
        }
      );

      // Restore purchases on initialization
      await this.restore();
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
    }
  }

  static async cleanup(): Promise<void> {
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }
    await endConnection();
    this.isInitialized = false;
  }

  static async getProductList(): Promise<Product[]> {
    try {
      const productIds = PRODUCT_CATALOG.map((p) => p.id);
      const products = await getProducts({ skus: productIds });
      return products;
    } catch (error) {
      console.error('Failed to get products:', error);
      return [];
    }
  }

  static async purchase(productId: string): Promise<boolean> {
    try {
      await requestPurchase({ sku: productId });
      return true;
    } catch (error) {
      console.error('Purchase failed:', error);
      return false;
    }
  }

  static async restore(): Promise<void> {
    try {
      const purchases = await getAvailablePurchases();

      // Check if user has any active subscriptions
      const hasActiveSubscription = purchases.some((purchase) =>
        PRODUCT_CATALOG.some((product) => product.id === purchase.productId)
      );

      if (hasActiveSubscription) {
        // Grant premium entitlements
        const setEntitlements = usePurchaseStore.getState().setEntitlements;
        const activePurchase = purchases.find((purchase) =>
          PRODUCT_CATALOG.some((product) => product.id === purchase.productId)
        );

        setEntitlements({
          entitlements: {
            premiumTemplates: true,
            premiumFilters: true,
            aiArrange: true,
            pdfExport: true,
            watermarkToggle: true,
            cloudBackup: true,
          },
          subscriptionProductId: activePurchase?.productId || null,
        });
      } else {
        // Clear entitlements if no active subscription
        const setEntitlements = usePurchaseStore.getState().setEntitlements;
        setEntitlements({
          entitlements: {
            premiumTemplates: false,
            premiumFilters: false,
            aiArrange: false,
            pdfExport: false,
            watermarkToggle: false,
            cloudBackup: false,
          },
          subscriptionProductId: null,
        });
      }
    } catch (error) {
      console.error('Restore failed:', error);
    }
  }

  private static async handlePurchaseUpdate(purchase: Purchase): Promise<void> {
    // Verify the purchase is valid
    const isValid = await this.verifyPurchase(purchase);

    if (isValid) {
      // Grant entitlements
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
        subscriptionProductId: purchase.productId,
      });
    }
  }

  private static async verifyPurchase(purchase: Purchase): Promise<boolean> {
    // In a production app, you would verify the receipt with Apple/Google servers
    // or use a backend service to validate the purchase
    // For now, we'll just check that the transactionId exists
    return !!purchase.transactionId;
  }
}
