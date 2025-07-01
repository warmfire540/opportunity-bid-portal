"use client";

import { Code } from "lucide-react";
import { useState } from "react";

import type { ScrapeDownloadStep, ScrapeConfiguration } from "@lib/actions/scraping";

import ScrapeConfigurationSteps from "../../scrape-configuration-steps";

import StepCard from "./step-card";

interface Props {
  step: ScrapeDownloadStep;
  configuration: ScrapeConfiguration;
  isRunning?: boolean;
}

export default function PlaywrightStep({
  step,
  isRunning = false,
  isLast = false,
  hasNextStep = false,
  nextStepType,
}: Readonly<
  Props & {
    isLast?: boolean;
    hasNextStep?: boolean;
    nextStepType?: "playwright" | "ai_prompt" | "links_analysis";
  }
>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const subSteps = step.sub_steps ?? [];

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
    >
      <ScrapeConfigurationSteps subSteps={subSteps} />
    </StepCard>
  );
}
