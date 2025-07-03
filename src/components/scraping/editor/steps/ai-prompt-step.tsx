"use client";

import type { AiPromptStep } from "@lib/actions/scraping";

import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";

type Props = {
  ai_prompt_data: AiPromptStep[];
  onUpdate: (ai_prompt_data: AiPromptStep[]) => void;
};

export default function AiPromptStep({ ai_prompt_data, onUpdate }: Readonly<Props>) {
  const updatePromptStep = (field: keyof AiPromptStep, value: string) => {
    const updatedPromptData = [
      {
        ...(ai_prompt_data[0] ?? { prompt: "" }),
        [field]: value,
      },
    ];
    onUpdate(updatedPromptData);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="space-y-4">
        <Label className="text-sm font-medium">AI Prompt Configuration</Label>

        <div>
          <Label className="text-sm">Prompt</Label>
          <Textarea
            value={ai_prompt_data[0]?.prompt ?? ""}
            onChange={(e) => updatePromptStep("prompt", e.target.value)}
            placeholder="Enter your AI prompt here..."
            rows={8}
          />
        </div>

        <div>
          <Label className="text-sm">System Prompt (Optional)</Label>
          <Textarea
            value={ai_prompt_data[0]?.system_prompt ?? ""}
            onChange={(e) => updatePromptStep("system_prompt", e.target.value)}
            placeholder="Enter system instructions for AI behavior (e.g., response format, constraints)..."
            rows={4}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            System prompts define how the AI should behave and format its response. Leave empty to
            use default instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
