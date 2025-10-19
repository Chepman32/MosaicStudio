import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Entitlement =
  | 'premiumTemplates'
  | 'premiumFilters'
  | 'aiArrange'
  | 'pdfExport'
  | 'watermarkToggle'
  | 'cloudBackup';

interface PurchaseState {
  activeEntitlements: Record<Entitlement, boolean>;
  subscriptionProductId: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  setEntitlements: (payload: {
    entitlements: Partial<Record<Entitlement, boolean>>;
    subscriptionProductId?: string | null;
    expiresAt?: number | null;
  }) => void;
  setLoading: (value: boolean) => void;
  clear: () => void;
  isUnlocked: (entitlement: Entitlement) => boolean;
}

const initialEntitlements: Record<Entitlement, boolean> = {
  premiumTemplates: false,
  premiumFilters: false,
  aiArrange: false,
  pdfExport: false,
  watermarkToggle: false,
  cloudBackup: false,
};

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set, get) => ({
      activeEntitlements: initialEntitlements,
      subscriptionProductId: null,
      expiresAt: null,
      isLoading: false,
      setEntitlements: ({ entitlements, subscriptionProductId, expiresAt }) =>
        set((state) => ({
          activeEntitlements: {
            ...state.activeEntitlements,
            ...entitlements,
          },
          subscriptionProductId:
            subscriptionProductId ?? state.subscriptionProductId,
          expiresAt: expiresAt ?? state.expiresAt,
        })),
      setLoading: (value) => set({ isLoading: value }),
      clear: () =>
        set({
          activeEntitlements: initialEntitlements,
          subscriptionProductId: null,
          expiresAt: null,
        }),
      isUnlocked: (entitlement) => !!get().activeEntitlements[entitlement],
    }),
    {
      name: 'mosaic-purchase-store',
      version: 1,
    },
  ),
);
