import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { Platform, PermissionsAndroid } from 'react-native';

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  type?: string;
}

export class PhotoPicker {
  private static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Photo Library Permission',
            message: 'Mosaic Studio needs access to your photo library',
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
    return true; // iOS handles permissions automatically via Info.plist
  }

  static async pick(
    options: { multiple?: boolean; maxPhotos?: number } = {}
  ): Promise<PickedImage[]> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Photo library permission denied');
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: options.multiple ? (options.maxPhotos || 30) : 1,
      quality: 1,
    });

    if (result.didCancel) {
      return [];
    }

    if (result.errorCode) {
      throw new Error(result.errorMessage || 'Failed to pick photos');
    }

    if (!result.assets || result.assets.length === 0) {
      return [];
    }

    return result.assets
      .filter((asset): asset is Asset => !!asset.uri)
      .map((asset) => ({
        uri: asset.uri!,
        width: asset.width || 1024,
        height: asset.height || 1024,
        fileSize: asset.fileSize,
        type: asset.type,
      }));
  }

  static async pickSingle(): Promise<PickedImage | null> {
    const images = await this.pick({ multiple: false });
    return images[0] || null;
  }

  static async pickMultiple(maxPhotos: number = 30): Promise<PickedImage[]> {
    return this.pick({ multiple: true, maxPhotos });
  }
}
