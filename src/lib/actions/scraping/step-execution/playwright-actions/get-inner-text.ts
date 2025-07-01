import type { Page } from "playwright";

import type { PlaywrightStep } from "../../types";

import type { PlaywrightContext } from "./save-download";

export async function handleGetInnerTextAction(
  subStep: PlaywrightStep,
  page: Page,
  context: PlaywrightContext
): Promise<void> {
  console.log(`[STEP EXECUTION] Getting inner text from selector "${subStep.selector}"`);
  const innerText = await page.innerText(subStep.selector ?? "body");
  context.textResults.push(innerText);
  console.log(`[STEP EXECUTION] Extracted text: ${innerText.substring(0, 50)}...`);
}
