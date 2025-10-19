import { Skia, makeImageFromView } from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Platform, PermissionsAndroid } from 'react-native';
import type { CollageProject, ExportOptions } from '../../types/projects';
import { QualityPresets } from './QualityPresets';

export interface ExportResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
}

export class ImageExporter {
  private static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Save to Photos',
            message: 'Mosaic Studio needs permission to save to your photo library',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Save to Photos',
            message: 'Mosaic Studio needs permission to save to your photo library',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions via Info.plist
  }

  static async export(
    project: CollageProject,
    options: ExportOptions
  ): Promise<ExportResult> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Permission denied to save photos');
    }

    const preset = QualityPresets.getPreset(options.quality);
    const { width, height } = this.calculateDimensions(
      project.canvas.width,
      project.canvas.height,
      preset.maxDimension
    );

    // Create export directory if it doesn't exist
    const exportDir = `${RNFS.DocumentDirectoryPath}/Exports`;
    const dirExists = await RNFS.exists(exportDir);
    if (!dirExists) {
      await RNFS.mkdir(exportDir);
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `collage_${timestamp}.${options.format}`;
    const filepath = `${exportDir}/${filename}`;

    // Render collage using Skia
    // Note: In a real implementation, you'd need to render the Skia canvas
    // and capture it as an image. This is a simplified version.
    const imageData = await this.renderCollage(project, width, height, options);

    // Save to file
    await RNFS.writeFile(filepath, imageData, 'base64');

    // Save to camera roll
    const savedUri = await CameraRoll.save(filepath, { type: 'photo' });

    // Get file stats
    const stats = await RNFS.stat(filepath);

    return {
      uri: savedUri,
      width,
      height,
      fileSize: parseInt(stats.size, 10),
    };
  }

  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxDimension: number
  ): { width: number; height: number } {
    if (maxDimension === -1) {
      return { width: originalWidth, height: originalHeight };
    }

    const aspectRatio = originalWidth / originalHeight;

    if (originalWidth > originalHeight) {
      return {
        width: Math.min(originalWidth, maxDimension),
        height: Math.min(originalWidth, maxDimension) / aspectRatio,
      };
    } else {
      return {
        width: Math.min(originalHeight, maxDimension) * aspectRatio,
        height: Math.min(originalHeight, maxDimension),
      };
    }
  }

  private static async renderCollage(
    project: CollageProject,
    width: number,
    height: number,
    options: ExportOptions
  ): Promise<string> {
    // This is a placeholder - in a real implementation, you would:
    // 1. Create a Skia surface at the target dimensions
    // 2. Render the background
    // 3. Render each layer in z-order with transforms and filters
    // 4. Add watermark if needed
    // 5. Encode to the requested format
    // 6. Return base64 encoded image data

    // For now, return empty string as placeholder
    console.log('Rendering collage:', { project, width, height, options });
    return '';
  }

  static async shareDirectly(
    project: CollageProject,
    options: ExportOptions
  ): Promise<void> {
    // Export the image first
    const result = await this.export(project, options);

    // Use native share sheet (would need react-native-share library)
    console.log('Sharing:', result.uri);
  }
}
