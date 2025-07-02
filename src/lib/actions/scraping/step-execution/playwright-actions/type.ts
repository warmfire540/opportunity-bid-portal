import type { Page } from "playwright";

import type { PlaywrightStep } from "../../types";

export async function handleTypeAction(
  subStep: PlaywrightStep,
  page: Page,
  dynamicValue?: string
): Promise<void> {
  if (subStep.selector == null) {
    console.warn(`[STEP EXECUTION] No selector provided for type action`);
    return;
  }

  let textToType = subStep.value ?? "";

  // Handle template variables like {id}
  if (subStep.value != null && dynamicValue != null) {
    if (subStep.value.includes("{id}")) {
      textToType = subStep.value.replace("{id}", dynamicValue);
    }
  }

  if (subStep.selector_type === "role" && subStep.selector.length > 0) {
    console.log(`[STEP EXECUTION] Typing "${textToType}" into role textbox "${subStep.selector}"`);
    await page.getByRole("textbox", { name: subStep.selector }).fill(textToType);
  } else {
    console.log(`[STEP EXECUTION] Typing "${textToType}" into selector "${subStep.selector}"`);
    await page.fill(subStep.selector, textToType);
  }
}
