import OpenAI from "openai";
import * as XLSX from "xlsx";

import type { ScrapeConfiguration, ScrapeDownloadStep, StepExecutionResult } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
});

// Helper function to convert Excel buffer to CSV
async function convertExcelToCsv(buffer: ArrayBuffer): Promise<string> {
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

export async function executeAiPromptStep(
  step: ScrapeDownloadStep,
  configuration: ScrapeConfiguration,
  supabase: any,
  previousStepResults?: StepExecutionResult[]
): Promise<StepExecutionResult> {
  try {
    console.log(`[STEP EXECUTION] Executing AI prompt step: ${step.name}`);

    if (step.ai_prompt_data == null || step.ai_prompt_data.length === 0) {
      console.warn(`[STEP EXECUTION] No AI prompt data found for step: ${step.name}`);
      return { success: true };
    }

    const aiPrompt = step.ai_prompt_data[0];
    if (aiPrompt.prompt === "") {
      console.warn(`[STEP EXECUTION] No prompt found in AI prompt step: ${step.name}`);
      return { success: true };
    }

    console.log(`[STEP EXECUTION] Processing AI prompt: ${aiPrompt.prompt.substring(0, 100)}...`);

    // Collect downloaded files from previous steps
    let downloadedFilesContent = "";
    if (previousStepResults != null && previousStepResults.length > 0) {
      console.log(`[STEP EXECUTION] Found ${previousStepResults.length} previous step results`);
      for (const result of previousStepResults) {
        if (result.downloadPath != null && result.downloadPath !== "") {
          try {
            console.log(`[STEP EXECUTION] Reading file from storage path: ${result.downloadPath}`);

            // Download the file directly from Supabase Storage
            const { data: fileData, error: downloadError } = await supabase.storage
              .from("scrape-downloads")
              .download(result.downloadPath);

            if (downloadError != null) {
              console.warn(
                `[STEP EXECUTION] Failed to download file from ${result.downloadPath}:`,
                downloadError
              );
              continue;
            }

            const fileName = result.downloadPath.split("/").pop() ?? "unknown-file";
            let fileText: string;

            // Check if it's an Excel file and convert to CSV if needed
            if (
              fileName.toLowerCase().endsWith(".xlsx") ||
              fileName.toLowerCase().endsWith(".xls")
            ) {
              console.log(`[STEP EXECUTION] Detected Excel file: ${fileName}`);
              const arrayBuffer = await fileData.arrayBuffer();
              fileText = await convertExcelToCsv(arrayBuffer);
            } else {
              // For non-Excel files, read as text
              fileText = await fileData.text();
            }

            downloadedFilesContent += `\n\n--- File: ${fileName} ---\n${fileText}`;
            console.log(
              `[STEP EXECUTION] Successfully read file ${fileName} (${fileText.length} characters)`
            );
          } catch (error) {
            console.warn(`[STEP EXECUTION] Error reading file from ${result.downloadPath}:`, error);
          }
        }
      }
    }

    // Add instructions to prevent markdown formatting and ensure pure JavaScript output
    const systemInstructions = `IMPORTANT: Respond with pure JavaScript code only. Do not include any markdown formatting, code blocks, or explanatory text. Return only the JavaScript code that can be directly executed.`;

    let fullPrompt = `${systemInstructions}\n\n${aiPrompt.prompt}`;
    if (downloadedFilesContent !== "") {
      fullPrompt = `${systemInstructions}\n\n${aiPrompt.prompt}\n\n--- Downloaded Files Content ---${downloadedFilesContent}`;
    }

    console.log(`[STEP EXECUTION] Sending request to OpenAI...`);
    console.log(`[STEP EXECUTION] Full prompt length: ${fullPrompt.length} characters`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemInstructions,
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content ?? "No response from AI";
    console.log(`[STEP EXECUTION] AI Response received (${aiResponse.length} characters):`);
    console.log(`[STEP EXECUTION] ${aiResponse.substring(0, 200)}...`);
    console.log(`[STEP EXECUTION] AI Prompt step completed successfully`);
    return {
      success: true,
      aiResponse: aiResponse,
    };
  } catch (error: any) {
    console.error(`[STEP EXECUTION] AI prompt step failed:`, error);
    return {
      success: false,
      error: error.message ?? "An unexpected error occurred during AI prompt step execution",
    };
  }
}
