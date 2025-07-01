"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

import type { ScrapeDownloadStep } from "@lib/actions/scraping";

import StepCard from "./step-card";
import { Label } from "../../../ui/label";

interface Props {
  step: ScrapeDownloadStep;
  isRunning?: boolean;
}

export default function AiPromptStep({ step, isRunning = false }: Readonly<Props>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const promptData = step.prompt_data ?? [];

  return (
    <StepCard
      stepTypeIcon={<MessageSquare className="h-5 w-5 text-green-600" />}
      stepTypeLabel="AI Prompt Analysis"
      stepOrder={step.step_order}
      title={step.name}
      description={step.description}
      expanded={isExpanded}
      onToggle={() => setIsExpanded((v) => !v)}
      isRunning={isRunning}
    >
      <div className="space-y-4">
        {promptData.map((prompt, index) => (
          <div key={index} className="space-y-3">
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div>
                <Label className="text-sm font-medium">Prompt</Label>
                <div className="mt-2 rounded border bg-background p-3 text-sm">
                  <pre className="whitespace-pre-wrap">{prompt.prompt}</pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </StepCard>
  );
}
