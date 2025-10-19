import { nanoid } from 'nanoid/non-secure';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  CollageProject,
  Layer,
  TemplateDefinition,
  ExportOptions,
} from '../types/projects';
import { defaultCanvasState } from '../constants/canvasDefaults';

interface HistoryEntry {
  projectId: string;
  snapshot: CollageProject;
}

interface ProjectStoreState {
  projects: Record<string, CollageProject>;
  currentProjectId: string | null;
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  isSaving: boolean;
  pendingTemplate: TemplateDefinition | null;
  setCurrentProject: (projectId: string | null) => void;
  createBlankProject: (name: string) => CollageProject;
  createFromTemplate: (template: TemplateDefinition, name?: string) => CollageProject;
  updateProject: (
    projectId: string,
    updater: (project: CollageProject) => CollageProject,
    options?: { pushHistory?: boolean },
  ) => void;
  removeProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => CollageProject | null;
  addLayer: (projectId: string, layer: Layer) => void;
  updateLayer: (projectId: string, layerId: string, updates: Partial<Layer>) => void;
  removeLayer: (projectId: string, layerId: string) => void;
  deleteLayer: (projectId: string, layerId: string) => void;
  reorderLayers: (projectId: string, orderedLayerIds: string[]) => void;
  renameProject: (projectId: string, newName: string) => void;
  setSaving: (value: boolean) => void;
  pushHistory: (project: CollageProject) => void;
  undo: () => void;
  redo: () => void;
  applyExport: (projectId: string, options: ExportOptions) => void;
}

const cloneProject = (project: CollageProject): CollageProject => ({
  ...project,
  canvas: { ...project.canvas, background: { ...project.canvas.background } },
  layers: project.layers.map((layer) => ({ ...layer })),
});

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      projects: {},
      currentProjectId: null,
      undoStack: [],
      redoStack: [],
      isSaving: false,
      pendingTemplate: null,
      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),
      createBlankProject: (name) => {
        const project: CollageProject = {
          id: nanoid(),
          name,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          thumbnail: '',
          canvas: defaultCanvasState,
          layers: [],
          template: null,
        };
        set((state) => ({
          projects: { ...state.projects, [project.id]: project },
          currentProjectId: project.id,
        }));
        return project;
      },
      createFromTemplate: (template, name) => {
        const project: CollageProject = {
          id: nanoid(),
          name: name ?? template.name,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
          thumbnail: '',
          canvas: template.layout.canvas,
          layers: template.layout.frames.map((frame) => ({
            id: frame.id,
            sourceUri: '',
            dimensions: { width: frame.size.width, height: frame.size.height },
            transform: {
              x: frame.position.x,
              y: frame.position.y,
              scale: 1,
              rotation: frame.rotation,
            },
            filters: [],
            opacity: 1,
            blendMode: 'normal',
            zIndex: frame.zIndex,
            crop: null,
            mask: frame.mask ?? null,
          })),
          template: template.id,
        };
        set((state) => ({
          projects: { ...state.projects, [project.id]: project },
          currentProjectId: project.id,
        }));
        return project;
      },
      updateProject: (projectId, updater, options) => {
        const state = get();
        const existing = state.projects[projectId];
        if (!existing) return;
        const updated = updater(cloneProject(existing));
        updated.modifiedAt = Date.now();
        set({
          projects: { ...state.projects, [projectId]: updated },
          redoStack: options?.pushHistory ? [] : state.redoStack,
        });
        if (options?.pushHistory) {
          state.pushHistory(existing);
        }
      },
      removeProject: (projectId) => {
        set((state) => {
          const rest = { ...state.projects };
          delete rest[projectId];
          const nextCurrent =
            state.currentProjectId === projectId ? null : state.currentProjectId;
          return {
            projects: rest,
            currentProjectId: nextCurrent,
          };
        });
      },
      duplicateProject: (projectId) => {
        const project = get().projects[projectId];
        if (!project) return null;
        const duplicated = cloneProject(project);
        duplicated.id = nanoid();
        duplicated.name = `${project.name} Copy`;
        duplicated.createdAt = Date.now();
        duplicated.modifiedAt = Date.now();
        set((state) => ({
          projects: { ...state.projects, [duplicated.id]: duplicated },
        }));
        return duplicated;
      },
      addLayer: (projectId, layer) => {
        get().updateProject(
          projectId,
          (project) => ({
            ...project,
            layers: [...project.layers, layer],
          }),
          { pushHistory: true },
        );
      },
      updateLayer: (projectId, layerId, updates) => {
        get().updateProject(
          projectId,
          (project) => ({
            ...project,
            layers: project.layers.map((layer) =>
              layer.id === layerId ? { ...layer, ...updates } : layer,
            ),
          }),
          { pushHistory: true },
        );
      },
      removeLayer: (projectId, layerId) => {
        get().updateProject(
          projectId,
          (project) => ({
            ...project,
            layers: project.layers.filter((layer) => layer.id !== layerId),
          }),
          { pushHistory: true },
        );
      },
      deleteLayer: (projectId, layerId) => {
        get().removeLayer(projectId, layerId);
      },
      reorderLayers: (projectId, orderedLayerIds) => {
        get().updateProject(
          projectId,
          (project) => ({
            ...project,
            layers: orderedLayerIds
              .map((layerId, index) => {
                const layer = project.layers.find((l) => l.id === layerId);
                if (!layer) return null;
                return { ...layer, zIndex: index };
              })
              .filter(Boolean) as Layer[],
          }),
          { pushHistory: true },
        );
      },
      renameProject: (projectId, newName) => {
        get().updateProject(
          projectId,
          (project) => ({
            ...project,
            name: newName,
          }),
        );
      },
      setSaving: (value) => set({ isSaving: value }),
      pushHistory: (snapshot) =>
        set((state) => ({
          undoStack: [
            ...state.undoStack,
            { projectId: snapshot.id, snapshot: cloneProject(snapshot) },
          ].slice(-50),
        })),
      undo: () => {
        const { undoStack, projects, redoStack } = get();
        const lastEntry = undoStack[undoStack.length - 1];
        if (!lastEntry) return;
        set({
          projects: {
            ...projects,
            [lastEntry.projectId]: lastEntry.snapshot,
          },
          undoStack: undoStack.slice(0, -1),
          redoStack: [
            ...redoStack,
            { projectId: lastEntry.projectId, snapshot: projects[lastEntry.projectId] },
          ].slice(-50),
        });
      },
      redo: () => {
        const { redoStack, projects, undoStack } = get();
        const entry = redoStack[redoStack.length - 1];
        if (!entry) return;
        set({
          projects: {
            ...projects,
            [entry.projectId]: entry.snapshot,
          },
          redoStack: redoStack.slice(0, -1),
          undoStack: [
            ...undoStack,
            { projectId: entry.projectId, snapshot: projects[entry.projectId] },
          ].slice(-50),
        });
      },
      applyExport: (projectId, options) => {
        get().updateProject(
          projectId,
          (project) => ({
            ...project,
            metadata: {
              ...project.metadata,
              lastExport: {
                at: Date.now(),
                options,
              },
            },
          }),
        );
      },
    }),
    {
      name: 'mosaic-project-store',
      version: 1,
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
      }),
    },
  ),
);
