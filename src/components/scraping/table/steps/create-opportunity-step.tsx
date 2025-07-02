"use client";

import { Briefcase } from "lucide-react";
import { useState } from "react";

import type { ScrapeDownloadStep, StepType, StepExecutionResult } from "@lib/actions/scraping";

import StepCard from "./step-card";

interface Props {
  step: ScrapeDownloadStep;
  isRunning?: boolean;
  stepResult?: StepExecutionResult;
}

export default function CreateOpportunityStep({
  step,
  isRunning = false,
  isLast = false,
  hasNextStep = false,
  nextStepType,
  stepResult,
}: Readonly<
  Props & {
    isLast?: boolean;
    hasNextStep?: boolean;
    nextStepType?: StepType;
  }
>) {
  const [isExpanded, setIsExpanded] = useState(false);

  const createOpportunityData = step.create_opportunity_data?.[0];

  const stepOutputPreview =
    stepResult?.opportunities != null || stepResult?.marketInsights != null ? (
      <div className="space-y-4">
        {stepResult.opportunities != null && stepResult.opportunities.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Created Opportunities:</div>
            <div className="text-xs text-muted-foreground">
              {stepResult.opportunities.length} opportunities created
            </div>
            {stepResult.opportunities.slice(0, 3).map((opp, index) => (
              <div key={index} className="text-xs">
                • {opp.title}
              </div>
            ))}
            {stepResult.opportunities.length > 3 && (
              <div className="text-xs text-muted-foreground">
                ... and {stepResult.opportunities.length - 3} more
              </div>
            )}
          </div>
        )}

        {stepResult.marketInsights != null && stepResult.marketInsights.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Market Insights:</div>
            <div className="text-xs text-muted-foreground">
              {stepResult.marketInsights.length} insights generated
            </div>
            {stepResult.marketInsights.slice(0, 3).map((insight, index) => (
              <div key={index} className="text-xs">
                • {insight.title}
              </div>
            ))}
            {stepResult.marketInsights.length > 3 && (
              <div className="text-xs text-muted-foreground">
                ... and {stepResult.marketInsights.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>
    ) : undefined;

  const stepOutputGlow =
    stepResult?.success === true &&
    ((stepResult.opportunities != null && stepResult.opportunities.length > 0) ||
      (stepResult.marketInsights != null && stepResult.marketInsights.length > 0));

  return (
    <StepCard
      stepTypeIcon={<Briefcase className="h-5 w-5" />}
      stepTypeLabel="Create Opportunity"
      stepOrder={step.step_order}
      title={step.name}
      description={step.description}
      expanded={isExpanded}
      onToggle={() => setIsExpanded((v) => !v)}
      isRunning={isRunning}
      showConnector={true}
      stepType="create_opportunity"
      isLast={isLast}
      hasNextStep={hasNextStep}
      nextStepType={nextStepType}
      stepOutputPreview={stepOutputPreview}
      stepOutputGlow={stepOutputGlow}
      stepResult={stepResult}
    >
      <div className="space-y-4">
        {createOpportunityData != null && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium">Title Template</div>
                <div className="text-xs text-muted-foreground">
                  {createOpportunityData.title_template}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Source Template</div>
                <div className="text-xs text-muted-foreground">
                  {createOpportunityData.source_template}
                </div>
              </div>
            </div>

            {createOpportunityData.description_template != null &&
              createOpportunityData.description_template !== "" && (
                <div>
                  <div className="text-sm font-medium">Description Template</div>
                  <div className="text-xs text-muted-foreground">
                    {createOpportunityData.description_template}
                  </div>
                </div>
              )}

            <div className="grid grid-cols-2 gap-3">
              {createOpportunityData.bid_number_field != null &&
                createOpportunityData.bid_number_field !== "" && (
                  <div>
                    <div className="text-sm font-medium">Bid Number Field</div>
                    <div className="text-xs text-muted-foreground">
                      {createOpportunityData.bid_number_field}
                    </div>
                  </div>
                )}
              {createOpportunityData.agency_field != null &&
                createOpportunityData.agency_field !== "" && (
                  <div>
                    <div className="text-sm font-medium">Agency Field</div>
                    <div className="text-xs text-muted-foreground">
                      {createOpportunityData.agency_field}
                    </div>
                  </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {createOpportunityData.due_date_field != null &&
                createOpportunityData.due_date_field !== "" && (
                  <div>
                    <div className="text-sm font-medium">Due Date Field</div>
                    <div className="text-xs text-muted-foreground">
                      {createOpportunityData.due_date_field}
                    </div>
                  </div>
                )}
              {createOpportunityData.estimated_value_field != null &&
                createOpportunityData.estimated_value_field !== "" && (
                  <div>
                    <div className="text-sm font-medium">Estimated Value Field</div>
                    <div className="text-xs text-muted-foreground">
                      {createOpportunityData.estimated_value_field}
                    </div>
                  </div>
                )}
            </div>

            {createOpportunityData.commodity_codes_field != null &&
              createOpportunityData.commodity_codes_field !== "" && (
                <div>
                  <div className="text-sm font-medium">Commodity Codes Field</div>
                  <div className="text-xs text-muted-foreground">
                    {createOpportunityData.commodity_codes_field}
                  </div>
                </div>
              )}

            {createOpportunityData.requirements_template != null &&
              createOpportunityData.requirements_template !== "" && (
                <div>
                  <div className="text-sm font-medium">Requirements Template</div>
                  <div className="text-xs text-muted-foreground">
                    {createOpportunityData.requirements_template}
                  </div>
                </div>
              )}

            {createOpportunityData.tags_template != null &&
              createOpportunityData.tags_template.length > 0 && (
                <div>
                  <div className="text-sm font-medium">Tags Template</div>
                  <div className="text-xs text-muted-foreground">
                    {createOpportunityData.tags_template.join(", ")}
                  </div>
                </div>
              )}
          </div>
        )}

        {stepResult != null && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Execution Result</div>
            {stepResult.success ? (
              <div className="space-y-1">
                <div className="text-xs text-green-600">
                  Successfully created {stepResult.opportunityCount ?? 0} opportunities
                </div>
                {stepResult.marketInsights != null && stepResult.marketInsights.length > 0 && (
                  <div className="text-xs text-blue-600">
                    Generated {stepResult.marketInsights.length} market insights
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-red-600">Error: {stepResult.error}</div>
            )}
          </div>
        )}
      </div>
    </StepCard>
  );
}
