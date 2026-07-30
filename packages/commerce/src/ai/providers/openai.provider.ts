import { IAIProvider } from "./provider.interface";

export class OpenAIProvider implements IAIProvider {
  id = "OPENAI";

  async generateText(prompt: string, systemInstruction?: string, options?: any): Promise<{
    text: string;
    promptTokens: number;
    completionTokens: number;
  }> {
    throw new Error("OpenAIProvider stub not implemented yet. Configure GEMINI as active provider.");
  }

  async generateStructuredOutput(prompt: string, systemInstruction: string, schema: any, options?: any): Promise<{
    data: any;
    promptTokens: number;
    completionTokens: number;
  }> {
    throw new Error("OpenAIProvider stub not implemented yet. Configure GEMINI as active provider.");
  }
}
