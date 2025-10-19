import { create } from 'zustand';

interface ContextMenuState {
  projectId: string;
  anchor: { x: number; y: number };
}

interface TemplateDrawerState {
  isOpen: boolean;
  category: 'all' | 'grid' | 'freeform' | 'seasonal' | 'premium';
}

interface UIStoreState {
  templateDrawer: TemplateDrawerState;
  exportModalProjectId: string | null;
  premiumSheetFeature: string | null;
  contextMenu: ContextMenuState | null;
  setTemplateDrawer: (state: Partial<TemplateDrawerState>) => void;
  openExportModal: (projectId: string) => void;
  closeExportModal: () => void;
  openPremiumSheet: (feature: string) => void;
  closePremiumSheet: () => void;
  openContextMenu: (state: ContextMenuState) => void;
  closeContextMenu: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  templateDrawer: { isOpen: false, category: 'all' },
  exportModalProjectId: null,
  premiumSheetFeature: null,
  contextMenu: null,
  setTemplateDrawer: (state) =>
    set((prev) => ({
      templateDrawer: { ...prev.templateDrawer, ...state },
    })),
  openExportModal: (projectId) => set({ exportModalProjectId: projectId }),
  closeExportModal: () => set({ exportModalProjectId: null }),
  openPremiumSheet: (feature) => set({ premiumSheetFeature: feature }),
  closePremiumSheet: () => set({ premiumSheetFeature: null }),
  openContextMenu: (state) => set({ contextMenu: state }),
  closeContextMenu: () => set({ contextMenu: null }),
}));
