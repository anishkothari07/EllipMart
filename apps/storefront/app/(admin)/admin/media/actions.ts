'use server';

import { MediaService, SearchMediaParams } from '@corecart/commerce/src/media/media.service';
import { requireAdminAccess } from '@corecart/shared/src/auth';
import { revalidatePath } from 'next/cache';

const mediaService = new MediaService();

// Admin sees ALL media on the platform (no uploadedById restriction)
export async function adminSearchMediaAction(params: SearchMediaParams) {
  try {
    await requireAdminAccess();
    const data = await mediaService.searchMedia({ ...params });
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to search media files.' };
  }
}

export async function adminUploadMediaAction(formData: FormData) {
  try {
    const user = await requireAdminAccess();
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

    revalidatePath('/admin/products');
    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to upload media file.' };
  }
}

export async function adminDeleteMediaAction(mediaId: string) {
  try {
    await requireAdminAccess();
    await mediaService.deleteMedia(mediaId, true);
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete media asset.' };
  }
}

export async function adminCreateFolderAction(name: string) {
  try {
    await requireAdminAccess();
    const folder = await mediaService.createFolder(name);
    revalidatePath('/admin/products');
    return { success: true, data: JSON.parse(JSON.stringify(folder)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create media folder.' };
  }
}

export async function adminGetFoldersAction() {
  try {
    await requireAdminAccess();
    const folders = await mediaService.getFolders();
    return { success: true, data: JSON.parse(JSON.stringify(folders)) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch media folders.' };
  }
}
