"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";

import type { ScrapeDownloadStep, StepType } from "@lib/actions/scraping";

import { Label } from "../../../ui/label";

import StepCard from "./step-card";

interface Props {
  step: ScrapeDownloadStep;
  isRunning?: boolean;
  stepResult?: any;
}

export default function AiPromptStep({
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

  // Use the AI response from the result
  const aiResponse = stepResult?.aiResponse ?? "";
  const stepOutputPreview =
    aiResponse !== "" ? (
      <div>
        <div className="text-xs text-muted-foreground">
          {aiResponse.slice(0, 4000)}
          {aiResponse.length > 4000 ? "…" : ""}
        </div>
        <div className="text-xs text-muted-foreground">AI generated content</div>
      </div>
    ) : (
      <div className="text-xs text-muted-foreground">No AI response yet.</div>
    );
  const stepOutputGlow = aiResponse !== "";

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
      showConnector={true}
      stepType="ai_prompt"
      isLast={isLast}
      hasNextStep={hasNextStep}
      nextStepType={nextStepType}
      stepOutputPreview={stepOutputPreview}
      stepOutputGlow={stepOutputGlow}
      stepResult={stepResult}
    >
      <div className="space-y-4">
        {step.ai_prompt_data?.map((prompt, index) => (
          <div key={index} className="space-y-3">
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div>
                <Label className="text-sm font-medium">Prompt</Label>
                <div className="mt-2 rounded border bg-background p-3 text-sm">
                  <pre className="whitespace-pre-wrap">{prompt.prompt}</pre>
                </div>
              </div>

              {prompt.system_prompt != null && prompt.system_prompt !== "" && (
                <div>
                  <Label className="text-sm font-medium">System Prompt</Label>
                  <div className="mt-2 rounded border bg-background p-3 text-sm">
                    <pre className="whitespace-pre-wrap text-muted-foreground">
                      {prompt.system_prompt}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </StepCard>
  );
}
