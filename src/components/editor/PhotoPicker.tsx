import React from 'react';
import { Alert } from 'react-native';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';

export interface PhotoPickerResult {
  uri: string;
  width: number;
  height: number;
}

export const usePhotoPicker = () => {
  const pickPhotos = async (): Promise<PhotoPickerResult[]> => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 10,
        quality: 1,
        includeBase64: false,
      });

      if (result.didCancel) {
        return [];
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick photos');
        return [];
      }

      if (!result.assets) {
        return [];
      }

      return result.assets
        .filter((asset): asset is Asset =>
          !!asset.uri && !!asset.width && !!asset.height
        )
        .map((asset) => ({
          uri: asset.uri!,
          width: asset.width!,
          height: asset.height!,
        }));
    } catch (error) {
      console.error('Photo picker error:', error);
      Alert.alert('Error', 'Failed to access photo library');
      return [];
    }
  };

  return { pickPhotos };
};
