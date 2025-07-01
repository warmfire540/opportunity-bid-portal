"use client";

import type { PromptStep } from "@lib/actions/scraping";

import { Label } from "../../../ui/label";
import { Textarea } from "../../../ui/textarea";

type Props = {
  promptData: PromptStep[];
  onUpdate: (promptData: PromptStep[]) => void;
};

export default function AiPromptStep({ promptData, onUpdate }: Readonly<Props>) {
  const updatePromptStep = (field: keyof PromptStep, value: any) => {
    const updatedPromptData = [
      {
        ...(promptData?.[0] ?? { prompt: "" }),
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
            value={promptData?.[0]?.prompt ?? ""}
            onChange={(e) => updatePromptStep("prompt", e.target.value)}
            placeholder="Enter your AI prompt here..."
            rows={8}
          />
        </div>
      </div>
    </div>
  );
}
