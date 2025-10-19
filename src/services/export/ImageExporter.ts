import type { CollageProject, ExportOptions } from '../../types/projects';

export class ImageExporter {
  static async export(project: CollageProject, options: ExportOptions): Promise<void> {
    console.log('Exporting project', project.id, options);
  }
}
