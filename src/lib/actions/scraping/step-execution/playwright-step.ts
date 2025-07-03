import type { SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "playwright";

import type {
  ScrapeConfiguration,
  ScrapeDownloadStep,
  StepExecutionResult,
  PlaywrightStep,
  PageTextContent,
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

    case "saveDownload":
      await handleSaveDownloadAction(context, subStep, page, supabase, configuration, step);
      break;

    case "wait":
      await handleWaitAction(subStep, page);
      break;

    case "type":
      await handleTypeAction(subStep, page, dynamicValue);
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

    // Convert to new structure
    const pageTextContent: PageTextContent | undefined =
      context.textResults.length > 0
        ? {
            pageId: dynamicValue ?? "single-page",
            content: context.textResults,
          }
        : undefined;

    return {
      success: true,
      storageObjectId: context.storageObjectId,
      downloadPath: context.storageObjectId,
      pageTextContent: pageTextContent != null ? [pageTextContent] : undefined,
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
  previousStepResult?: StepExecutionResult
): Promise<StepExecutionResult> {
  console.log(`[STEP EXECUTION] Starting execution of playwright step: ${step.name}`);

  // Check if previous step has typed data for dynamic execution
  const typedDataFromPreviousStep = previousStepResult?.typedAiResponse ?? null;

  if (typedDataFromPreviousStep != null && typedDataFromPreviousStep.values.length > 0) {
    console.log(
      `[STEP EXECUTION] Found ${typedDataFromPreviousStep.values.length} values of type "${typedDataFromPreviousStep.type}" from previous step`
    );

    // For type "id", we should execute for each ID and treat each as a separate page
    // For type "url", we should execute for each URL
    if (typedDataFromPreviousStep.type === "id") {
      console.log(
        `[STEP EXECUTION] Executing playwright step for each ID value (treating each as separate page)`
      );
      const results: StepExecutionResult[] = [];
      for (const value of typedDataFromPreviousStep.values) {
        console.log(`[STEP EXECUTION] Executing playwright step for ID: ${value}`);
        const result = await executeSinglePlaywrightStep(
          step,
          configuration,
          page,
          supabase,
          value
        );
        results.push(result);
      }

      // For IDs, each result represents a separate page (like URLs)
      const pageTextContents: PageTextContent[] = results
        .filter((r) => r.pageTextContent != null && r.pageTextContent.length > 0)
        .flatMap((r) => r.pageTextContent!);

      return {
        success: results.every((r) => r.success),
        error: results.find((r) => !r.success)?.error,
        storageObjectId: results.find((r) => r.storageObjectId != null)?.storageObjectId,
        downloadPath: results.find((r) => r.downloadPath != null)?.downloadPath,
        pageTextContent: pageTextContents.length > 0 ? pageTextContents : undefined,
      };
    } else {
      console.log(`[STEP EXECUTION] Executing playwright step for each URL value`);
      const results: StepExecutionResult[] = [];
      for (const value of typedDataFromPreviousStep.values) {
        console.log(`[STEP EXECUTION] Executing playwright step for URL: ${value}`);
        const result = await executeSinglePlaywrightStep(
          step,
          configuration,
          page,
          supabase,
          value
        );
        results.push(result);
      }

      // Combine results - for URLs, each result represents a separate page
      const pageTextContents: PageTextContent[] = results
        .filter((r) => r.pageTextContent != null && r.pageTextContent.length > 0)
        .flatMap((r) => r.pageTextContent!);

      return {
        success: results.every((r) => r.success),
        error: results.find((r) => !r.success)?.error,
        storageObjectId: results.find((r) => r.storageObjectId != null)?.storageObjectId,
        downloadPath: results.find((r) => r.downloadPath != null)?.downloadPath,
        pageTextContent: pageTextContents.length > 0 ? pageTextContents : undefined,
      };
    }
  }

  // No dynamic data or unsupported type, execute normally
  return await executeSinglePlaywrightStep(step, configuration, page, supabase);
}
