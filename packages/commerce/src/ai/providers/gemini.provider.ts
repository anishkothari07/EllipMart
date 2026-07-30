import { IAIProvider } from "./provider.interface";

export class GeminiProvider implements IAIProvider {
  id = "GEMINI";

  private getApiKey(): string {
    const key = process.env.GEMINI_API_KEY || "";
    return key;
  }

  async generateText(prompt: string, systemInstruction?: string, options?: any): Promise<{
    text: string;
    promptTokens: number;
    completionTokens: number;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in .env file");
    }

    const modelName = options?.model || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const body: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    if (options?.json) {
      body.generationConfig = {
        responseMimeType: "application/json"
      };
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: status ${res.status} - ${errText}`);
      }

      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Approximate tokens if not provided
      const promptTokens = Math.ceil(prompt.length / 4);
      const completionTokens = Math.ceil(text.length / 4);

      return { text, promptTokens, completionTokens };
    } catch (err: any) {
      console.error("[GeminiProvider] Error generating text:", err.message);
      throw err;
    }
  }

  async generateStructuredOutput(prompt: string, systemInstruction: string, schema: any, options?: any): Promise<{
    data: any;
    promptTokens: number;
    completionTokens: number;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in .env");
    }

    const modelName = options?.model || "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const body: any = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error: status ${res.status} - ${errText}`);
      }

      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const promptTokens = Math.ceil(prompt.length / 4);
      const completionTokens = Math.ceil(text.length / 4);

      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("[GeminiProvider] Failed to parse output JSON, returning raw text inside object.");
        data = { rawText: text };
      }

      return { data, promptTokens, completionTokens };
    } catch (err: any) {
      console.error("[GeminiProvider] Error generating structured output:", err.message);
      throw err;
    }
  }
}
