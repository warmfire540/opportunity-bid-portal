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
    case "playwright":
      return await executePlaywrightStep(step, configuration, browser, page, supabase);
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
