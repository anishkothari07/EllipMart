'use server';

import { MediaService, SearchMediaParams } from '@corecart/commerce/src/media/media.service';
import { requireSellerAccess } from '@corecart/shared/src/auth';
import { revalidatePath } from 'next/cache';

const mediaService = new MediaService();

export async function searchMediaAction(params: SearchMediaParams) {
  try {
    const user = await requireSellerAccess();
    // Filter media to only show files uploaded by this seller
    const data = await mediaService.searchMedia({ ...params, uploadedById: user.id });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to search media files.' };
  }
}

export async function uploadMediaAction(formData: FormData) {
  try {
    const user = await requireSellerAccess();
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
      uploadedById: user.id,
      allowDuplicate: true,
    });

    revalidatePath('/seller/media');
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to upload media file.' };
  }
}

export async function deleteMediaAction(mediaId: string) {
  try {
    await requireSellerAccess();
    await mediaService.deleteMedia(mediaId, true);
    revalidatePath('/seller/media');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete media asset.' };
  }
}

export async function createFolderAction(name: string) {
  try {
    await requireSellerAccess();
    const folder = await mediaService.createFolder(name);
    revalidatePath('/seller/media');
    return { success: true, data: JSON.parse(JSON.stringify(folder)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create media folder.' };
  }
}

export async function getFoldersAction() {
  try {
    await requireSellerAccess();
    const folders = await mediaService.getFolders();
    return { success: true, data: JSON.parse(JSON.stringify(folders)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch media folders.' };
  }
}
