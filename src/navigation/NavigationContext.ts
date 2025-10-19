import React from 'react';

export type AppRoute =
  | 'home'
  | 'editor'
  | 'library'
  | 'settings'
  | 'templateDrawer'
  | 'premiumSheet'
  | 'exportModal';

type RouteParams =
  | { route: 'editor'; projectId?: string; templateId?: string | null }
  | { route: 'templateDrawer' }
  | { route: 'premiumSheet'; feature: string }
  | { route: 'exportModal'; projectId: string }
  | { route: 'home' }
  | { route: 'library' }
  | { route: 'settings' };

export interface NavigationState {
  stack: RouteParams[];
}

export interface NavigationContextValue {
  state: NavigationState;
  activeRoute: RouteParams;
  navigate: (params: RouteParams) => void;
  goBack: () => void;
  reset: (params: RouteParams) => void;
}

export const NavigationContext =
  React.createContext<NavigationContextValue | undefined>(undefined);

export const useNavigation = (): NavigationContextValue => {
  const ctx = React.useContext(NavigationContext);
  if (!ctx) {
    throw new Error('NavigationContext not found');
  }
  return ctx;
};
