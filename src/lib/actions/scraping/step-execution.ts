"use server";
import { executeAiPromptStep } from "./step-execution/ai-prompt-step";
import { executeLinksAnalysisStep } from "./step-execution/links-analysis-step";
import { executePlaywrightStep } from "./step-execution/playwright-step";
import type { ScrapeConfiguration, ScrapeDownloadStep, StepExecutionResult } from "./types";

export async function executeStep(
  step: ScrapeDownloadStep,
  configuration: ScrapeConfiguration,
  browser: any,
  page: any,
  supabase: any,
  previousStepResults?: StepExecutionResult[]
): Promise<StepExecutionResult> {
  console.log(`[STEP EXECUTION] Starting execution of step: ${step.name} (${step.step_type})`);

  switch (step.step_type) {
    case "playwright": {
      // Check if previous step has URL data for dynamic execution
      const urlsFromPreviousStep =
        (previousStepResults ?? [])
          .flatMap((result) => result.urlArray ?? [])
          .filter((url) => url != null && url.length > 0);

      if (urlsFromPreviousStep.length > 0) {
        console.log(
          `[STEP EXECUTION] Found ${urlsFromPreviousStep.length} URLs from previous step, executing playwright step for each URL`
        );

        const results: StepExecutionResult[] = [];
        for (const url of urlsFromPreviousStep) {
          console.log(`[STEP EXECUTION] Executing playwright step for URL: ${url}`);
          const result = await executePlaywrightStep(
            step,
            configuration,
            browser,
            page,
            supabase,
            url
          );
          results.push(result);
        }

        // Combine results
        return {
          success: results.every((r) => r.success),
          error: results.find((r) => !r.success)?.error,
          storageObjectId: results.find((r) => r.storageObjectId != null)?.storageObjectId,
          downloadPath: results.find((r) => r.downloadPath != null)?.downloadPath,
          textResults: results.flatMap((r) => r.textResults ?? []),
        };
      } else {
        return await executePlaywrightStep(step, configuration, browser, page, supabase);
      }
    }
    case "ai_prompt":
      return await executeAiPromptStep(step, configuration, supabase, previousStepResults);
    case "links_analysis":
      return await executeLinksAnalysisStep(step);
    default:
      console.warn(`[STEP EXECUTION] Unknown step type "${step.step_type}" - skipping`);
      return {
        success: false,
        error: `Unknown step type: ${step.step_type}`,
      };
  }
}
