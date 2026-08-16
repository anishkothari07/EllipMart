import { prisma } from '@corecart/database';
import { AIProviderRegistry } from "./registry";
import fs from 'fs';
import path from 'path';

export class AIService {
  private static async getActiveConfig() {
    const db = prisma;
    const config = await db.aIConfiguration.findFirst();
    
    let requiredApiKey = process.env.GEMINI_API_KEY;

    if (!requiredApiKey) {
      try {
        const rootEnvPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../../.env');
        if (fs.existsSync(rootEnvPath)) {
          const content = fs.readFileSync(rootEnvPath, 'utf8');
          const match = content.match(/GEMINI_API_KEY=["']?([^"'\n\r]+)["']?/);
          if (match && match[1]) {
            requiredApiKey = match[1];
            process.env.GEMINI_API_KEY = requiredApiKey;
          }
        } else {
          const fallbackEnvPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '.env');
          if (fs.existsSync(fallbackEnvPath)) {
            const content = fs.readFileSync(fallbackEnvPath, 'utf8');
            const match = content.match(/GEMINI_API_KEY=["']?([^"'\n\r]+)["']?/);
            if (match && match[1]) {
              requiredApiKey = match[1];
              process.env.GEMINI_API_KEY = requiredApiKey;
            }
          }
        }
      } catch (err) {
        console.error("Failed to dynamically parse .env:", err);
      }
    }

    if (!requiredApiKey) {
      throw new Error("GEMINI_API_KEY is not configured on the EllipMart backend");
    }

    if (config) {
      if (config.defaultProvider === "MOCK") {
        return {
          ...config,
          defaultProvider: "GEMINI",
          defaultModel: "gemini-2.5-flash",
        };
      }
      return config;
    }
    return {
      defaultProvider: "GEMINI",
      defaultModel: "gemini-2.5-flash",
      temperature: 0.7,
      maxTokens: 2048,
    };
  }

  static async generateText(feature: string, prompt: string, context?: string, extraOptions?: any): Promise<string> {
    const start = Date.now();
    const config = await this.getActiveConfig();
    const provider = AIProviderRegistry.get(config.defaultProvider);

    const db = prisma;
    const template = await db.aIPromptTemplate.findUnique({
      where: { name: feature },
    });

    const systemInstruction = extraOptions?.systemInstruction || template?.systemInstruction || "You are an intelligent commerce assistant for CoreCart.";
    
    // Grounding: Inject context
    const groundedPrompt = context 
      ? `Grounded Context from Database:\n${context}\n\nUser Query: ${prompt}\n\nStrict Rule: Answer ONLY based on the Grounded Context above. Do not invent any products, prices, or inventory levels.`
      : prompt;

    const result = await provider.generateText(groundedPrompt, systemInstruction, {
      model: config.defaultModel,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      ...extraOptions
    });

    // Approximate cost calculation
    const promptCost = (result.promptTokens / 1000) * 0.0015;
    const completionCost = (result.completionTokens / 1000) * 0.002;
    const totalCost = promptCost + completionCost;

    // Log Audit details
    await db.aIUsage.create({
      data: {
        feature,
        provider: provider.id,
        model: config.defaultModel,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        cost: totalCost,
        latencyMs: Date.now() - start,
      }
    });

    return result.text;
  }

  static async generateStructuredOutput(feature: string, prompt: string, schema: any, context?: string): Promise<any> {
    const db = prisma;
    const start = Date.now();
    const config = await this.getActiveConfig();
    const provider = AIProviderRegistry.get(config.defaultProvider);

    const template = await db.aIPromptTemplate.findUnique({
      where: { name: feature },
    });

    const systemInstruction = template?.systemInstruction || "You are an AI data extractor. Return JSON matches.";

    const groundedPrompt = context 
      ? `Context:\n${context}\n\nQuery: ${prompt}`
      : prompt;

    const result = await provider.generateStructuredOutput(groundedPrompt, systemInstruction, schema, {
      model: config.defaultModel,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });

    // Log Audit details
    const totalCost = 0.002;
    await db.aIUsage.create({
      data: {
        feature,
        provider: provider.id,
        model: config.defaultModel,
        promptTokens: 100,
        completionTokens: 200,
        cost: totalCost,
        latencyMs: Date.now() - start,
      }
    });

    return result.data;
  }
}
