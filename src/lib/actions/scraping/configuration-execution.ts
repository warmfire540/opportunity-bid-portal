"use server";

import { chromium } from "playwright";
import { createClient } from "@lib/supabase/server";
import type { ScrapeConfiguration } from "./types";
import { getScrapeConfiguration } from "./crud";
import { executeStep } from "./step-execution";

export async function executeConfigurationAction(configurationId: string): Promise<{
  success: boolean;
  error?: string;
  executionTimeMs?: number;
  stepsExecuted?: number;
  downloadUrl?: string;
}> {
  const startTime = Date.now();
  console.log(`[CONFIGURATION EXECUTION] Starting execution for configuration: ${configurationId}`);

  let browser: any = null;
  let page: any = null;
  let supabase: any = null;

  try {
    // Get the configuration
    const configuration = await getScrapeConfiguration(configurationId);
    if (!configuration) {
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
    let finalDownloadUrl: string | undefined;

    // Execute each step one by one
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(
        `[CONFIGURATION EXECUTION] Executing step ${i + 1}/${steps.length}: ${step.name}`
      );

      // Execute the step using the action
      const stepResult = await executeStep(step, configuration, browser, page, supabase);

      if (!stepResult.success) {
        throw new Error(`Step ${i + 1} failed: ${stepResult.error}`);
      }

      stepsExecuted++;

      // Keep track of the last download URL
      if (stepResult.downloadUrl) {
        finalDownloadUrl = stepResult.downloadUrl;
      }

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
      downloadUrl: finalDownloadUrl,
    };
  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    console.error(`[CONFIGURATION EXECUTION] Error during execution:`, error);

    return {
      success: false,
      error: error.message || "An unexpected error occurred during configuration execution",
      executionTimeMs,
      stepsExecuted: 0,
    };
  } finally {
    // Clean up browser
    if (browser) {
      try {
        await browser.close();
        console.log("[CONFIGURATION EXECUTION] Browser closed successfully");
      } catch (error) {
        console.error("[CONFIGURATION EXECUTION] Error closing browser:", error);
      }
    }
  }
}
