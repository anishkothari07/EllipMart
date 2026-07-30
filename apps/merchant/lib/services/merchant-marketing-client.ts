import {
  fetchMarketingContentAction,
  updateMarketingContentAction,
  fetchCollectionsAndProductsAction,
} from '@/app/marketing/actions';
import type { MarketingContent } from '@corecart/commerce';

export class MerchantMarketingClient {
  static async getMarketingContent() {
    const res = await fetchMarketingContentAction();
    if (!res.success) throw new Error(res.error);
    return res.data as MarketingContent;
  }

  static async saveMarketingContent(content: MarketingContent) {
    const res = await updateMarketingContentAction(content);
    if (!res.success) throw new Error(res.error);
    return res.data as MarketingContent;
  }

  static async getPickersData() {
    const res = await fetchCollectionsAndProductsAction();
    if (!res.success) throw new Error(res.error);
    return res.data;
  }
}
