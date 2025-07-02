"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Browser, Page } from "playwright";
import { chromium } from "playwright";

import { createClient } from "@lib/supabase/server";

import { getScrapeConfiguration } from "./crud";
import { executeStep } from "./step-execution";
import type { StepExecutionResult } from "./types";

export async function executeConfigurationAction(configurationId: string): Promise<{
  success: boolean;
  error?: string;
  executionTimeMs?: number;
  stepsExecuted?: number;
  stepResults?: StepExecutionResult[];
}> {
  const startTime = Date.now();
  console.log(`[CONFIGURATION EXECUTION] Starting execution for configuration: ${configurationId}`);

  let browser: Browser | null = null;
  let page: Page | null = null;
  let supabase: SupabaseClient | null = null;

  try {
    // Get the configuration
    const configuration = await getScrapeConfiguration(configurationId);
    if (configuration == null) {
      throw new Error(`Configuration not found: ${configurationId}`);
    }

    const steps = Array.isArray(configuration.steps) ? configuration.steps : [];
    console.log(`[CONFIGURATION EXECUTION] Found ${steps.length} steps to execute`);

    // Initialize browser and page
    browser = await chromium.launch();
    page = await browser.newPage();

    // Initialize Supabase client
    supabase = createClient();

    let stepsExecuted = 0;
    let stepResults: StepExecutionResult[] = [];

    // Execute each step one by one
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(
        `[CONFIGURATION EXECUTION] Executing step ${i + 1}/${steps.length}: ${step.name}`
      );

      // Execute the step using the action
      const stepResult = await executeStep(step, configuration, page, supabase, stepResults);
      stepResults.push(stepResult);

      if (!stepResult.success) {
        throw new Error(`Step ${i + 1} failed: ${stepResult.error}`);
      }

      stepsExecuted++;

      console.log(`[CONFIGURATION EXECUTION] Step ${i + 1} completed successfully`);
    }

    const executionTimeMs = Date.now() - startTime;
    console.log(
      `[CONFIGURATION EXECUTION] All steps completed successfully in ${executionTimeMs}ms`
    );

    return {
      success: true,
      executionTimeMs,
      stepsExecuted,
      stepResults,
    };
  } catch (error: unknown) {
    const executionTimeMs = Date.now() - startTime;
    console.error(`[CONFIGURATION EXECUTION] Error during execution:`, error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred during configuration execution";
    return {
      success: false,
      error: errorMessage,
      executionTimeMs,
      stepsExecuted: 0,
    };
  } finally {
    // Clean up browser
    if (browser != null) {
      try {
        await browser.close();
        console.log("[CONFIGURATION EXECUTION] Browser closed successfully");
      } catch (error) {
        console.error("[CONFIGURATION EXECUTION] Error closing browser:", error);
      }
    }
  }
}
