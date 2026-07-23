import { IAIProvider } from "./providers/provider.interface";
import { GeminiProvider } from "./providers/gemini.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { ClaudeProvider } from "./providers/claude.provider";
import { MockProvider } from "./providers/mock.provider";

export class AIProviderRegistry {
  private static providers: Map<string, IAIProvider> = new Map();

  static register(code: string, provider: IAIProvider) {
    this.providers.set(code.toUpperCase(), provider);
  }

  static get(code: string): IAIProvider {
    const prov = this.providers.get(code.toUpperCase());
    if (!prov) {
      return this.providers.get("MOCK") || new MockProvider();
    }
    return prov;
  }
}

// Register default implementations
AIProviderRegistry.register("GEMINI", new GeminiProvider());
AIProviderRegistry.register("OPENAI", new OpenAIProvider());
AIProviderRegistry.register("CLAUDE", new ClaudeProvider());
AIProviderRegistry.register("MOCK", new MockProvider());
