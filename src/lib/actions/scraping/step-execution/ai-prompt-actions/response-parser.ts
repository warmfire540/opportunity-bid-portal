import type { TypedAiResponse } from "../../types";

export function parseAiResponse(
  aiResponse: string,
  pageIndex?: number
): TypedAiResponse | undefined {
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
      const typedAiResponse: TypedAiResponse = {
        type: typedResponse.type as "url" | "id",
        values: Array.isArray(typedResponse.values) ? (typedResponse.values as string[]) : [],
      };

      const pageInfo = pageIndex != null ? ` for page ${pageIndex + 1}` : "";
      console.log(
        `[STEP EXECUTION] Parsed typed AI response${pageInfo}: type=${typedAiResponse.type}, values=${typedAiResponse.values.length}`
      );

      return typedAiResponse;
    } else if (Array.isArray(parsedResponse)) {
      // Handle legacy array format - determine type based on content
      const firstItem = parsedResponse[0];
      if (typeof firstItem === "string") {
        // Check if it looks like a URL or an ID
        const isUrl = firstItem.startsWith("http") || firstItem.includes("/");
        const typedAiResponse: TypedAiResponse = {
          type: isUrl ? "url" : "id",
          values: parsedResponse,
        };

        const pageInfo = pageIndex != null ? ` for page ${pageIndex + 1}` : "";
        console.log(
          `[STEP EXECUTION] Converted legacy array to typed response${pageInfo}: type=${typedAiResponse.type}, values=${typedAiResponse.values.length}`
        );

        return typedAiResponse;
      }
    }
  } catch (parseError) {
    const pageInfo = pageIndex != null ? ` for page ${pageIndex + 1}` : "";
    console.error(`[STEP EXECUTION] Failed to parse AI response as JSON${pageInfo}: ${parseError}`);
    console.log(`[STEP EXECUTION] AI Response: ${aiResponse}`);
  }

  return undefined;
}
