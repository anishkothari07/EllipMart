import {
  fetchCategoryTreeAction,
  fetchCategoryByIdAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
} from '@/app/(seller)/seller/categories/actions';

export class MerchantCategoryClient {
  static async getCategoryTree() {
    const res = await fetchCategoryTreeAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getCategory(id: string) {
    const res = await fetchCategoryByIdAction(id);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async createCategory(input: any) {
    const res = await createCategoryAction(input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateCategory(id: string, input: any) {
    const res = await updateCategoryAction(id, input);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async deleteCategory(id: string) {
    const res = await deleteCategoryAction(id);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async moveCategory(id: string, parentId: string | null, sortOrder: number) {
    const res = await moveCategoryAction(id, parentId, sortOrder);
    if (!res.success) throw new Error(res.error);
    return true;
  }
}
