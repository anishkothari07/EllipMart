export interface InternyxProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageUrls: string[];
  priceInRupees: number;
  pointsPrice: number;
  inStock: boolean;
  category: string;
}

export const internyxService = {
  async fetchProducts(): Promise<InternyxProduct[]> {
    const baseUrl = process.env.INTERNYX_BASE_URL;
    const apiKey = process.env.INTERNYX_API_KEY;
    
    console.log('[DEBUG] baseUrl:', baseUrl, 'apiKey:', apiKey ? 'SET' : 'NOT SET');

    if (!baseUrl || !apiKey) {
      console.warn('[INTERNYX] INTERNYX_BASE_URL or INTERNYX_API_KEY not set.');
      return [];
    }

    try {
      const response = await fetch(`${baseUrl}/api/external/products`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      const data = await response.json();

      if (data.success && data.products) {
        return data.products as InternyxProduct[];
      } else {
        console.error('[INTERNYX] Error fetching products:', data.error);
        return [];
      }
    } catch (error) {
      console.error('[INTERNYX] Network error:', error);
      return [];
    }
  }
};
