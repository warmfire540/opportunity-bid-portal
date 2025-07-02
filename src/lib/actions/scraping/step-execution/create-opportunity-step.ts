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
  previousStepResults?: StepExecutionResult[]
): Promise<StepExecutionResult> {
  console.log(`[STEP EXECUTION] Starting create opportunity step: ${step.name}`);

  try {
    if (!step.create_opportunity_data || step.create_opportunity_data.length === 0) {
      throw new Error("No create opportunity data configured for this step");
    }

    const createOpportunityConfig = step.create_opportunity_data[0];

    // Process previous step results to extract opportunity data and market insights
    const opportunities: Partial<Opportunity>[] = [];
    const marketInsights: Partial<MarketInsight>[] = [];

    if (previousStepResults != null && previousStepResults.length > 0) {
      for (const result of previousStepResults) {
        if (result.success && result.aiResponse != null && result.aiResponse !== "") {
          try {
            // Parse AI response to extract opportunity data and market insights
            const parsedData = JSON.parse(result.aiResponse);

            // Extract opportunities
            if (
              parsedData != null &&
              typeof parsedData === "object" &&
              "opportunities" in parsedData &&
              Array.isArray(parsedData.opportunities)
            ) {
              for (const item of parsedData.opportunities) {
                const opportunity = createOpportunityFromData(
                  item,
                  createOpportunityConfig,
                  result.downloadUrl ?? ""
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
                  result.downloadUrl ?? ""
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
                result.downloadUrl ?? ""
              );
              if (opportunity != null) {
                opportunities.push(opportunity);
              }
            }

            // Extract market insights
            if (
              parsedData != null &&
              typeof parsedData === "object" &&
              "marketInsights" in parsedData &&
              Array.isArray(parsedData.marketInsights)
            ) {
              for (const insight of parsedData.marketInsights) {
                const marketInsight = createMarketInsightFromData(
                  insight,
                  configuration.id ?? "",
                  result.downloadUrl ?? ""
                );
                if (marketInsight != null) {
                  marketInsights.push(marketInsight);
                }
              }
            }
          } catch (parseError) {
            console.warn(`[STEP EXECUTION] Failed to parse AI response as JSON: ${parseError}`);
            // Try to create a basic opportunity from the raw text
            const opportunity = createBasicOpportunityFromText(
              result.aiResponse,
              createOpportunityConfig,
              result.downloadUrl ?? ""
            );
            if (opportunity != null) {
              opportunities.push(opportunity);
            }
          }
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

      if (insertError) {
        console.error(`[STEP EXECUTION] Failed to insert opportunity: ${insertError.message}`);
      } else if (createdOpp) {
        createdOpportunities.push(createdOpp as Opportunity);
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

      if (insertError) {
        console.error(`[STEP EXECUTION] Failed to insert market insight: ${insertError.message}`);
      } else if (createdInsight) {
        createdMarketInsights.push(createdInsight as MarketInsight);
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
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

function createOpportunityFromData(
  data: any,
  config: CreateOpportunityStep,
  sourceUrl: string
): Partial<Opportunity> | null {
  try {
    const opportunity: Partial<Opportunity> = {
      title: extractValue(data, config.title_template) || "Untitled Opportunity",
      description: config.description_template
        ? extractValue(data, config.description_template)
        : undefined,
      source: extractValue(data, config.source_template) || sourceUrl,
      status: "new",
      bid_number: config.bid_number_field ? extractValue(data, config.bid_number_field) : undefined,
      agency: config.agency_field ? extractValue(data, config.agency_field) : undefined,
      due_date: config.due_date_field
        ? parseDate(extractValue(data, config.due_date_field))
        : undefined,
      estimated_value: config.estimated_value_field
        ? parseNumber(extractValue(data, config.estimated_value_field))
        : undefined,
      commodity_codes: config.commodity_codes_field
        ? parseArray(extractValue(data, config.commodity_codes_field))
        : undefined,
      contact_info: config.contact_info_template
        ? extractContactInfo(data, config.contact_info_template)
        : undefined,
      requirements: config.requirements_template
        ? extractValue(data, config.requirements_template)
        : undefined,
      tags: config.tags_template ? extractTags(data, config.tags_template) : undefined,
    };

    return opportunity;
  } catch (error) {
    console.error(`[STEP EXECUTION] Error creating opportunity from data: ${error}`);
    return null;
  }
}

function createBasicOpportunityFromText(
  text: string,
  config: CreateOpportunityStep,
  sourceUrl: string
): Partial<Opportunity> | null {
  try {
    const opportunity: Partial<Opportunity> = {
      title: "Opportunity from Scraped Data",
      description: text.length > 500 ? text.substring(0, 500) + "..." : text,
      source: sourceUrl,
      status: "new",
    };

    return opportunity;
  } catch (error) {
    console.error(`[STEP EXECUTION] Error creating basic opportunity from text: ${error}`);
    return null;
  }
}

function extractValue(data: any, template: string): string | undefined {
  if (!template || !data) return undefined;

  // Simple template replacement for now
  // Replace {{field}} with data[field] or data.field
  let result = template;
  const matches = template.match(/\{\{([^}]+)\}\}/g);

  if (matches) {
    for (const match of matches) {
      const field = match.replace(/\{\{|\}\}/g, "");
      const value = data[field] || data[field.replace(/_/g, ".")];
      result = result.replace(match, value || "");
    }
  }

  return result || undefined;
}

function parseDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined;
  try {
    return new Date(dateString);
  } catch {
    return undefined;
  }
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ""));
  return isNaN(parsed) ? undefined : parsed;
}

function parseArray(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  try {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      // Try to parse as JSON array first
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      // If not JSON, split by common delimiters
      return value
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function extractContactInfo(
  data: any,
  template: Record<string, any>
): Record<string, any> | undefined {
  if (!template || !data) return undefined;

  const contactInfo: Record<string, any> = {};

  for (const [key, field] of Object.entries(template)) {
    if (typeof field === "string") {
      const value = extractValue(data, field);
      if (value) {
        contactInfo[key] = value;
      }
    }
  }

  return Object.keys(contactInfo).length > 0 ? contactInfo : undefined;
}

function extractTags(data: any, template: string[]): string[] | undefined {
  if (!template || !Array.isArray(template)) return undefined;

  const tags: string[] = [];

  for (const tagTemplate of template) {
    const value = extractValue(data, tagTemplate);
    if (value) {
      tags.push(value);
    }
  }

  return tags.length > 0 ? tags : undefined;
}

function createMarketInsightFromData(
  data: any,
  configurationId: string,
  sourceUrl: string
): Partial<MarketInsight> | null {
  try {
    const insight: Partial<MarketInsight> = {
      scrape_configuration_id: configurationId,
      insight_type: data.insight_type || "market_overview",
      title: data.title || "Market Insight",
      description: data.description,
      insights: Array.isArray(data.insights)
        ? data.insights
        : [data.insights || "No specific insights provided"],
      source_data: data.source_data || `Derived from ${sourceUrl}`,
      confidence_level: data.confidence_level || "medium",
      actionable: data.actionable ?? true,
    };

    return insight;
  } catch (error) {
    console.error(`[STEP EXECUTION] Error creating market insight from data: ${error}`);
    return null;
  }
}
