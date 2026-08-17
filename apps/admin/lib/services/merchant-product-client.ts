import {
  fetchProductsAction,
  fetchProductByIdAction,
  fetchBrandsAndCategoriesAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  bulkUpdateStatusAction,
  bulkDeleteAction,
} from '@/app/products/actions';

export class MerchantProductClient {
  static async listProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    brandId?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    sort?: string;
  }) {
    const res = await fetchProductsAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getProduct(id: string) {
    const res = await fetchProductByIdAction(id);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getMetadata() {
    const res = await fetchBrandsAndCategoriesAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async createProduct(input: any) {
    const res = await createProductAction(input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateProduct(id: string, input: any) {
    const res = await updateProductAction(id, input);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async deleteProduct(id: string) {
    const res = await deleteProductAction(id);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async bulkUpdateStatus(ids: string[], status: 'ACTIVE' | 'ARCHIVED') {
    const res = await bulkUpdateStatusAction(ids, status);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async bulkDelete(ids: string[]) {
    const res = await bulkDeleteAction(ids);
    if (!res.success) throw new Error(res.error);
    return true;
  }
}
