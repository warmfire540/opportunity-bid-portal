import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ScrapeDownloadStep,
  StepExecutionResult,
  TypedAiResponse,
  PageTextContent,
} from "../types";

import {
  downloadAndProcessFile,
  buildPromptForPage,
  buildPromptForDownloadedFilesOnly,
  processAiPrompt,
} from "./ai-prompt-actions";

export async function executeAiPromptStep(
  step: ScrapeDownloadStep,
  supabase: SupabaseClient,
  previousStepResult?: StepExecutionResult
): Promise<StepExecutionResult> {
  try {
    console.log(`[STEP EXECUTION] Executing AI prompt step: ${step.name}`);

    if (step.ai_prompt_data == null || step.ai_prompt_data.length === 0) {
      console.warn(`[STEP EXECUTION] No AI prompt data found for step: ${step.name}`);
      return { success: true };
    }

    const aiPrompt = step.ai_prompt_data[0];
    if (aiPrompt.prompt === "") {
      console.warn(`[STEP EXECUTION] No prompt found in AI prompt step: ${step.name}`);
      return { success: true };
    }

    console.log(`[STEP EXECUTION] Processing AI prompt: ${aiPrompt.prompt.substring(0, 100)}...`);

    // Collect downloaded files and text content from the immediate previous step only
    let downloadedFilesContent = "";
    const pageTextContents: PageTextContent[] = [];

    if (previousStepResult != null) {
      console.log(`[STEP EXECUTION] Processing immediate previous step result`);

      // Handle downloaded files from the previous step
      if (previousStepResult.downloadPath != null && previousStepResult.downloadPath !== "") {
        downloadedFilesContent = await downloadAndProcessFile(
          previousStepResult.downloadPath,
          supabase
        );
      }

      // Handle text content from the previous step
      if (
        previousStepResult.pageTextContent != null &&
        previousStepResult.pageTextContent.length > 0
      ) {
        console.log(
          `[STEP EXECUTION] Found ${previousStepResult.pageTextContent.length} pages with text content from previous step`
        );
        pageTextContents.push(...previousStepResult.pageTextContent);
      }
    }

    // Process AI prompt based on available content
    if (pageTextContents.length > 0) {
      // Process all pages
      console.log(`[STEP EXECUTION] Processing ${pageTextContents.length} pages`);

      const aiResults: StepExecutionResult[] = [];

      for (let i = 0; i < pageTextContents.length; i++) {
        const pageContent = pageTextContents[i];
        console.log(
          `[STEP EXECUTION] Processing page ${i + 1}/${pageTextContents.length}: ${pageContent.pageId ?? "unknown"}`
        );

        const fullPrompt = buildPromptForPage(aiPrompt.prompt, pageContent, downloadedFilesContent);

        const { aiResponse, typedAiResponse } = await processAiPrompt(
          fullPrompt,
          aiPrompt.system_prompt ?? "",
          i
        );

        aiResults.push({
          success: true,
          aiResponse: aiResponse,
          typedAiResponse: typedAiResponse,
        });
      }

      // Combine all AI results into a single result
      const combinedTypedAiResponse: TypedAiResponse | undefined =
        aiResults.length > 0
          ? {
              type: aiResults[0]?.typedAiResponse?.type ?? "id",
              values: aiResults.flatMap((result) => result.typedAiResponse?.values ?? []),
            }
          : undefined;

      // Combine all AI responses into a single JSON response that can be parsed by subsequent steps
      const combinedAiResponses = aiResults.map((result, index) => ({
        pageIndex: index,
        pageId: pageTextContents[index]?.pageId ?? `page-${index + 1}`,
        aiResponse: result.aiResponse,
        typedAiResponse: result.typedAiResponse,
      }));

      console.log(
        `[STEP EXECUTION] AI Prompt step completed successfully for ${pageTextContents.length} pages`
      );
      return {
        success: true,
        aiResponse: JSON.stringify(combinedAiResponses),
        typedAiResponse: combinedTypedAiResponse,
      };
    } else if (downloadedFilesContent !== "") {
      // Process downloaded files only
      console.log(`[STEP EXECUTION] Processing downloaded files only`);

      const fullPrompt = buildPromptForDownloadedFilesOnly(aiPrompt.prompt, downloadedFilesContent);

      const { aiResponse, typedAiResponse } = await processAiPrompt(
        fullPrompt,
        aiPrompt.system_prompt ?? ""
      );

      console.log(`[STEP EXECUTION] AI Prompt step completed successfully for downloaded files`);
      return {
        success: true,
        aiResponse: aiResponse,
        typedAiResponse: typedAiResponse,
      };
    } else {
      // No content to process
      console.log(`[STEP EXECUTION] No content to process for AI prompt step`);
      return { success: true };
    }
  } catch (error: unknown) {
    console.error(`[STEP EXECUTION] AI prompt step failed:`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during AI prompt step execution",
    };
  }
}
