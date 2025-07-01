import type { Download } from "playwright";

import { getContentType } from "../file-utils";
import type { ScrapeConfiguration, ScrapeDownloadStep, StepExecutionResult } from "../types";

export async function executePlaywrightStep(
  step: ScrapeDownloadStep,
  configuration: ScrapeConfiguration,
  browser: any,
  page: any,
  supabase: any
): Promise<StepExecutionResult> {
  try {
    console.log(`[STEP EXECUTION] Executing playwright step: ${step.name}`);

    if (step.sub_steps == null || step.sub_steps.length === 0) {
      console.warn(`[STEP EXECUTION] No playwright sub-steps found for step: ${step.name}`);
      return { success: true };
    }

    let downloadPromise: Promise<any> | null = null;
    let storageObjectId: string | undefined = undefined;

    for (let j = 0; j < step.sub_steps.length; j++) {
      const subStep = step.sub_steps[j];
      const subStepNumber = j + 1;

      console.log(`[STEP EXECUTION] Executing sub-step ${subStepNumber}: ${subStep.action_type}`);

      switch (subStep.action_type) {
        case "goto":
          console.log(`[STEP EXECUTION] Navigating to ${configuration.target_url}`);
          await page.goto(configuration.target_url);
          break;

        case "click":
          if (subStep.selector_type === "role") {
            console.log(`[STEP EXECUTION] Clicking role button "${subStep.selector}"`);
            await page.getByRole("button", { name: subStep.selector }).click();
          } else if (subStep.selector_type === "option") {
            console.log(`[STEP EXECUTION] Clicking option "${subStep.selector}"`);
            await page
              .getByRole("option", { name: subStep.selector })
              .locator("mat-pseudo-checkbox")
              .click();
          } else {
            console.log(`[STEP EXECUTION] Clicking selector "${subStep.selector}"`);
            await page.click(subStep.selector);
          }
          break;

        case "waitForDownload":
          console.log(`[STEP EXECUTION] Waiting for download event...`);
          downloadPromise = page.waitForEvent("download");
          break;

        case "saveDownload": {
          if (downloadPromise != null) {
            console.log(`[STEP EXECUTION] Saving download to Supabase Storage...`);
            const download: Download = await downloadPromise;

            // Generate filename with timestamp to avoid conflicts
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const originalFilename = download.suggestedFilename() ?? "downloaded-file.xlsx";
            const filename = `${timestamp}-${originalFilename}`;
            const storagePath = `${configuration.id}/${step.id}/${filename}`;

            console.log(`[STEP EXECUTION] Uploading to storage path: ${storagePath}`);

            // Get the download as ArrayBuffer and upload to Supabase Storage
            const stream = await download.createReadStream();
            const chunks: Uint8Array[] = [];

            for await (const chunk of stream) {
              chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);
            const { data, error } = await supabase.storage
              .from("scrape-downloads")
              .upload(storagePath, buffer, {
                contentType: getContentType(filename),
              });

            if (error != null) {
              console.error(`[STEP EXECUTION] Storage upload failed:`, error);
              throw error;
            }

            storageObjectId = data?.id;
            console.log(`[STEP EXECUTION] Download uploaded successfully to ${storagePath}`);
          } else {
            console.warn(`[STEP EXECUTION] No download promise available for saveDownload action`);
          }
          break;
        }

        case "wait": {
          const waitTime = subStep.wait_time ?? 1000;
          console.log(`[STEP EXECUTION] Waiting for ${waitTime}ms`);
          await page.waitForTimeout(waitTime);
          break;
        }

        case "type":
          console.log(
            `[STEP EXECUTION] Typing "${subStep.value}" into selector "${subStep.selector}"`
          );
          await page.fill(subStep.selector, subStep.value ?? "");
          break;

        case "select":
          console.log(
            `[STEP EXECUTION] Selecting option "${subStep.value}" from selector "${subStep.selector}"`
          );
          await page.selectOption(subStep.selector, subStep.value ?? "");
          break;

        default:
          console.warn(`[STEP EXECUTION] Unknown action type "${subStep.action_type}" - skipping`);
          break;
      }

      console.log(`[STEP EXECUTION] Sub-step ${subStepNumber} completed successfully`);
    }

    // Get download URL if file was uploaded
    let downloadUrl = null;
    if (storageObjectId != null) {
      const { data: urlData } = await supabase.storage
        .from("scrape-downloads")
        .createSignedUrl(`${configuration.id}/${step.id}/${storageObjectId}`, 3600); // 1 hour expiry
      downloadUrl = urlData?.signedUrl ?? null;
    }

    console.log(`[STEP EXECUTION] Playwright step completed successfully`);
    return {
      success: true,
      storageObjectId: storageObjectId,
      downloadUrl: downloadUrl ?? undefined,
    };
  } catch (error: any) {
    console.error(`[STEP EXECUTION] Playwright step failed:`, error);
    return {
      success: false,
      error: error.message ?? "An unexpected error occurred during playwright step execution",
    };
  }
}
