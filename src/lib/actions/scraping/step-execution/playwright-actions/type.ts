import type { Page } from "playwright";

import type { PlaywrightStep } from "../../types";

export async function handleTypeAction(subStep: PlaywrightStep, page: Page): Promise<void> {
  if (subStep.selector == null) {
    console.warn(`[STEP EXECUTION] No selector provided for type action`);
    return;
  }

  console.log(`[STEP EXECUTION] Typing "${subStep.value}" into selector "${subStep.selector}"`);
  await page.fill(subStep.selector, subStep.value ?? "");
}
