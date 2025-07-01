import type { Page } from "playwright";

import type { PlaywrightStep } from "../../types";

export async function handleSelectAction(subStep: PlaywrightStep, page: Page): Promise<void> {
  if (subStep.selector == null) {
    console.warn(`[STEP EXECUTION] No selector provided for select action`);
    return;
  }

  console.log(
    `[STEP EXECUTION] Selecting option "${subStep.value}" from selector "${subStep.selector}"`
  );
  await page.selectOption(subStep.selector, subStep.value ?? "");
}
