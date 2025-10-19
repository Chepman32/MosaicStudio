import React, { PropsWithChildren, useEffect } from 'react';

import { usePurchaseStore } from '../stores/usePurchaseStore';

export const PurchaseProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const setEntitlements = usePurchaseStore((state) => state.setEntitlements);

  useEffect(() => {
    // Placeholder: In a production build, this would query StoreKit via RN IAP.
    setEntitlements({ entitlements: {} });
  }, [setEntitlements]);

  return <>{children}</>;
};
