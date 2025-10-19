import { MMKV } from 'react-native-mmkv';

import type { CollageProject } from '../../types/projects';

const storage = new MMKV({ id: 'mosaic-projects' });

const PROJECTS_KEY = 'projects';

export class ProjectManager {
  static loadProjects(): Record<string, CollageProject> {
    try {
      const raw = storage.getString(PROJECTS_KEY);
      if (!raw) {
        return {};
      }
      return JSON.parse(raw) as Record<string, CollageProject>;
    } catch (error) {
      console.warn('Failed to load projects', error);
      return {};
    }
  }

  static saveProjects(projects: Record<string, CollageProject>): void {
    try {
      storage.set(PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.warn('Failed to save projects', error);
    }
  }
}
