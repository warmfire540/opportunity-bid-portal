import type { SupabaseClient } from "@supabase/supabase-js";
import type { Download, Page } from "playwright";

import { getContentType } from "../../file-utils";
import type { PlaywrightStep, ScrapeConfiguration, ScrapeDownloadStep } from "../../types";

export type PlaywrightContext = {
  downloadPromise: Promise<Download> | null;
  storageObjectId: string | undefined;
  textResults: string[];
};

export async function handleSaveDownloadAction(
  context: PlaywrightContext,
  subStep: PlaywrightStep,
  page: Page,
  supabase: SupabaseClient,
  configuration: ScrapeConfiguration,
  step: ScrapeDownloadStep
): Promise<void> {
  if (context.downloadPromise == null) {
    console.warn(`[STEP EXECUTION] No download promise available for saveDownload action`);
    return;
  }

  console.log(`[STEP EXECUTION] Saving download to Supabase Storage...`);
  const download: Download = await context.downloadPromise;

  // Generate filename with timestamp to avoid conflicts
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const suggestedFilename = download.suggestedFilename();
  const originalFilename =
    suggestedFilename.length > 0 ? suggestedFilename : "downloaded-file.xlsx";
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
  const { error } = await supabase.storage.from("scrape-downloads").upload(storagePath, buffer, {
    contentType: getContentType(filename),
  });

  if (error != null) {
    console.error(`[STEP EXECUTION] Storage upload failed:`, error);
    throw error;
  }

  context.storageObjectId = storagePath;
  console.log(`[STEP EXECUTION] Download uploaded successfully to ${storagePath}`);
}
