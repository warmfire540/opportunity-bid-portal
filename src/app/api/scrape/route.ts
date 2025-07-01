import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Download } from "playwright";
import { chromium } from "playwright";

import { getScrapeConfiguration } from "@/src/lib/actions/scraping";
import { createClient } from "@/src/lib/supabase/server";

// Helper function to determine content type from filename
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls":
      return "application/vnd.ms-excel";
    case "csv":
      return "text/csv";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "txt":
      return "text/plain";
    case "json":
      return "application/json";
    case "xml":
      return "application/xml";
    default:
      return "application/octet-stream";
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`[SCRAPE API] Starting scrape execution at ${new Date().toISOString()}`);

  const { id } = await req.json();
  if (!id) {
    console.error("[SCRAPE API] Missing configuration id in request");
    return NextResponse.json({ error: "Missing configuration id" }, { status: 400 });
  }

  console.log(`[SCRAPE API] Processing configuration with ID: ${id}`);

  // Fetch configuration and steps
  let config;
  try {
    console.log(`[SCRAPE API] Fetching configuration from database...`);
    config = await getScrapeConfiguration(id);
    console.log(`[SCRAPE API] Configuration loaded:`, {
      name: config.name,
      target_url: config.target_url,
      steps_count: config.steps?.length ?? 0,
      is_active: config.is_active,
    });
  } catch (e: any) {
    console.error(`[SCRAPE API] Failed to fetch configuration:`, e.message);
    return NextResponse.json({ error: e.message }, { status: 404 });
  }

  console.log(`[SCRAPE API] Launching browser...`);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const steps = config.steps ?? [];
  let storageObjectId: string | null = null;
  let downloadPromise: Promise<any> | null = null;
  let lastStepId: string | null = null;

  // Initialize Supabase client
  const supabase = createClient();

  console.log(`[SCRAPE API] Browser launched successfully. Executing ${steps.length} steps...`);

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepNumber = i + 1;

      console.log(`[SCRAPE API] Executing step ${stepNumber}/${steps.length}:`, {
        step_type: step.step_type,
        name: step.name,
        description: step.description,
      });

      // Handle different step types
      switch (step.step_type) {
        case "playwright":
          console.log(`[SCRAPE API] Step ${stepNumber}: Executing playwright actions...`);

          if (step.sub_steps && step.sub_steps.length > 0) {
            for (let j = 0; j < step.sub_steps.length; j++) {
              const subStep = step.sub_steps[j];
              const subStepNumber = j + 1;

              console.log(
                `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Executing playwright action:`,
                {
                  action_type: subStep.action_type,
                  selector: subStep.selector,
                  selector_type: subStep.selector_type,
                  value: subStep.value,
                  wait_time: subStep.wait_time,
                  description: subStep.description,
                }
              );

              switch (subStep.action_type) {
                case "goto":
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Navigating to ${config.target_url}`
                  );
                  await page.goto(config.target_url);
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Navigation completed`
                  );
                  break;

                case "click":
                  if (subStep.selector_type === "role") {
                    console.log(
                      `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Clicking role button "${subStep.selector}"`
                    );
                    await page.getByRole("button", { name: subStep.selector }).click();
                  } else if (subStep.selector_type === "option") {
                    console.log(
                      `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Clicking option "${subStep.selector}"`
                    );
                    await page
                      .getByRole("option", { name: subStep.selector })
                      .locator("mat-pseudo-checkbox")
                      .click();
                  } else {
                    console.log(
                      `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Clicking selector "${subStep.selector}"`
                    );
                    await page.click(subStep.selector);
                  }
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Click action completed`
                  );
                  break;

                case "waitForDownload":
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Waiting for download event...`
                  );
                  downloadPromise = page.waitForEvent("download");
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Download promise created`
                  );
                  break;

                case "saveDownload": {
                  if (downloadPromise) {
                    console.log(
                      `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Saving download to Supabase Storage...`
                    );
                    const download: Download = await downloadPromise;

                    // Generate filename with timestamp to avoid conflicts
                    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                    const originalFilename = download.suggestedFilename() ?? "downloaded-file.xlsx";
                    const filename = `${timestamp}-${originalFilename}`;
                    const storagePath = `${id}/${step.id}/${filename}`;

                    console.log(
                      `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Uploading to storage path: ${storagePath}`
                    );

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

                    if (error) {
                      console.error(
                        `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Storage upload failed:`,
                        error
                      );
                      throw error;
                    }

                    storageObjectId = data?.id;
                    lastStepId = step.id;
                    console.log(
                      `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Download uploaded successfully to ${storagePath}`,
                      { storageObjectId, data }
                    );
                  } else {
                    console.warn(
                      `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: No download promise available for saveDownload action`
                    );
                  }
                  break;
                }

                case "wait": {
                  const waitTime = subStep.wait_time ?? 1000;
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Waiting for ${waitTime}ms`
                  );
                  await page.waitForTimeout(waitTime);
                  console.log(`[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Wait completed`);
                  break;
                }

                case "type":
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Typing "${subStep.value}" into selector "${subStep.selector}"`
                  );
                  await page.fill(subStep.selector, subStep.value ?? "");
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Type action completed`
                  );
                  break;

                case "select":
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Selecting option "${subStep.value}" from selector "${subStep.selector}"`
                  );
                  await page.selectOption(subStep.selector, subStep.value ?? "");
                  console.log(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Select action completed`
                  );
                  break;

                default:
                  console.warn(
                    `[SCRAPE API] Step ${stepNumber}.${subStepNumber}: Unknown action type "${subStep.action_type}" - skipping`
                  );
                  break;
              }

              console.log(
                `[SCRAPE API] Step ${stepNumber}.${subStepNumber} completed successfully`
              );
            }
          } else {
            console.warn(`[SCRAPE API] Step ${stepNumber}: No playwright sub-steps found`);
          }
          break;

        case "ai_prompt":
          console.log(`[SCRAPE API] Step ${stepNumber}: AI Prompt step - not implemented yet`);
          // TODO: Implement AI prompt functionality
          break;

        case "links_analysis":
          console.log(`[SCRAPE API] Step ${stepNumber}: Links Analysis step - not implemented yet`);
          // TODO: Implement links analysis functionality
          break;

        default:
          console.warn(
            `[SCRAPE API] Step ${stepNumber}: Unknown step type "${step.step_type}" - skipping`
          );
          break;
      }

      console.log(`[SCRAPE API] Step ${stepNumber}/${steps.length} completed successfully`);
    }

    const executionTime = Date.now() - startTime;
    console.log(`[SCRAPE API] All steps completed successfully in ${executionTime}ms`);

    // Get download URL if file was uploaded
    let downloadUrl = null;
    if (storageObjectId != null && lastStepId != null) {
      const { data: urlData } = await supabase.storage
        .from("scrape-downloads")
        .createSignedUrl(`${id}/${lastStepId}/${storageObjectId}`, 3600); // 1 hour expiry
      downloadUrl = urlData?.signedUrl ?? null;
    }

    await browser.close();
    console.log(`[SCRAPE API] Browser closed successfully`);

    return NextResponse.json({
      success: true,
      downloadPath: storageObjectId,
      downloadUrl,
      executionTimeMs: executionTime,
      stepsExecuted: steps.length,
    });
  } catch (error: any) {
    console.error(`[SCRAPE API] Error during scrape execution:`, error);
    await browser.close();
    console.log(`[SCRAPE API] Browser closed due to error`);

    const executionTime = Date.now() - startTime;
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during scraping",
        executionTimeMs: executionTime,
        stepsExecuted: 0,
      },
      { status: 500 }
    );
  }
}
