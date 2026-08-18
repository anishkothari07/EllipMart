import {
  fetchCollectionsAction,
  fetchCollectionByIdAction,
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
  bulkAssignCollectionAction,
  bulkAssignCategoryAction,
} from '@/app/(seller)/seller/collections/actions';

export class MerchantCollectionClient {
  static async listCollections(params: { page?: number; limit?: number; search?: string }) {
    const res = await fetchCollectionsAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getCollection(id: string) {
    const res = await fetchCollectionByIdAction(id);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async createCollection(input: any) {
    const res = await createCollectionAction(input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateCollection(id: string, input: any) {
    const res = await updateCollectionAction(id, input);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async deleteCollection(id: string) {
    const res = await deleteCollectionAction(id);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async bulkAssignCollection(colId: string, productIds: string[], operation: 'REPLACE' | 'APPEND' | 'REMOVE') {
    const res = await bulkAssignCollectionAction(colId, productIds, operation);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async bulkAssignCategory(catId: string, productIds: string[], operation: 'REPLACE' | 'APPEND' | 'REMOVE') {
    const res = await bulkAssignCategoryAction(catId, productIds, operation);
    if (!res.success) throw new Error(res.error);
    return true;
  }
}
