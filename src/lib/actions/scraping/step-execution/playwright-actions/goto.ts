import type { Page } from "playwright";

import type { PlaywrightStep, ScrapeConfiguration } from "../../types";

export async function handleGotoAction(
  subStep: PlaywrightStep,
  page: Page,
  configuration: ScrapeConfiguration,
  dynamicUrl?: string
): Promise<void> {
  let urlToNavigate = dynamicUrl ?? configuration.target_url;

  // Handle template variables like {url}
  if (subStep.value != null && subStep.value.includes("{url}") && dynamicUrl != null) {
    urlToNavigate = subStep.value.replace("{url}", dynamicUrl);
  }

  console.log(`[STEP EXECUTION] Navigating to ${urlToNavigate}`);
  await page.goto(urlToNavigate);
  await page.waitForLoadState("networkidle");
}
