import type { Page } from "playwright";

import type { PlaywrightStep } from "../../types";

export async function handleTypeAction(subStep: PlaywrightStep, page: Page): Promise<void> {
  if (subStep.selector == null) {
    console.warn(`[STEP EXECUTION] No selector provided for type action`);
    return;
  }

  if (subStep.selector_type === "role" && subStep.selector.length > 0) {
    console.log(`[STEP EXECUTION] Typing "${subStep.value}" into role textbox "${subStep.selector}"`);
    await page.getByRole("textbox", { name: subStep.selector }).fill(subStep.value ?? "");
  } else {
    console.log(`[STEP EXECUTION] Typing "${subStep.value}" into selector "${subStep.selector}"`);
    await page.fill(subStep.selector, subStep.value ?? "");
  }
}
