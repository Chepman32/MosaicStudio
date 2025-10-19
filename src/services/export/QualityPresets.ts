import type { ExportOptions } from '../../types/projects';

export const EXPORT_PRESETS: Record<string, ExportOptions> = {
  quickShare: { quality: 'low', format: 'jpg', includeWatermark: true },
  highResolution: { quality: 'high', format: 'png', includeWatermark: true },
  printReady: { quality: 'original', format: 'pdf', includeWatermark: false },
};
