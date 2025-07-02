import type { Page } from "playwright";

import type { PlaywrightStep, ScrapeConfiguration } from "../../types";

export async function handleGotoAction(
  subStep: PlaywrightStep,
  page: Page,
  configuration: ScrapeConfiguration,
  dynamicValue?: string
): Promise<void> {
  let urlToNavigate = dynamicValue ?? configuration.target_url;

  // Handle template variables like {url} or {id}
  if (subStep.value != null && dynamicValue != null) {
    if (subStep.value.includes("{url}")) {
      urlToNavigate = subStep.value.replace("{url}", dynamicValue);
    } else if (subStep.value.includes("{id}")) {
      urlToNavigate = subStep.value.replace("{id}", dynamicValue);
    }
  }

  console.log(`[STEP EXECUTION] Navigating to ${urlToNavigate}`);
  await page.goto(urlToNavigate);
  await page.waitForLoadState("networkidle");
}
