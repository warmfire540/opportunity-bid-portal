"use server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "playwright";

import { executeAiPromptStep } from "./step-execution/ai-prompt-step";
import { executeCreateOpportunityStep } from "./step-execution/create-opportunity-step";
import { executePlaywrightStep } from "./step-execution/playwright-step";
import type { ScrapeConfiguration, ScrapeDownloadStep, StepExecutionResult } from "./types";

export async function executeStep(
  step: ScrapeDownloadStep,
  configuration: ScrapeConfiguration,
  page: Page,
  supabase: SupabaseClient,
  previousStepResults?: StepExecutionResult[]
): Promise<StepExecutionResult> {
  console.log(`[STEP EXECUTION] Starting execution of step: ${step.name} (${step.step_type})`);

  switch (step.step_type) {
    case "playwright": {
      return await executePlaywrightStep(step, configuration, page, supabase, previousStepResults);
    }
    case "ai_prompt":
      return await executeAiPromptStep(step, configuration, supabase, previousStepResults);
    case "create_opportunity":
      return await executeCreateOpportunityStep(step, configuration, supabase, previousStepResults);
    default:
      console.warn(`[STEP EXECUTION] Unknown step type "${step.step_type}" - skipping`);
      return {
        success: false,
        error: `Unknown step type: ${step.step_type}`,
      };
  }
}
