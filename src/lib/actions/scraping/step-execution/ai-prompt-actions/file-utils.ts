import type { SupabaseClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

// Helper function to convert Excel buffer to CSV
export async function convertExcelToCsv(buffer: ArrayBuffer): Promise<string> {
  try {
    console.log(`[STEP EXECUTION] Converting Excel file to CSV...`);

    // Read the Excel file using the xlsx library
    const workbook = XLSX.read(buffer, { type: "array" });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    console.log(`[STEP EXECUTION] Successfully converted Excel to CSV (${csv.length} characters)`);
    return csv;
  } catch (error) {
    console.error(`[STEP EXECUTION] Error converting Excel to CSV:`, error);
    return "Error converting Excel file to CSV format.";
  }
}

export async function downloadAndProcessFile(
  downloadPath: string,
  supabase: SupabaseClient
): Promise<string> {
  try {
    console.log(`[STEP EXECUTION] Reading file from storage path: ${downloadPath}`);

    // Download the file directly from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("scrape-downloads")
      .download(downloadPath);

    if (downloadError != null) {
      console.warn(`[STEP EXECUTION] Failed to download file from ${downloadPath}:`, downloadError);
      return "";
    }

    const fileName = downloadPath.split("/").pop() ?? "unknown-file";
    let fileText: string;

    // Check if it's an Excel file and convert to CSV if needed
    if (fileName.toLowerCase().endsWith(".xlsx") || fileName.toLowerCase().endsWith(".xls")) {
      console.log(`[STEP EXECUTION] Detected Excel file: ${fileName}`);
      const arrayBuffer = await fileData.arrayBuffer();
      fileText = await convertExcelToCsv(arrayBuffer);
    } else {
      // For non-Excel files, read as text
      fileText = await fileData.text();
    }

    console.log(
      `[STEP EXECUTION] Successfully read file ${fileName} (${fileText.length} characters)`
    );
    return `\n\n--- File: ${fileName} ---\n${fileText}`;
  } catch (error) {
    console.warn(`[STEP EXECUTION] Error reading file from ${downloadPath}:`, error);
    return "";
  }
}
