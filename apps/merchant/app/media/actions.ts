'use server';

import { MediaService, SearchMediaParams } from '@corecart/commerce/src/media/media.service';
import { revalidatePath } from 'next/cache';

const mediaService = new MediaService();

// ─────────────────────────────────────────────
// SEARCH / LIST
// ─────────────────────────────────────────────

export async function searchMediaAction(params: SearchMediaParams) {
  try {
    const data = await mediaService.searchMedia(params);
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to search media files.' };
  }
}

// ─────────────────────────────────────────────
// UPLOAD
// ─────────────────────────────────────────────

export async function uploadMediaAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) throw new Error('No file provided in form data.');

    const folderId = formData.get('folderId') as string || undefined;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await mediaService.uploadMedia({
      buffer,
      originalName: file.name,
      mimeType: file.type,
      folderId,
      allowDuplicate: true, // Allow duplicates during tests to avoid confusion
    });

    revalidatePath('/media');
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to upload media file.' };
  }
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

export async function deleteMediaAction(mediaId: string) {
  try {
    await mediaService.deleteMedia(mediaId, true); // force delete from db
    revalidatePath('/media');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete media asset.' };
  }
}

// ─────────────────────────────────────────────
// FOLDERS
// ─────────────────────────────────────────────

export async function createFolderAction(name: string) {
  try {
    const folder = await mediaService.createFolder(name);
    revalidatePath('/media');
    return { success: true, data: JSON.parse(JSON.stringify(folder)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create media folder.' };
  }
}

export async function getFoldersAction() {
  try {
    const folders = await mediaService.getFolders();
    return { success: true, data: JSON.parse(JSON.stringify(folders)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch media folders.' };
  }
}
