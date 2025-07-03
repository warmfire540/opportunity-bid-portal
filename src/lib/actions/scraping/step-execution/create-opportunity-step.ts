"use server";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ScrapeConfiguration,
  ScrapeDownloadStep,
  StepExecutionResult,
  CreateOpportunityStep,
  Opportunity,
  MarketInsight,
} from "../types";

export async function executeCreateOpportunityStep(
  step: ScrapeDownloadStep,
  configuration: ScrapeConfiguration,
  supabase: SupabaseClient,
  previousStepResult?: StepExecutionResult
): Promise<StepExecutionResult> {
  console.log(`[STEP EXECUTION] Executing create opportunity step: ${step.name}`);

  try {
    if (step.create_opportunity_data == null || step.create_opportunity_data.length === 0) {
      throw new Error("No create opportunity data configured for this step");
    }

    const createOpportunityConfig = step.create_opportunity_data[0];

    // Process the immediate previous step result to extract opportunity data and market insights
    const opportunities: Partial<Opportunity>[] = [];
    const marketInsights: Partial<MarketInsight>[] = [];

    if (
      previousStepResult != null &&
      previousStepResult.success &&
      typeof previousStepResult.aiResponse === "string" &&
      previousStepResult.aiResponse !== ""
    ) {
      try {
        // Parse AI response to extract opportunity data and market insights
        const parsedData = JSON.parse(previousStepResult.aiResponse);

        // Check if this is the new multi-page format
        if (
          Array.isArray(parsedData) &&
          parsedData.length > 0 &&
          typeof parsedData[0] === "object" &&
          parsedData[0] != null &&
          Object.prototype.hasOwnProperty.call(parsedData[0], "aiResponse")
        ) {
          // Handle multi-page AI responses
          console.log(`[STEP EXECUTION] Processing ${parsedData.length} pages of AI responses`);

          for (const pageResult of parsedData) {
            if (
              pageResult != null &&
              typeof pageResult.aiResponse === "string" &&
              pageResult.aiResponse !== ""
            ) {
              try {
                const pageAiData = JSON.parse(pageResult.aiResponse);
                console.log(
                  `[STEP EXECUTION] Processing AI response from page ${Number(pageResult.pageIndex) + 1} (${pageResult.pageId})`
                );

                // Extract opportunities from this page
                if (
                  pageAiData != null &&
                  typeof pageAiData === "object" &&
                  Object.prototype.hasOwnProperty.call(pageAiData, "opportunities") &&
                  Array.isArray(pageAiData.opportunities)
                ) {
                  for (const item of pageAiData.opportunities) {
                    const opportunity = createOpportunityFromData(
                      item,
                      createOpportunityConfig,
                      previousStepResult.downloadUrl ?? ""
                    );
                    if (opportunity != null) {
                      opportunities.push(opportunity);
                    }
                  }
                } else if (Array.isArray(pageAiData)) {
                  // Handle array of opportunities (backward compatibility)
                  for (const item of pageAiData) {
                    const opportunity = createOpportunityFromData(
                      item,
                      createOpportunityConfig,
                      previousStepResult.downloadUrl ?? ""
                    );
                    if (opportunity != null) {
                      opportunities.push(opportunity);
                    }
                  }
                } else if (pageAiData != null && typeof pageAiData === "object") {
                  // Handle single opportunity (backward compatibility)
                  const opportunity = createOpportunityFromData(
                    pageAiData,
                    createOpportunityConfig,
                    previousStepResult.downloadUrl ?? ""
                  );
                  if (opportunity != null) {
                    opportunities.push(opportunity);
                  }
                }

                // Extract market insights from this page
                if (
                  pageAiData != null &&
                  typeof pageAiData === "object" &&
                  Object.prototype.hasOwnProperty.call(pageAiData, "marketInsights") &&
                  typeof pageAiData.marketInsights === "object" &&
                  pageAiData.marketInsights != null
                ) {
                  const insights = createMarketInsightsFromData(
                    pageAiData.marketInsights,
                    configuration.id ?? "",
                    previousStepResult.downloadUrl ?? ""
                  );
                  marketInsights.push(...insights);
                }
              } catch (pageParseError) {
                console.error(
                  `[STEP EXECUTION] Failed to parse AI response from page ${Number(pageResult.pageIndex) + 1}: ${pageParseError}`
                );
                // Try to create a basic opportunity from the raw text
                const opportunity = createBasicOpportunityFromText(
                  pageResult.aiResponse,
                  createOpportunityConfig,
                  previousStepResult.downloadUrl ?? ""
                );
                if (opportunity != null) {
                  opportunities.push(opportunity);
                }
              }
            }
          }
        } else {
          // Handle single page format (backward compatibility)
          // Extract opportunities
          if (
            parsedData != null &&
            typeof parsedData === "object" &&
            Object.prototype.hasOwnProperty.call(parsedData, "opportunities") &&
            Array.isArray(parsedData.opportunities)
          ) {
            for (const item of parsedData.opportunities) {
              const opportunity = createOpportunityFromData(
                item,
                createOpportunityConfig,
                previousStepResult.downloadUrl ?? ""
              );
              if (opportunity != null) {
                opportunities.push(opportunity);
              }
            }
          } else if (Array.isArray(parsedData)) {
            // Handle array of opportunities (backward compatibility)
            for (const item of parsedData) {
              const opportunity = createOpportunityFromData(
                item,
                createOpportunityConfig,
                previousStepResult.downloadUrl ?? ""
              );
              if (opportunity != null) {
                opportunities.push(opportunity);
              }
            }
          } else if (parsedData != null && typeof parsedData === "object") {
            // Handle single opportunity (backward compatibility)
            const opportunity = createOpportunityFromData(
              parsedData,
              createOpportunityConfig,
              previousStepResult.downloadUrl ?? ""
            );
            if (opportunity != null) {
              opportunities.push(opportunity);
            }
          }

          // Extract market insights
          if (
            parsedData != null &&
            typeof parsedData === "object" &&
            Object.prototype.hasOwnProperty.call(parsedData, "marketInsights") &&
            typeof parsedData.marketInsights === "object" &&
            parsedData.marketInsights != null
          ) {
            const insights = createMarketInsightsFromData(
              parsedData.marketInsights,
              configuration.id ?? "",
              previousStepResult.downloadUrl ?? ""
            );
            marketInsights.push(...insights);
          }
        }
      } catch (parseError) {
        console.error(`[STEP EXECUTION] Failed to parse AI response as JSON: ${parseError}`);
        console.log(`[STEP EXECUTION] AI Response: ${previousStepResult.aiResponse}`);
        // Try to create a basic opportunity from the raw text
        const opportunity = createBasicOpportunityFromText(
          previousStepResult.aiResponse,
          createOpportunityConfig,
          previousStepResult.downloadUrl ?? ""
        );
        if (opportunity != null) {
          opportunities.push(opportunity);
        }
      }
    }

    // Insert opportunities into the database
    const createdOpportunities: Opportunity[] = [];
    for (const opportunity of opportunities) {
      const { data: createdOpp, error: insertError } = await supabase
        .from("opportunities")
        .insert(opportunity)
        .select()
        .single();

      if (insertError != null) {
        console.error(`[STEP EXECUTION] Failed to insert opportunity: ${insertError.message}`);
        continue;
      }

      if (createdOpp != null) {
        createdOpportunities.push(createdOpp);
      }
    }

    // Insert market insights into the database
    const createdMarketInsights: MarketInsight[] = [];
    for (const insight of marketInsights) {
      const { data: createdInsight, error: insertError } = await supabase
        .from("market_insights")
        .insert(insight)
        .select()
        .single();

      if (insertError != null) {
        console.error(`[STEP EXECUTION] Failed to insert market insight: ${insertError.message}`);
        continue;
      }

      if (createdInsight != null) {
        createdMarketInsights.push(createdInsight);
      }
    }

    console.log(
      `[STEP EXECUTION] Successfully created ${createdOpportunities.length} opportunities and ${createdMarketInsights.length} market insights`
    );

    return {
      success: true,
      opportunities: createdOpportunities,
      opportunityCount: createdOpportunities.length,
      marketInsights: createdMarketInsights,
    };
  } catch (error) {
    console.error(`[STEP EXECUTION] Error in create opportunity step: ${error}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

function createOpportunityFromData(
  data: unknown,
  config: CreateOpportunityStep,
  sourceUrl: string
): Partial<Opportunity> | null {
  if (data == null || typeof data !== "object") {
    return null;
  }

  const dataRecord = data as Record<string, unknown>;
  const opportunity: Partial<Opportunity> = {
    title: extractValue(data, config.title_template),
    description:
      config.description_template != null
        ? extractValue(data, config.description_template)
        : undefined,
    source: extractValue(data, config.source_template) ?? sourceUrl,
    status: "new",
    bid_number:
      config.bid_number_field != null ? extractValue(data, config.bid_number_field) : undefined,
    agency: config.agency_field != null ? extractValue(data, config.agency_field) : undefined,
    due_date:
      config.due_date_field != null
        ? parseDate(extractValue(data, config.due_date_field))
        : undefined,
    estimated_value:
      config.estimated_value_field != null
        ? parseNumber(extractValue(data, config.estimated_value_field))
        : undefined,
    commodity_codes:
      config.commodity_codes_field != null
        ? parseArray(extractValue(data, config.commodity_codes_field))
        : undefined,
    contact_info:
      config.contact_info_template != null
        ? extractContactInfo(data, config.contact_info_template)
        : undefined,
    requirements:
      config.requirements_template != null
        ? extractValue(data, config.requirements_template)
        : undefined,
    tags: config.tags_template != null ? extractTags(data, config.tags_template) : undefined,
    // AI analysis fields
    strategic_fit:
      typeof dataRecord.strategicFit === "string"
        ? (dataRecord.strategicFit.toLowerCase() as "low" | "medium" | "high")
        : undefined,
    go_no_go_decision:
      typeof dataRecord.goNoGoDecision === "string" ? dataRecord.goNoGoDecision : undefined,
    key_messaging_points: Array.isArray(dataRecord.keyMessagingPoints)
      ? (dataRecord.keyMessagingPoints as string[])
      : undefined,
    risk_assessment:
      typeof dataRecord.riskAssessment === "string" ? dataRecord.riskAssessment : undefined,
    win_probability:
      typeof dataRecord.winProbability === "string" ? dataRecord.winProbability : undefined,
    required_certifications: Array.isArray(dataRecord.requiredCertifications)
      ? (dataRecord.requiredCertifications as string[])
      : undefined,
    keywords: Array.isArray(dataRecord.keywords) ? (dataRecord.keywords as string[]) : undefined,
    service_areas: Array.isArray(dataRecord.serviceAreas)
      ? (dataRecord.serviceAreas as string[])
      : undefined,
  };

  // Remove undefined values
  return opportunity;
}

function createBasicOpportunityFromText(
  text: string,
  config: CreateOpportunityStep,
  sourceUrl: string
): Partial<Opportunity> | null {
  if (text === "") {
    return null;
  }

  return {
    title: `Opportunity from ${sourceUrl}`,
    description: text.length > 500 ? `${text.substring(0, 500)}...` : text,
    source: sourceUrl,
    status: "new",
  };
}

function extractValue(data: unknown, template: string): string | undefined {
  if (typeof data !== "object" || data == null) {
    return undefined;
  }

  // Simple template replacement - replace {{field}} with actual values
  let result = template;
  const matches = template.match(/\{\{([^}]+)\}\}/g);

  if (matches != null) {
    for (const match of matches) {
      const field = match.slice(2, -2); // Remove {{ and }}
      const value = (data as Record<string, unknown>)[field];
      if (value != null && typeof value === "string") {
        result = result.replace(match, value);
      }
    }
  }

  return result !== template ? result : undefined;
}

function parseDate(dateString: string | undefined): Date | undefined {
  if (dateString == null || dateString === "") {
    return undefined;
  }

  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function parseNumber(value: string | undefined): number | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}

function parseArray(value: string | undefined): string[] | undefined {
  if (value == null || value === "") {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    // If not valid JSON, treat as comma-separated string
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
  }
}

function extractContactInfo(
  data: unknown,
  template: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (typeof data !== "object" || data == null) {
    return undefined;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(template)) {
    if (typeof value === "string") {
      const extracted = extractValue(data, value);
      if (extracted != null) {
        result[key] = extracted;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function extractTags(data: unknown, template: string[]): string[] | undefined {
  if (typeof data !== "object" || data == null) {
    return undefined;
  }

  const tags: string[] = [];

  for (const tagTemplate of template) {
    const extracted = extractValue(data, tagTemplate);
    if (extracted != null && extracted !== "") {
      tags.push(extracted);
    }
  }

  return tags.length > 0 ? tags : undefined;
}

function createMarketInsightsFromData(
  data: unknown,
  configurationId: string,
  _sourceUrl: string
): Partial<MarketInsight>[] {
  if (typeof data !== "object" || data == null) {
    return [];
  }

  const insights: Partial<MarketInsight>[] = [];
  const insightTypes = [
    "trends",
    "prioritization",
    "resource_needs",
    "competitive_analysis",
    "market_overview",
  ] as const;

  for (const insightType of insightTypes) {
    const insightData = (data as Record<string, unknown>)[insightType];
    if (typeof insightData === "string" && insightData !== "") {
      insights.push({
        scrape_configuration_id: configurationId,
        insight_type: insightType,
        insight_text: insightData,
      });
    } else if (Array.isArray(insightData)) {
      for (const item of insightData) {
        if (typeof item === "string" && item !== "") {
          insights.push({
            scrape_configuration_id: configurationId,
            insight_type: insightType,
            insight_text: item,
          });
        }
      }
    }
  }

  return insights;
}
