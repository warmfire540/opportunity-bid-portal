import type { Page } from "playwright";

import type { PlaywrightStep } from "../../types";

export async function handleClickAction(subStep: PlaywrightStep, page: Page): Promise<void> {
  if (subStep.selector_type === "role" && subStep.selector != null && subStep.selector.length > 0) {
    console.log(`[STEP EXECUTION] Clicking by role "${subStep.selector}"`);
    await page
      .getByRole(subStep.selector as "button" | "textbox" | "option", { name: subStep.value })
      .click();
  } else if (subStep.selector != null) {
    console.log(`[STEP EXECUTION] Clicking selector "${subStep.selector}"`);
    await page.click(subStep.selector);
  }
}
