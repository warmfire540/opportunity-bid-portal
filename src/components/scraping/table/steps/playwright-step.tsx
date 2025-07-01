"use client";

import { Code } from "lucide-react";
import { useState } from "react";

import type { ScrapeDownloadStep, ScrapeConfiguration } from "@lib/actions/scraping";

import ScrapeConfigurationSteps from "../../scrape-configuration-steps";

import StepCard from "./step-card";
import StepDownloadedFiles from "./step-downloaded-files";

interface Props {
  step: ScrapeDownloadStep;
  configuration: ScrapeConfiguration;
  isRunning?: boolean;
  stepResult?: any;
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
    nextStepType?: "playwright" | "ai_prompt" | "links_analysis";
  }
>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const subSteps = step.sub_steps ?? [];

  // Compute preview and glow for Downloaded File
  const fileName = stepResult?.downloadPath?.split("/").pop();
  const hasFile = !!fileName;

  const stepOutputPreview = hasFile ? (
    <div>
      <div className="font-medium">{fileName}</div>
      <div className="text-xs text-muted-foreground" />
    </div>
  ) : (
    <div className="text-xs text-muted-foreground">No file downloaded yet.</div>
  );
  const stepOutputGlow = hasFile;

  return (
    <StepCard
      stepTypeIcon={<Code className="h-5 w-5" />}
      stepTypeLabel="Playwright File Download"
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
    >
      <div className="space-y-4">
        <ScrapeConfigurationSteps subSteps={subSteps} />
        <StepDownloadedFiles configuration={configuration} step={step} />
      </div>
    </StepCard>
  );
}
