import type { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import * as XLSX from "xlsx";

import type {
  ScrapeDownloadStep,
  StepExecutionResult,
  TypedAiResponse,
  PageTextContent,
} from "../types";

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
  supabase: SupabaseClient,
  previousStepResult?: StepExecutionResult
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

    // Collect downloaded files and text content from the immediate previous step only
    let downloadedFilesContent = "";
    const pageTextContents: PageTextContent[] = [];

    if (previousStepResult != null) {
      console.log(`[STEP EXECUTION] Processing immediate previous step result`);
      
      // Handle downloaded files from the previous step
      if (previousStepResult.downloadPath != null && previousStepResult.downloadPath !== "") {
        try {
          console.log(`[STEP EXECUTION] Reading file from storage path: ${previousStepResult.downloadPath}`);

          // Download the file directly from Supabase Storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from("scrape-downloads")
            .download(previousStepResult.downloadPath);

          if (downloadError != null) {
            console.warn(
              `[STEP EXECUTION] Failed to download file from ${previousStepResult.downloadPath}:`,
              downloadError
            );
          } else {
            const fileName = previousStepResult.downloadPath.split("/").pop() ?? "unknown-file";
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
          }
        } catch (error) {
          console.warn(`[STEP EXECUTION] Error reading file from ${previousStepResult.downloadPath}:`, error);
        }
      }

      // Handle text content from the previous step
      if (previousStepResult.pageTextContent != null && previousStepResult.pageTextContent.length > 0) {
        console.log(
          `[STEP EXECUTION] Found ${previousStepResult.pageTextContent.length} pages with text content from previous step`
        );
        pageTextContents.push(...previousStepResult.pageTextContent);
      }
    }

    // If we have multiple pages, process each page separately
    if (pageTextContents.length > 1) {
      console.log(`[STEP EXECUTION] Processing ${pageTextContents.length} pages separately`);

      const aiResults: StepExecutionResult[] = [];

      for (let i = 0; i < pageTextContents.length; i++) {
        const pageContent = pageTextContents[i];
        console.log(
          `[STEP EXECUTION] Processing page ${i + 1}/${pageTextContents.length}: ${pageContent.pageId ?? "unknown"}`
        );

        // Combine all content pieces from this page
        const pageTextContent = pageContent.content.join("\n\n--- Content Piece ---\n");

        let fullPrompt = aiPrompt.prompt;
        if (downloadedFilesContent !== "") {
          fullPrompt = `${aiPrompt.prompt}\n\n--- Downloaded Files Content ---${downloadedFilesContent}`;
        }
        fullPrompt = `${fullPrompt}\n\n--- Page Content ---\n${pageTextContent}`;

        console.log(`[STEP EXECUTION] Sending request to OpenAI for page ${i + 1}...`);
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
        console.log(
          `[STEP EXECUTION] AI Response received for page ${i + 1} (${aiResponse.length} characters):`
        );

        // Parse the AI response to extract typed data
        let typedAiResponse: TypedAiResponse | undefined;
        try {
          const parsedResponse = JSON.parse(aiResponse);

          // Check if it's the new typed format
          if (
            parsedResponse != null &&
            typeof parsedResponse === "object" &&
            parsedResponse !== null &&
            "type" in parsedResponse &&
            "values" in parsedResponse
          ) {
            const typedResponse = parsedResponse as { type: string; values: unknown };
            typedAiResponse = {
              type: typedResponse.type as "url" | "id",
              values: Array.isArray(typedResponse.values) ? (typedResponse.values as string[]) : [],
            };
            console.log(
              `[STEP EXECUTION] Parsed typed AI response for page ${i + 1}: type=${typedAiResponse.type}, values=${typedAiResponse.values.length}`
            );
          } else if (Array.isArray(parsedResponse)) {
            // Handle legacy array format - determine type based on content
            const firstItem = parsedResponse[0];
            if (typeof firstItem === "string") {
              // Check if it looks like a URL or an ID
              const isUrl = firstItem.startsWith("http") || firstItem.includes("/");
              typedAiResponse = {
                type: isUrl ? "url" : "id",
                values: parsedResponse,
              };
              console.log(
                `[STEP EXECUTION] Converted legacy array to typed response for page ${i + 1}: type=${typedAiResponse.type}, values=${typedAiResponse.values.length}`
              );
            }
          }
        } catch (parseError) {
          console.error(
            `[STEP EXECUTION] Failed to parse AI response as JSON for page ${i + 1}: ${parseError}`
          );
          console.log(`[STEP EXECUTION] AI Response: ${aiResponse}`);
        }

        aiResults.push({
          success: true,
          aiResponse: aiResponse,
          typedAiResponse: typedAiResponse,
        });
      }

      // Combine all AI results into a single result
      const combinedTypedAiResponse: TypedAiResponse | undefined =
        aiResults.length > 0
          ? {
              type: aiResults[0]?.typedAiResponse?.type ?? "id",
              values: aiResults.flatMap((result) => result.typedAiResponse?.values ?? []),
            }
          : undefined;

      // Combine all AI responses into a single JSON response that can be parsed by subsequent steps
      const combinedAiResponses = aiResults.map((result, index) => ({
        pageIndex: index,
        pageId: pageTextContents[index]?.pageId ?? `page-${index + 1}`,
        aiResponse: result.aiResponse,
        typedAiResponse: result.typedAiResponse,
      }));

      console.log(
        `[STEP EXECUTION] AI Prompt step completed successfully for ${pageTextContents.length} pages`
      );
      return {
        success: true,
        aiResponse: JSON.stringify(combinedAiResponses),
        typedAiResponse: combinedTypedAiResponse,
      };
    } else {
      // Single page or no pages - use original logic
      let textContentFromPreviousSteps = "";

      if (pageTextContents.length === 1) {
        const pageContent = pageTextContents[0];
        console.log(
          `[STEP EXECUTION] Found single page with ${pageContent.content.length} text pieces`
        );
        for (let i = 0; i < pageContent.content.length; i++) {
          const textContent = pageContent.content[i];
          textContentFromPreviousSteps += `\n\n--- Text Content ${i + 1} ---\n${textContent}`;
          console.log(
            `[STEP EXECUTION] Added text content ${i + 1} (${textContent.length} characters)`
          );
        }
      }

      let fullPrompt = aiPrompt.prompt;
      if (downloadedFilesContent !== "") {
        console.log(`[STEP EXECUTION] Downloaded files content length: ${downloadedFilesContent.length} characters`);
        fullPrompt = `${aiPrompt.prompt}\n\n--- Downloaded Files Content ---${downloadedFilesContent}`;
      }
      if (textContentFromPreviousSteps !== "") {
        console.log(`[STEP EXECUTION] Text content from previous steps length: ${textContentFromPreviousSteps.length} characters`);
        fullPrompt = `${fullPrompt}\n\n--- Text Content from Previous Steps ---${textContentFromPreviousSteps}`;
      }

      console.log(`[STEP EXECUTION] Sending request to OpenAI...`);
      console.log(`[STEP EXECUTION] AI prompt length: ${aiPrompt.prompt.length} characters`);
      console.log(
        `[STEP EXECUTION] System prompt length: ${aiPrompt.system_prompt?.length ?? 0} characters`
      );
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

      // Parse the AI response to extract typed data
      let typedAiResponse: TypedAiResponse | undefined;
      try {
        const parsedResponse = JSON.parse(aiResponse);

        // Check if it's the new typed format
        if (
          parsedResponse != null &&
          typeof parsedResponse === "object" &&
          parsedResponse !== null &&
          "type" in parsedResponse &&
          "values" in parsedResponse
        ) {
          const typedResponse = parsedResponse as { type: string; values: unknown };
          typedAiResponse = {
            type: typedResponse.type as "url" | "id",
            values: Array.isArray(typedResponse.values) ? (typedResponse.values as string[]) : [],
          };
          console.log(
            `[STEP EXECUTION] Parsed typed AI response: type=${typedAiResponse.type}, values=${typedAiResponse.values.length}`
          );
        } else if (Array.isArray(parsedResponse)) {
          // Handle legacy array format - determine type based on content
          const firstItem = parsedResponse[0];
          if (typeof firstItem === "string") {
            // Check if it looks like a URL or an ID
            const isUrl = firstItem.startsWith("http") || firstItem.includes("/");
            typedAiResponse = {
              type: isUrl ? "url" : "id",
              values: parsedResponse,
            };
            console.log(
              `[STEP EXECUTION] Converted legacy array to typed response: type=${typedAiResponse.type}, values=${typedAiResponse.values.length}`
            );
          }
        }
      } catch (parseError) {
        console.error(`[STEP EXECUTION] Failed to parse AI response as JSON: ${parseError}`);
        console.log(`[STEP EXECUTION] AI Response: ${aiResponse}`);
      }

      console.log(`[STEP EXECUTION] AI Prompt step completed successfully`);
      return {
        success: true,
        aiResponse: aiResponse,
        typedAiResponse: typedAiResponse,
      };
    }
  } catch (error: any) {
    console.error(`[STEP EXECUTION] AI prompt step failed:`, error);
    return {
      success: false,
      error: error.message ?? "An unexpected error occurred during AI prompt step execution",
    };
  }
}
