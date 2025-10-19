import type { ExportOptions } from '../../types/projects';

export const EXPORT_PRESETS: Record<string, ExportOptions> = {
  quickShare: { quality: 'low', format: 'jpg', includeWatermark: true },
  highResolution: { quality: 'high', format: 'png', includeWatermark: true },
  printReady: { quality: 'original', format: 'pdf', includeWatermark: false },
};

interface QualityPreset {
  maxDimension: number;
  compression: number;
}

export class QualityPresets {
  private static presets: Record<string, QualityPreset> = {
    low: { maxDimension: 1080, compression: 0.7 },
    medium: { maxDimension: 2048, compression: 0.85 },
    high: { maxDimension: 4096, compression: 0.95 },
    original: { maxDimension: -1, compression: 1.0 },
  };

  static getPreset(quality: string): QualityPreset {
    return this.presets[quality] || this.presets.medium;
  }
}
