import {
  searchMediaAction,
  uploadMediaAction,
  deleteMediaAction,
  createFolderAction,
  getFoldersAction,
} from '@/app/media/actions';
import type { SearchMediaParams } from '@corecart/commerce';

export class MerchantMediaClient {
  static async searchMedia(params: SearchMediaParams) {
    const res = await searchMediaAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async uploadMedia(formData: FormData) {
    const res = await uploadMediaAction(formData);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async deleteMedia(mediaId: string) {
    const res = await deleteMediaAction(mediaId);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async createFolder(name: string) {
    const res = await createFolderAction(name);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getFolders() {
    const res = await getFoldersAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }
}
