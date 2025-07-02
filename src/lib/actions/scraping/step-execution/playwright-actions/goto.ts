import type { Page } from "playwright";

import type { PlaywrightStep, ScrapeConfiguration } from "../../types";

export async function handleGotoAction(
  subStep: PlaywrightStep,
  page: Page,
  configuration: ScrapeConfiguration,
  dynamicValue?: string
): Promise<void> {
  let urlToNavigate = configuration.target_url;

  // Handle template variables like {url} or {id} only if the step has a value with placeholders
  if (subStep.value != null && dynamicValue != null && subStep.value.includes("{url}")) {
    urlToNavigate = subStep.value.replace("{url}", dynamicValue);
  } else if (subStep.value != null) {
    // If step has a value but no dynamicValue, use the step value directly
    urlToNavigate = subStep.value;
  }

  console.log(`[STEP EXECUTION] Navigating to ${urlToNavigate}`);
  await page.goto(urlToNavigate);
  await page.waitForLoadState("networkidle");
}
