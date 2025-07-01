import OpenAI from "openai";

import type { ScrapeConfiguration, ScrapeDownloadStep, StepExecutionResult } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

export async function executeAiPromptStep(
  step: ScrapeDownloadStep,
  configuration: ScrapeConfiguration,
  supabase: any,
  previousStepResults?: StepExecutionResult[]
): Promise<StepExecutionResult> {
  try {
    console.log(`[STEP EXECUTION] Executing AI prompt step: ${step.name}`);

    if (!step.ai_prompt_data || step.ai_prompt_data.length === 0) {
      console.warn(`[STEP EXECUTION] No AI prompt data found for step: ${step.name}`);
      return { success: true };
    }

    const aiPrompt = step.ai_prompt_data[0];
    if (!aiPrompt.prompt) {
      console.warn(`[STEP EXECUTION] No prompt found in AI prompt step: ${step.name}`);
      return { success: true };
    }

    console.log(`[STEP EXECUTION] Processing AI prompt: ${aiPrompt.prompt.substring(0, 100)}...`);

    // Collect downloaded files from previous steps
    let downloadedFilesContent = "";
    if (previousStepResults && previousStepResults.length > 0) {
      console.log(`[STEP EXECUTION] Found ${previousStepResults.length} previous step results`);
      for (const result of previousStepResults) {
        if (result.storageObjectId) {
          try {
            console.log(`[STEP EXECUTION] Reading file from storage: ${result.storageObjectId}`);
            const { data: fileData, error: downloadError } = await supabase.storage
              .from("scrape-downloads")
              .download(`${configuration.id}/${result.storageObjectId}`);
            if (downloadError) {
              console.warn(
                `[STEP EXECUTION] Failed to download file ${result.storageObjectId}:`,
                downloadError
              );
              continue;
            }
            const fileText = await fileData.text();
            downloadedFilesContent += `\n\n--- File: ${result.storageObjectId} ---\n${fileText}`;
            console.log(
              `[STEP EXECUTION] Successfully read file ${result.storageObjectId} (${fileText.length} characters)`
            );
          } catch (error) {
            console.warn(`[STEP EXECUTION] Error reading file ${result.storageObjectId}:`, error);
          }
        }
      }
    }

    let fullPrompt = aiPrompt.prompt;
    if (downloadedFilesContent) {
      fullPrompt = `${aiPrompt.prompt}\n\n--- Downloaded Files Content ---${downloadedFilesContent}`;
    }

    console.log(`[STEP EXECUTION] Sending request to OpenAI...`);
    console.log(`[STEP EXECUTION] Full prompt length: ${fullPrompt.length} characters`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content ?? "No response from AI";
    console.log(`[STEP EXECUTION] AI Response received (${aiResponse.length} characters):`);
    console.log(`[STEP EXECUTION] ${aiResponse.substring(0, 200)}...`);
    console.log(`[STEP EXECUTION] AI Prompt step completed successfully`);
    return {
      success: true,
      aiResponse: aiResponse,
    };
  } catch (error: any) {
    console.error(`[STEP EXECUTION] AI prompt step failed:`, error);
    return {
      success: false,
      error: error.message ?? "An unexpected error occurred during AI prompt step execution",
    };
  }
}
