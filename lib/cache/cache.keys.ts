export const CacheKeys = {
  product: (slug: string) => `cache:product:${slug}`,
  productList: (category?: string, page = 1) => `cache:products:cat=${category || 'all'}:p=${page}`,
  categories: () => `cache:categories:all`,
  search: (query: string) => `cache:search:${encodeURIComponent(query)}`,
  theme: (storeId = 'default') => `cache:theme:${storeId}`,
  aiChat: (hash: string) => `cache:ai:${hash}`,
  analyticsSummary: () => `cache:analytics:summary`,
  pincode: (code: string) => `cache:pincode:${code}`,
};
