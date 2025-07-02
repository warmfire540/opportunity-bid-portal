import type { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as XLSX from "xlsx";

import type { ScrapeConfiguration, ScrapeDownloadStep, StepExecutionResult, TypedAiResponse } from "../types";

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
  supabase: SupabaseClient,
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

    // Collect downloaded files and text content from previous steps
    let downloadedFilesContent = "";
    let textContentFromPreviousSteps = "";

    if (previousStepResults != null && previousStepResults.length > 0) {
      console.log(`[STEP EXECUTION] Found ${previousStepResults.length} previous step results`);
      for (const result of previousStepResults) {
        // Handle downloaded files
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

        // Handle text content from previous steps
        if (result.textResults != null && result.textResults.length > 0) {
          console.log(
            `[STEP EXECUTION] Found ${result.textResults.length} text results from previous step`
          );
          for (let i = 0; i < result.textResults.length; i++) {
            const textContent = result.textResults[i];
            textContentFromPreviousSteps += `\n\n--- Text Content ${i + 1} ---\n${textContent}`;
            console.log(
              `[STEP EXECUTION] Added text content ${i + 1} (${textContent.length} characters)`
            );
          }
        }
      }
    }

    let fullPrompt = aiPrompt.prompt;
    if (downloadedFilesContent !== "") {
      fullPrompt = `${aiPrompt.prompt}\n\n--- Downloaded Files Content ---${downloadedFilesContent}`;
    }
    if (textContentFromPreviousSteps !== "") {
      fullPrompt = `${fullPrompt}\n\n--- Text Content from Previous Steps ---${textContentFromPreviousSteps}`;
    }

    console.log(`[STEP EXECUTION] Sending request to OpenAI...`);
    console.log(`[STEP EXECUTION] Full prompt length: ${fullPrompt.length} characters`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: aiPrompt.system_prompt ?? "",
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

    // Parse the AI response to extract typed data
    let typedAiResponse: TypedAiResponse | undefined;
    try {
      const parsedResponse = JSON.parse(aiResponse);
      
      // Check if it's the new typed format
      if (parsedResponse && typeof parsedResponse === "object" && parsedResponse !== null && "type" in parsedResponse && "values" in parsedResponse) {
        const typedResponse = parsedResponse as { type: string; values: unknown };
        typedAiResponse = {
          type: typedResponse.type as "url" | "id",
          values: Array.isArray(typedResponse.values) ? typedResponse.values as string[] : []
        };
        console.log(`[STEP EXECUTION] Parsed typed AI response: type=${typedAiResponse.type}, values=${typedAiResponse.values.length}`);
      } else if (Array.isArray(parsedResponse)) {
        // Handle legacy array format - determine type based on content
        const firstItem = parsedResponse[0];
        if (typeof firstItem === "string") {
          // Check if it looks like a URL or an ID
          const isUrl = firstItem.startsWith("http") || firstItem.includes("/");
          typedAiResponse = {
            type: isUrl ? "url" : "id",
            values: parsedResponse
          };
          console.log(`[STEP EXECUTION] Converted legacy array to typed response: type=${typedAiResponse.type}, values=${typedAiResponse.values.length}`);
        }
      }
    } catch (parseError) {
      console.warn(`[STEP EXECUTION] Failed to parse AI response as JSON: ${parseError}`);
    }

    console.log(`[STEP EXECUTION] AI Prompt step completed successfully`);
    return {
      success: true,
      aiResponse: aiResponse,
      typedAiResponse: typedAiResponse,
    };
  } catch (error: any) {
    console.error(`[STEP EXECUTION] AI prompt step failed:`, error);
    return {
      success: false,
      error: error.message ?? "An unexpected error occurred during AI prompt step execution",
    };
  }
}
