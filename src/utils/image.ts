import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Image } from 'react-native';

import { IMAGE_COMPRESSION, MAX_IMAGE_SIZE } from '@/config/limits';

export interface CompressedImage {
  uri: string;
  base64: string;
}

function getSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

/**
 * Comprime una foto a máx. MAX_IMAGE_SIZE px de lado mayor y JPEG ~0.7
 * antes de enviarla al backend: reduce coste de tokens y latencia.
 */
export async function compressForAnalysis(uri: string): Promise<CompressedImage> {
  const { width, height } = await getSize(uri);
  const context = ImageManipulator.manipulate(uri);

  const longSide = Math.max(width, height);
  if (longSide > MAX_IMAGE_SIZE) {
    const scale = MAX_IMAGE_SIZE / longSide;
    context.resize({ width: Math.round(width * scale), height: Math.round(height * scale) });
  }

  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    compress: IMAGE_COMPRESSION,
    format: SaveFormat.JPEG,
    base64: true,
  });
  return { uri: saved.uri, base64: saved.base64 ?? '' };
}
