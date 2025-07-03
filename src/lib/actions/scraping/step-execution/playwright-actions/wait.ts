import type { Page } from "playwright";

import type { PlaywrightStep } from "../../types";

export async function handleWaitAction(subStep: PlaywrightStep, page: Page): Promise<void> {
  if (subStep.value === "networkidle") {
    console.log(`[STEP EXECUTION] Waiting for network to be idle`);
    await page.waitForLoadState("networkidle");
  } else {
    const waitTime = subStep.wait_time ?? 1000;
    console.log(`[STEP EXECUTION] Waiting for ${waitTime}ms`);
    await page.waitForTimeout(waitTime);
  }
}
