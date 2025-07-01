"use client";

import type {
  ScrapeDownloadStep,
  ScrapeConfiguration,
  StepExecutionResult,
} from "@lib/actions/scraping";

import { PlaywrightStep, AiPromptStep } from "./index";

type Props = {
  step: ScrapeDownloadStep;
  configuration: ScrapeConfiguration;
  isRunning?: boolean;
  isLast?: boolean;
  hasNextStep?: boolean;
  nextStepType?: "playwright" | "ai_prompt" | "links_analysis";
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
    case "links_analysis":
      // TODO: Implement links analysis step component
      return (
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          <p>Links Analysis step - not implemented yet</p>
        </div>
      );
    default:
      return (
        <div className="rounded-lg border p-4 text-center text-muted-foreground">
          <p>Unknown step type: {step.step_type}</p>
        </div>
      );
  }
}
