"use client";

import { Code } from "lucide-react";
import { useState } from "react";

import type {
  ScrapeDownloadStep,
  ScrapeConfiguration,
  StepType,
  StepExecutionResult,
} from "@lib/actions/scraping";

import ScrapeConfigurationSteps from "../../scrape-configuration-steps";

import StepCard from "./step-card";
import StepDownloadedFiles from "./step-downloaded-files";

interface Props {
  step: ScrapeDownloadStep;
  configuration: ScrapeConfiguration;
  isRunning?: boolean;
  stepResult?: StepExecutionResult;
}

export default function PlaywrightStep({
  step,
  configuration,
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
  const subSteps = step.sub_steps ?? [];

  // Compute preview and glow for Downloaded File or Text Results
  const fileName = stepResult?.downloadPath?.split("/").pop();
  const hasFile = fileName != null && fileName !== "";

  // Check for text results in new format
  const hasPageTextContent =
    stepResult?.pageTextContent != null && stepResult.pageTextContent.length > 0;
  const hasTextResults = hasPageTextContent;

  let stepOutputPreview;
  if (hasFile) {
    stepOutputPreview = (
      <div>
        <div className="font-medium">{fileName}</div>
        <div className="text-xs text-muted-foreground" />
      </div>
    );
  } else if (hasTextResults) {
    // New format: show page-based content
    const totalPages = stepResult.pageTextContent!.length;
    const totalContentPieces = stepResult.pageTextContent!.reduce(
      (sum, page) => sum + page.content.length,
      0
    );
    const firstPageContent = stepResult.pageTextContent![0]?.content[0] ?? "";

    stepOutputPreview = (
      <div>
        <div className="font-medium">
          {totalPages} page(s), {totalContentPieces} text piece(s) extracted
        </div>
        <div className="text-xs text-muted-foreground">
          {firstPageContent.substring(0, 1000)}...
        </div>
      </div>
    );
  } else {
    stepOutputPreview = <div className="text-xs text-muted-foreground">No results yet.</div>;
  }
  const stepOutputGlow = hasFile || hasTextResults;
  let playwrightOutputType: "file" | "text" | undefined;
  if (hasTextResults) {
    playwrightOutputType = "text";
  } else if (hasFile) {
    playwrightOutputType = "file";
  }

  return (
    <StepCard
      stepTypeIcon={<Code className="h-5 w-5" />}
      stepTypeLabel="Playwright Web Scrape"
      stepOrder={step.step_order}
      title={step.name}
      description={step.description}
      expanded={isExpanded}
      onToggle={() => setIsExpanded((v) => !v)}
      isRunning={isRunning}
      showConnector={true}
      stepType="playwright"
      isLast={isLast}
      hasNextStep={hasNextStep}
      nextStepType={nextStepType}
      stepOutputPreview={stepOutputPreview}
      stepOutputGlow={stepOutputGlow}
      playwrightOutputType={playwrightOutputType}
      stepResult={stepResult}
    >
      <div className="space-y-4">
        <ScrapeConfigurationSteps subSteps={subSteps} />
        <StepDownloadedFiles configuration={configuration} step={step} />
      </div>
    </StepCard>
  );
}
