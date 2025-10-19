export class PhotoPicker {
  static async pick(options: { multiple?: boolean } = {}): Promise<string[]> {
    console.log('Opening photo picker', options);
    return [];
  }
}
