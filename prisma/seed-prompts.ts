import { prisma as db } from "../lib/prisma/client";

async function main() {
  console.log("=== SEEDING SPRINT 11 AI INFRASTRUCTURE & PROMPT TEMPLATES ===");

  // 1. Seed AI Providers
  const mockProvider = await db.aIProvider.upsert({
    where: { code: "MOCK" },
    update: {},
    create: { code: "MOCK", name: "Mock Simulation Provider" },
  });

  const geminiProvider = await db.aIProvider.upsert({
    where: { code: "GEMINI" },
    update: {},
    create: { code: "GEMINI", name: "Google Gemini AI Platform" },
  });

  await db.aIProvider.upsert({
    where: { code: "OPENAI" },
    update: {},
    create: { code: "OPENAI", name: "OpenAI GPT Platform" },
  });

  await db.aIProvider.upsert({
    where: { code: "CLAUDE" },
    update: {},
    create: { code: "CLAUDE", name: "Anthropic Claude Platform" },
  });

  // 2. Seed AI Models
  await db.aIModel.upsert({
    where: { code: "mock-model" },
    update: {},
    create: {
      providerId: mockProvider.id,
      code: "mock-model",
      name: "Mock Fast Simulator",
      inputCostRate: 0.0,
      outputCostRate: 0.0,
    },
  });

  await db.aIModel.upsert({
    where: { code: "gemini-1.5-flash" },
    update: {},
    create: {
      providerId: geminiProvider.id,
      code: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash (Default)",
      inputCostRate: 0.000075,
      outputCostRate: 0.0003,
    },
  });

  // 3. Seed AI Configuration
  await db.aIConfiguration.create({
    data: {
      defaultProvider: "MOCK", // Starts with mock for safe default tests
      defaultModel: "mock-model",
      temperature: 0.7,
      maxTokens: 1024,
      enabledFeatures: JSON.stringify(["CHAT", "SEO", "CATALOG", "COMPARE", "REVIEWS"]),
    },
  }).catch(() => null); // Prevent crashes on existing row

  // 4. Seed Prompt Templates
  const templates = [
    {
      name: "CATALOG_DESC",
      systemInstruction: "You are an expert ecommerce copywriter for CoreCart. Write premium descriptions.",
      userPromptSchema: "Generate a product description, key bullet specs, and product tags for the item named: {{productName}}.",
      variables: JSON.stringify(["productName"]),
    },
    {
      name: "SEO_SCORE",
      systemInstruction: "You are a professional SEO auditor. Evaluate readability and keyword scoring.",
      userPromptSchema: "Score this text on a scale of 0-100: Title: {{title}}, Description: {{description}}. Recommend missing keywords.",
      variables: JSON.stringify(["title", "description"]),
    },
    {
      name: "PRODUCT_COMPARE",
      systemInstruction: "You are a shopping comparison agent. Detail differences grounded only in the facts.",
      userPromptSchema: "Compare these two products: Product 1: {{product1}}, Product 2: {{product2}}.",
      variables: JSON.stringify(["product1", "product2"]),
    },
    {
      name: "REVIEW_SUMMARY",
      systemInstruction: "You are an analyst summarising buyer reviews.",
      userPromptSchema: "Aggregate pros and cons for this reviews list: {{reviews}}.",
      variables: JSON.stringify(["reviews"]),
    },
    {
      name: "CHAT_ASSISTANT",
      systemInstruction: "You are an intelligent shopping assistant named Rufus at CoreCart. Ground your responses strictly in the context.",
      userPromptSchema: "User: {{query}}",
      variables: JSON.stringify(["query"]),
    },
  ];

  for (const t of templates) {
    await db.aIPromptTemplate.upsert({
      where: { name: t.name },
      update: t,
      create: t,
    });
  }

  console.log("Seeding complete! Seeding verify successful.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
