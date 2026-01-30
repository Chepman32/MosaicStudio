import ImagePicker from 'react-native-image-crop-picker';
import { Image as RNImage } from 'react-native';
import { CropData } from '../../types/projects';

/**
 * Opens the native iOS crop interface for the given image.
 * Returns normalized crop coordinates (0-1 range) compatible with PhotoLayer rendering.
 *
 * @param imageUri - Local file path or URI to the image
 * @param currentCrop - Optional existing crop data (currently unused, for future enhancement)
 * @returns CropData with normalized coordinates, or null if cancelled/error
 */
export const openNativeCrop = async (
  imageUri: string,
  currentCrop?: CropData | null
): Promise<CropData | null> => {
  try {
    // Get original image dimensions
    const originalDimensions = await new Promise<{
      width: number;
      height: number;
    }>((resolve, reject) => {
      RNImage.getSize(
        imageUri,
        (width, height) => resolve({ width, height }),
        reject
      );
    });

    const result = await ImagePicker.openCropper({
      path: imageUri,
      freeStyleCropEnabled: true,
      showCropGuidelines: true,
      enableRotationGesture: true,
      mediaType: 'photo',
      includeBase64: false,
      cropping: true,
    });

    // If cropRect is provided by the library, use it
    if (result.cropRect) {
      const normalizedCrop: CropData = {
        x: result.cropRect.x / originalDimensions.width,
        y: result.cropRect.y / originalDimensions.height,
        width: result.cropRect.width / originalDimensions.width,
        height: result.cropRect.height / originalDimensions.height,
        rotation: 0,
      };
      return normalizedCrop;
    }

    // Fallback: cropRect not provided, use full cropped image dimensions
    // This assumes the crop covers the entire resulting image
    const normalizedCrop: CropData = {
      x: 0,
      y: 0,
      width: result.width / originalDimensions.width,
      height: result.height / originalDimensions.height,
      rotation: 0,
    };

    return normalizedCrop;
  } catch (error: any) {
    // User cancelled is expected, don't log as error
    if (error?.message !== 'User cancelled image selection') {
      console.error('Native crop error:', error);
    }
    return null;
  }
};
