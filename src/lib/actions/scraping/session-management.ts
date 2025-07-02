"use server";

import { chromium } from "playwright";

import { createClient } from "@lib/supabase/server";

import { getScrapeConfiguration } from "./crud";
import { executeStep } from "./step-execution";
import type {
  BrowserSession,
  StepExecutionResponse,
  StartExecutionResponse,
  CleanupSessionResponse,
} from "./types";

// In-memory store for browser sessions (in production, use Redis or similar)
const browserSessions = new Map<string, BrowserSession>();

export async function startStepExecutionAction(
  configurationId: string
): Promise<StartExecutionResponse> {
  console.log(`[STEP EXECUTION] Starting execution for configuration: ${configurationId}`);

  try {
    // Get the configuration
    const configuration = await getScrapeConfiguration(configurationId);
    if (configuration == null) {
      throw new Error(`Configuration not found: ${configurationId}`);
    }

    const steps = Array.isArray(configuration.steps) ? configuration.steps : [];

    // Initialize browser and page
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const supabase = createClient();

    // Store the session with a separator that won't conflict with GUIDs
    const sessionId = `${configurationId}::${Date.now()}`;
    browserSessions.set(sessionId, {
      browser,
      page,
      supabase,
      startTime: Date.now(),
    });

    console.log(`[STEP EXECUTION] Session created: ${sessionId} with ${steps.length} steps`);

    return {
      success: true,
      sessionId,
      totalSteps: steps.length,
    };
  } catch (error: unknown) {
    console.error(`[STEP EXECUTION] Error starting execution:`, error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while starting execution";

    return {
      success: false,
      error: errorMessage,
      sessionId: "",
      totalSteps: 0,
    };
  }
}

export async function executeNextStepAction(
  sessionId: string,
  stepIndex: number
): Promise<StepExecutionResponse> {
  console.log(`[STEP EXECUTION] Executing step ${stepIndex} for session: ${sessionId}`);

  try {
    // Get the session
    const session = browserSessions.get(sessionId);
    if (session == null) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const { browser, page, supabase } = session;

    // Get the configuration ID from session ID
    // Session ID format: ${configurationId}::${timestamp}
    // We need to extract everything before the last double colon
    const lastColonIndex = sessionId.lastIndexOf("::");
    if (lastColonIndex === -1) {
      throw new Error(`Invalid session ID format: ${sessionId}`);
    }
    const configurationId = sessionId.substring(0, lastColonIndex);

    console.log(
      `[STEP EXECUTION] Extracted configuration ID: ${configurationId} from session: ${sessionId}`
    );

    // Get the configuration
    const configuration = await getScrapeConfiguration(configurationId);
    if (configuration == null) {
      throw new Error(`Configuration not found: ${configurationId}`);
    }

    const steps = Array.isArray(configuration.steps) ? configuration.steps : [];

    if (stepIndex >= steps.length) {
      // Clean up session
      await browser.close();
      browserSessions.delete(sessionId);

      return {
        success: true,
        isComplete: true,
        currentStep: steps.length,
        totalSteps: steps.length,
      };
    }

    const step = steps[stepIndex];
    console.log(`[STEP EXECUTION] Executing step ${stepIndex + 1}/${steps.length}: ${step.name}`);

    // Execute the step
    const stepResult = await executeStep(
      step,
      configuration,
      page,
      supabase,
      session.previousStepResults
    );

    // Store the step result for the next step
    session.previousStepResults ??= [];
    session.previousStepResults.push(stepResult);

    if (!stepResult.success) {
      // Clean up session on error
      await browser.close();
      browserSessions.delete(sessionId);

      throw new Error(`Step ${stepIndex + 1} failed: ${stepResult.error}`);
    }

    const isComplete = stepIndex === steps.length - 1;

    if (isComplete) {
      // Clean up session when complete
      await browser.close();
      browserSessions.delete(sessionId);
      console.log(`[STEP EXECUTION] Session ${sessionId} completed and cleaned up`);
    }

    console.log(`[STEP EXECUTION] Step ${stepIndex + 1} completed successfully`);

    return {
      success: true,
      isComplete,
      currentStep: stepIndex + 1,
      totalSteps: steps.length,
      downloadUrl: stepResult.downloadUrl,
      stepName: step.name,
      result: stepResult,
    };
  } catch (error: unknown) {
    console.error(`[STEP EXECUTION] Error during step execution:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred during step execution";

    // Clean up session on error
    const session = browserSessions.get(sessionId);
    if (session != null) {
      try {
        await session.browser.close();
      } catch (closeError) {
        console.error(`[STEP EXECUTION] Error closing browser:`, closeError);
      }
      browserSessions.delete(sessionId);
    }

    return {
      success: false,
      error: errorMessage,
      isComplete: false,
      currentStep: stepIndex,
      totalSteps: 0,
    };
  }
}

export async function cleanupSessionAction(sessionId: string): Promise<CleanupSessionResponse> {
  try {
    const session = browserSessions.get(sessionId);
    if (session != null) {
      await session.browser.close();
      browserSessions.delete(sessionId);
      console.log(`[STEP EXECUTION] Session ${sessionId} cleaned up`);
    }

    return { success: true };
  } catch (error: unknown) {
    console.error(`[STEP EXECUTION] Error cleaning up session:`, error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while cleaning up session";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
