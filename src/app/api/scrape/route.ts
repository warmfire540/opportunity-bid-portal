import { NextRequest, NextResponse } from "next/server";
import { getScrapeConfiguration } from "@/src/lib/actions/scrape-configurations";
import { chromium, Download } from "playwright";
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
  let storageObjectId = null;
  let downloadPromise: Promise<any> | null = null;

  // Initialize Supabase client
  const supabase = createClient();

  console.log(`[SCRAPE API] Browser launched successfully. Executing ${steps.length} steps...`);

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepNumber = i + 1;

      console.log(`[SCRAPE API] Executing step ${stepNumber}/${steps.length}:`, {
        action_type: step.action_type,
        selector: step.selector,
        selector_type: step.selector_type,
        value: step.value,
        wait_time: step.wait_time,
        description: step.description,
      });

      switch (step.action_type) {
        case "goto":
          console.log(`[SCRAPE API] Step ${stepNumber}: Navigating to ${config.target_url}`);
          await page.goto(config.target_url);
          console.log(`[SCRAPE API] Step ${stepNumber}: Navigation completed`);
          break;

        case "click":
          if (step.selector_type === "role") {
            console.log(`[SCRAPE API] Step ${stepNumber}: Clicking role button "${step.selector}"`);
            await page.getByRole("button", { name: step.selector }).click();
          } else if (step.selector_type === "option") {
            console.log(`[SCRAPE API] Step ${stepNumber}: Clicking option "${step.selector}"`);
            await page
              .getByRole("option", { name: step.selector })
              .locator("mat-pseudo-checkbox")
              .click();
          } else {
            console.log(`[SCRAPE API] Step ${stepNumber}: Clicking selector "${step.selector}"`);
            await page.click(step.selector);
          }
          console.log(`[SCRAPE API] Step ${stepNumber}: Click action completed`);
          break;

        case "waitForDownload":
          console.log(`[SCRAPE API] Step ${stepNumber}: Waiting for download event...`);
          downloadPromise = page.waitForEvent("download");
          console.log(`[SCRAPE API] Step ${stepNumber}: Download promise created`);
          break;

        case "saveDownload": {
          if (downloadPromise) {
            console.log(`[SCRAPE API] Step ${stepNumber}: Saving download to Supabase Storage...`);
            const download: Download = await downloadPromise;

            // Generate filename with timestamp to avoid conflicts
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const originalFilename = download.suggestedFilename() ?? "downloaded-file.xlsx";
            const filename = `${timestamp}-${originalFilename}`;
            const storagePath = `${id}/${filename}`;

            console.log(
              `[SCRAPE API] Step ${stepNumber}: Uploading to storage path: ${storagePath}`
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
              console.error(`[SCRAPE API] Step ${stepNumber}: Storage upload failed:`, error);
              throw error;
            }

            storageObjectId = data?.id;
            console.log(
              `[SCRAPE API] Step ${stepNumber}: Download uploaded successfully to ${storagePath}`,
              { storageObjectId, data }
            );
          } else {
            console.warn(
              `[SCRAPE API] Step ${stepNumber}: No download promise available for saveDownload action`
            );
          }
          break;
        }

        case "wait": {
          const waitTime = step.wait_time ?? 1000;
          console.log(`[SCRAPE API] Step ${stepNumber}: Waiting for ${waitTime}ms`);
          await page.waitForTimeout(waitTime);
          console.log(`[SCRAPE API] Step ${stepNumber}: Wait completed`);
          break;
        }

        case "type":
          console.log(
            `[SCRAPE API] Step ${stepNumber}: Typing "${step.value}" into selector "${step.selector}"`
          );
          await page.fill(step.selector, step.value ?? "");
          console.log(`[SCRAPE API] Step ${stepNumber}: Type action completed`);
          break;

        case "select":
          console.log(
            `[SCRAPE API] Step ${stepNumber}: Selecting option "${step.value}" from selector "${step.selector}"`
          );
          await page.selectOption(step.selector, step.value ?? "");
          console.log(`[SCRAPE API] Step ${stepNumber}: Select action completed`);
          break;

        default:
          console.warn(
            `[SCRAPE API] Step ${stepNumber}: Unknown action type "${step.action_type}" - skipping`
          );
          break;
      }

      console.log(`[SCRAPE API] Step ${stepNumber}/${steps.length} completed successfully`);
    }

    const executionTime = Date.now() - startTime;
    console.log(`[SCRAPE API] All steps completed successfully in ${executionTime}ms`);
    console.log(`[SCRAPE API] Final result:`, {
      success: true,
      steps_executed: steps.length,
      execution_time_ms: executionTime,
    });

    await browser.close();
    console.log(`[SCRAPE API] Browser closed successfully`);

    return NextResponse.json({
      success: true,
      steps: steps.map((s: any) => s.action_type),
      storageObjectId: storageObjectId ?? null,
      executionTimeMs: executionTime,
      stepsExecuted: steps.length,
    });
  } catch (err: any) {
    const executionTime = Date.now() - startTime;
    console.error(`[SCRAPE API] Error during execution after ${executionTime}ms:`, {
      error: err.message,
      stack: err.stack,
      steps_executed: steps.length,
      execution_time_ms: executionTime,
    });

    await browser.close();
    console.log(`[SCRAPE API] Browser closed after error`);

    return NextResponse.json(
      {
        error: err.message,
        executionTimeMs: executionTime,
        stepsExecuted: steps.length,
        storageObjectId: storageObjectId ?? null,
      },
      { status: 500 }
    );
  }
}
