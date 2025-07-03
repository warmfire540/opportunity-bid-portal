import OpenAI from "openai";

import type { TypedAiResponse } from "../../types";

import { parseAiResponse } from "./response-parser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export async function processAiPrompt(
  prompt: string,
  systemPrompt: string,
  pageIndex?: number
): Promise<{ aiResponse: string; typedAiResponse: TypedAiResponse | undefined }> {
  console.log(
    `[STEP EXECUTION] Sending request to OpenAI${pageIndex != null ? ` for page ${pageIndex + 1}` : ""}...`
  );
  console.log(`[STEP EXECUTION] Full prompt length: ${prompt.length} characters`);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 4000,
    temperature: 0.7,
  });

  const aiResponse = completion.choices[0]?.message?.content ?? "No response from AI";
  console.log(
    `[STEP EXECUTION] AI Response received${pageIndex != null ? ` for page ${pageIndex + 1}` : ""} (${aiResponse.length} characters):`
  );

  // Parse the AI response to extract typed data
  const typedAiResponse = parseAiResponse(aiResponse, pageIndex);

  return {
    aiResponse,
    typedAiResponse,
  };
}
