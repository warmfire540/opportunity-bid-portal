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
  console.log(`[STEP EXECUTION] Starting create opportunity step: ${step.name}`);

  try {
    if (!step.create_opportunity_data || step.create_opportunity_data.length === 0) {
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
                console.log(`[STEP EXECUTION] Processing AI response from page ${Number(pageResult.pageIndex) + 1} (${pageResult.pageId})`);
                
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
                } else if (
                  pageAiData != null &&
                  typeof pageAiData === "object"
                ) {
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
                console.error(`[STEP EXECUTION] Failed to parse AI response from page ${Number(pageResult.pageIndex) + 1}: ${pageParseError}`);
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
          } else if (
            parsedData != null &&
            typeof parsedData === "object"
          ) {
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
      title: extractValue(data, config.title_template) ?? "Untitled Opportunity",
      description: config.description_template
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
      strategic_fit: data.strategicFit ? data.strategicFit.toLowerCase() : undefined,
      go_no_go_decision: data.goNoGoDecision,
      key_messaging_points: Array.isArray(data.keyMessagingPoints)
        ? data.keyMessagingPoints
        : undefined,
      risk_assessment: data.riskAssessment,
      win_probability: data.winProbability,
      required_certifications: Array.isArray(data.requiredCertifications)
        ? data.requiredCertifications
        : undefined,
      keywords: Array.isArray(data.keywords) ? data.keywords : undefined,
      service_areas: Array.isArray(data.serviceAreas) ? data.serviceAreas : undefined,
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

function createMarketInsightsFromData(
  data: any,
  configurationId: string,
  sourceUrl: string
): Partial<MarketInsight>[] {
  const insights: Partial<MarketInsight>[] = [];

  try {
    // Process trends
    if (Array.isArray(data.trends)) {
      for (const trend of data.trends) {
        insights.push({
          scrape_configuration_id: configurationId,
          insight_type: "trends",
          insight_text: trend,
        });
      }
    }

    // Process prioritization
    if (Array.isArray(data.prioritization)) {
      for (const priority of data.prioritization) {
        insights.push({
          scrape_configuration_id: configurationId,
          insight_type: "prioritization",
          insight_text: priority,
        });
      }
    }

    // Process resource needs
    if (Array.isArray(data.resourceNeeds)) {
      for (const need of data.resourceNeeds) {
        insights.push({
          scrape_configuration_id: configurationId,
          insight_type: "resource_needs",
          insight_text: need,
        });
      }
    }

    // Process competitive analysis
    if (Array.isArray(data.competitiveAnalysis)) {
      for (const analysis of data.competitiveAnalysis) {
        insights.push({
          scrape_configuration_id: configurationId,
          insight_type: "competitive_analysis",
          insight_text: analysis,
        });
      }
    }

    // Process market overview
    if (Array.isArray(data.marketOverview)) {
      for (const overview of data.marketOverview) {
        insights.push({
          scrape_configuration_id: configurationId,
          insight_type: "market_overview",
          insight_text: overview,
        });
      }
    }

    return insights;
  } catch (error) {
    console.error(`[STEP EXECUTION] Error creating market insights from data: ${error}`);
    return [];
  }
}
