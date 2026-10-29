// Confirms each allowed model answers through the Responses API with web search.
// Run: node --env-file=.env.local scripts/check-models.mjs
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const MODELS = ["gpt-6-luna", "gpt-6.1-terra"];

for (const id of MODELS) {
  try {
    const { text } = await generateText({
      model: openai(id),
      prompt: "Responde solo: ok",
      tools: { web_search: openai.tools.webSearch({ searchContextSize: "low" }) },
      maxOutputTokens: 50,
    });
    console.log(`${id}: OK (${text.trim().slice(0, 40)})`);
  } catch (error) {
    console.log(`${id}: FAIL ${error.message}`);
    process.exitCode = 1;
  }
}
