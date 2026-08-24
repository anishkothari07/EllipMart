import {
  adminSearchMediaAction,
  adminUploadMediaAction,
  adminDeleteMediaAction,
  adminCreateFolderAction,
  adminGetFoldersAction,
} from '@/app/(admin)/admin/media/actions';
import type { SearchMediaParams } from '@corecart/commerce';

export class AdminMediaClient {
  static async searchMedia(params: SearchMediaParams) {
    const res = await adminSearchMediaAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async uploadMedia(formData: FormData) {
    const res = await adminUploadMediaAction(formData);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async deleteMedia(mediaId: string) {
    const res = await adminDeleteMediaAction(mediaId);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async createFolder(name: string) {
    const res = await adminCreateFolderAction(name);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getFolders() {
    const res = await adminGetFoldersAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }
}
