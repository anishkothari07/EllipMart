import {
  fetchBrandsAction,
  fetchBrandByIdAction,
  createBrandAction,
  updateBrandAction,
  deleteBrandAction,
  bulkDeleteBrandAction
} from '@/app/(seller)/seller/brands/actions';

export class MerchantBrandClient {
  static async listBrands(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const res = await fetchBrandsAction(params);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async getBrand(id: string) {
    const res = await fetchBrandByIdAction(id);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async createBrand(input: any) {
    const res = await createBrandAction(input);
    if (!res.success) throw new Error(res.error);
    return res.data;
  }

  static async updateBrand(id: string, input: any) {
    const res = await updateBrandAction(id, input);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async deleteBrand(id: string) {
    const res = await deleteBrandAction(id);
    if (!res.success) throw new Error(res.error);
    return true;
  }

  static async bulkDelete(ids: string[]) {
    const res = await bulkDeleteBrandAction(ids);
    if (!res.success) throw new Error(res.error);
    return true;
  }
}
