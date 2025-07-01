"use client";

import type { ScrapeDownloadStep, ScrapeConfiguration } from "@lib/actions/scrape-configurations";

import { PlaywrightStep, AiPromptStep } from "./index";

type Props = {
  step: ScrapeDownloadStep;
  configuration: ScrapeConfiguration;
};

export default function StepRenderer({ step, configuration }: Readonly<Props>) {
  switch (step.step_type) {
    case "playwright":
      return <PlaywrightStep step={step} configuration={configuration} />;
    case "prompt_steps":
      return <AiPromptStep step={step} />;
    case "ai_prompt":
      return <AiPromptStep step={step} />;
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