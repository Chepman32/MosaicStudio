export class ImageProcessor {
  static async applyFilter(uri: string, filterId: string, intensity: number): Promise<string> {
    console.log('Applying filter', { uri, filterId, intensity });
    return uri;
  }
}
