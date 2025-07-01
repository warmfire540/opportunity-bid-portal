import type { Page } from "playwright";

import type { PlaywrightStep } from "../../types";

export async function handleClickAction(subStep: PlaywrightStep, page: Page): Promise<void> {
  if (subStep.selector_type === "role" && subStep.selector != null && subStep.selector.length > 0) {
    console.log(`[STEP EXECUTION] Clicking role button "${subStep.selector}"`);
    await page.getByRole("button", { name: subStep.selector }).click();
  } else if (
    subStep.selector_type === "option" &&
    subStep.selector != null &&
    subStep.selector.length > 0
  ) {
    console.log(`[STEP EXECUTION] Clicking option "${subStep.selector}"`);
    await page
      .getByRole("option", { name: subStep.selector })
      .locator("mat-pseudo-checkbox")
      .click();
  } else if (subStep.selector != null) {
    console.log(`[STEP EXECUTION] Clicking selector "${subStep.selector}"`);
    await page.click(subStep.selector);
  }
}
