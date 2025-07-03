"use client";

import type {
  ScrapeDownloadStep,
  ScrapeConfiguration,
  StepExecutionResult,
  StepType,
} from "@lib/actions/scraping";

import CreateOpportunityStep from "./create-opportunity-step";

import { PlaywrightStep, AiPromptStep } from "./index";

type Props = {
  step: ScrapeDownloadStep;
  configuration: ScrapeConfiguration;
  isRunning?: boolean;
  isLast?: boolean;
  hasNextStep?: boolean;
  nextStepType?: StepType;
  stepResult?: StepExecutionResult;
};

export default function StepRenderer({
  step,
  configuration,
  isRunning = false,
  isLast = false,
  hasNextStep = false,
  nextStepType,
  stepResult,
}: Readonly<Props>) {
  switch (step.step_type) {
    case "playwright":
      return (
        <PlaywrightStep
          step={step}
          configuration={configuration}
          isRunning={isRunning}
          isLast={isLast}
          hasNextStep={hasNextStep}
          nextStepType={nextStepType}
          stepResult={stepResult}
        />
      );
    case "ai_prompt":
      return (
        <AiPromptStep
          step={step}
          isRunning={isRunning}
          isLast={isLast}
          hasNextStep={hasNextStep}
          nextStepType={nextStepType}
          stepResult={stepResult}
        />
      );
    case "create_opportunity":
      return (
        <CreateOpportunityStep
          step={step}
          isRunning={isRunning}
          isLast={isLast}
          hasNextStep={hasNextStep}
          nextStepType={nextStepType}
          stepResult={stepResult}
        />
      );
    default:
      return (
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          <p>Unknown step type: {step.step_type}</p>
        </div>
      );
  }
}
