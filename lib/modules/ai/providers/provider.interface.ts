export interface IAIProvider {
  id: string;
  generateText(
    prompt: string,
    systemInstruction?: string,
    options?: any
  ): Promise<{
    text: string;
    promptTokens: number;
    completionTokens: number;
  }>;
  generateStructuredOutput(
    prompt: string,
    systemInstruction: string,
    schema: any,
    options?: any
  ): Promise<{
    data: any;
    promptTokens: number;
    completionTokens: number;
  }>;
}
