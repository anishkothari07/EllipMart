import { IAIProvider } from "./provider.interface";

export class MockProvider implements IAIProvider {
  id = "MOCK";

  async generateText(prompt: string, systemInstruction?: string, options?: any): Promise<{
    text: string;
    promptTokens: number;
    completionTokens: number;
  }> {
    let response = "This is a mock AI response grounded in catalog context.";

    if (prompt.toLowerCase().includes("seo") || prompt.toLowerCase().includes("meta")) {
      response = "Mock SEO Meta Title: Upgrade Your Gaming Setup | CoreCart\nMock Meta Description: Browse premium gaming hardware at unmatched prices on CoreCart. Free delivery today!";
    } else if (prompt.toLowerCase().includes("where is my order")) {
      response = "Based on your order lookup, your order (ORD-12345) is currently in TRANSIT and is expected to be delivered by tomorrow evening.";
    } else if (prompt.toLowerCase().includes("compare")) {
      response = "Comparison Result:\n\n- Phone A: 12GB RAM, 5000mAh battery, $800\n- Phone B: 8GB RAM, 4500mAh battery, $650\n\nRecommendation: Phone A is best for high performance and longevity.";
    } else if (prompt.toLowerCase().includes("description")) {
      response = "Introducing our latest catalog addition: a high-quality product engineered for exceptional reliability, durability, and customer satisfaction.";
    } else if (prompt.toLowerCase().includes("review")) {
      response = "Review Summary:\n- Positives: Extremely fast processing speed, long-lasting battery life.\n- Negatives: Tends to warm up slightly during intensive gaming sessions.";
    }

    return {
      text: response,
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: Math.ceil(response.length / 4)
    };
  }

  async generateStructuredOutput(prompt: string, systemInstruction: string, schema: any, options?: any): Promise<{
    data: any;
    promptTokens: number;
    completionTokens: number;
  }> {
    let mockData: any = { success: true };

    if (prompt.toLowerCase().includes("seo") || prompt.toLowerCase().includes("meta")) {
      mockData = {
        title: "Grounded Gaming Gear | CoreCart",
        description: "Explore the best catalog items.",
        keywords: ["gaming", "deals", "smartgo"],
        score: 85,
        suggestions: ["Add meta description keyword 'best price'"]
      };
    } else if (prompt.toLowerCase().includes("compare")) {
      mockData = {
        comparisonTable: [
          { feature: "RAM", product1: "12GB", product2: "8GB" },
          { feature: "Battery", product1: "5000mAh", product2: "4500mAh" }
        ],
        verdict: "Product 1 is superior for power users."
      };
    } else if (prompt.toLowerCase().includes("specifications")) {
      mockData = {
        bullets: [
          "12GB RAM, 256GB SSD",
          "5000mAh Battery",
          "IP68 Waterproof rating"
        ]
      };
    }

    return {
      data: mockData,
      promptTokens: Math.ceil(prompt.length / 4),
      completionTokens: 200
    };
  }
}
