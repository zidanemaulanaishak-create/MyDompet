import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';

const BUCKET = 'avatars';

function avatarPath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

async function readImageBytes(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return response.arrayBuffer();
  }
  const file = new File(uri);
  return file.arrayBuffer();
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 512, height: 512 });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
  const bytes = await readImageBytes(saved.uri);

  const path = avatarPath(userId);
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function deleteAvatar(userId: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([avatarPath(userId)]);
  if (error) throw error;
}
