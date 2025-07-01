"use client";

import { useState } from "react";
import { Code, ChevronDown, ChevronRight } from "lucide-react";

import type { ScrapeDownloadStep, ScrapeConfiguration } from "@lib/actions/scrape-configurations";

import StepCard from "./step-card";
import ScrapeConfigurationSteps from "../scrape-configuration-steps";

interface Props {
  step: ScrapeDownloadStep;
  configuration: ScrapeConfiguration;
  isRunning?: boolean;
}

export default function PlaywrightStep({ step, isRunning = false }: Readonly<Props>) {
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
    >
      <ScrapeConfigurationSteps subSteps={subSteps} />
    </StepCard>
  );
} 