import type { SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "playwright";

import type {
  ScrapeConfiguration,
  ScrapeDownloadStep,
  StepExecutionResult,
  PlaywrightStep,
} from "../types";

import {
  handleGotoAction,
  handleClickAction,
  handleSaveDownloadAction,
  handleWaitAction,
  handleTypeAction,
  handleSelectAction,
  handleGetInnerTextAction,
  type PlaywrightContext,
} from "./playwright-actions";

async function executeSubStep(
  subStep: PlaywrightStep,
  subStepNumber: number,
  page: Page,
  supabase: SupabaseClient,
  configuration: ScrapeConfiguration,
  step: ScrapeDownloadStep,
  context: PlaywrightContext,
  dynamicValue?: string
): Promise<void> {
  console.log(`[STEP EXECUTION] Executing sub-step ${subStepNumber}: ${subStep.action_type}`);

  switch (subStep.action_type) {
    case "goto":
      await handleGotoAction(subStep, page, configuration, dynamicValue);
      break;

    case "click":
      await handleClickAction(subStep, page);
      break;

    case "waitForDownload":
      console.log(`[STEP EXECUTION] Waiting for download event...`);
      context.downloadPromise = page.waitForEvent("download");
      break;

    case "saveDownload":
      await handleSaveDownloadAction(context, subStep, page, supabase, configuration, step);
      break;

    case "wait":
      await handleWaitAction(subStep, page);
      break;

    case "type":
      await handleTypeAction(subStep, page);
      break;

    case "select":
      await handleSelectAction(subStep, page);
      break;

    case "getInnerText":
      await handleGetInnerTextAction(subStep, page, context);
      break;

    default:
      console.warn(`[STEP EXECUTION] Unknown action type "${subStep.action_type}" - skipping`);
      break;
  }

  console.log(`[STEP EXECUTION] Sub-step ${subStepNumber} completed successfully`);
}

export async function executeSinglePlaywrightStep(
  step: ScrapeDownloadStep,
  configuration: ScrapeConfiguration,
  page: Page,
  supabase: SupabaseClient,
  dynamicValue?: string
): Promise<StepExecutionResult> {
  try {
    console.log(`[STEP EXECUTION] Executing playwright step: ${step.name}`);

    if (step.sub_steps == null || step.sub_steps.length === 0) {
      console.warn(`[STEP EXECUTION] No playwright sub-steps found for step: ${step.name}`);
      return { success: true };
    }

    const context: PlaywrightContext = {
      downloadPromise: null,
      storageObjectId: undefined,
      textResults: [],
    };

    for (let j = 0; j < step.sub_steps.length; j++) {
      const subStep = step.sub_steps[j];
      const subStepNumber = j + 1;

      await executeSubStep(
        subStep,
        subStepNumber,
        page,
        supabase,
        configuration,
        step,
        context,
        dynamicValue
      );
    }

    console.log(`[STEP EXECUTION] Playwright step completed successfully`);
    return {
      success: true,
      storageObjectId: context.storageObjectId,
      downloadPath: context.storageObjectId,
      textResults: context.textResults.length > 0 ? context.textResults : undefined,
    };
  } catch (error: unknown) {
    console.error(`[STEP EXECUTION] Playwright step failed:`, error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during playwright step execution",
    };
  }
}

export async function executePlaywrightStep(
  step: ScrapeDownloadStep,
  configuration: ScrapeConfiguration,
  page: Page,
  supabase: SupabaseClient,
  previousStepResults?: StepExecutionResult[]
): Promise<StepExecutionResult> {
  console.log(`[STEP EXECUTION] Starting execution of playwright step: ${step.name}`);

  // Check if previous step has typed data for dynamic execution
  const valuesFromPreviousStep = (() => {
    if (previousStepResults == null || previousStepResults.length === 0) {
      return [];
    }

    // Get the latest result (last step)
    const latestResult = previousStepResults[previousStepResults.length - 1];

    // First check for typed AI response (new format)
    if (latestResult.typedAiResponse != null) {
      console.log(`[STEP EXECUTION] Found typed AI response: type=${latestResult.typedAiResponse.type}, values=${latestResult.typedAiResponse.values.length}`);
      return latestResult.typedAiResponse.values.filter((value) => typeof value === "string" && value.length > 0);
    }

    // Fallback to legacy parsing for backward compatibility
    if (latestResult.aiResponse != null && latestResult.aiResponse.length > 0) {
      try {
        const parsedResponse = JSON.parse(latestResult.aiResponse);
        if (Array.isArray(parsedResponse)) {
          console.log(`[STEP EXECUTION] Found legacy array response with ${parsedResponse.length} items`);
          return parsedResponse.filter((url) => typeof url === "string" && url.length > 0);
        }
      } catch (error) {
        console.warn(`[STEP EXECUTION] Failed to parse aiResponse as JSON:`, error);
      }
    }

    return [];
  })();

  if (valuesFromPreviousStep.length > 0) {
    console.log(
      `[STEP EXECUTION] Found ${valuesFromPreviousStep.length} values from previous step, executing playwright step for each value`
    );

    const results: StepExecutionResult[] = [];
    for (const value of valuesFromPreviousStep) {
      console.log(`[STEP EXECUTION] Executing playwright step for value: ${value}`);
      const result = await executeSinglePlaywrightStep(step, configuration, page, supabase, value);
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
    return await executeSinglePlaywrightStep(step, configuration, page, supabase);
  }
}
