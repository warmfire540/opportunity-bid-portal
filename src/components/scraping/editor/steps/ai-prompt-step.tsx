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
        ...(promptData?.[0] ?? { prompt: "", storage_ids: [] }),
        [field]: value,
      },
    ];
    onUpdate(updatedPromptData);
  };

  const updatePromptStepStorageIds = (fileId: string, checked: boolean) => {
    const updatedPromptData = [
      {
        ...(promptData?.[0] ?? { prompt: "", storage_ids: [] }),
        storage_ids: checked
          ? [...(promptData?.[0]?.storage_ids ?? []), fileId]
          : (promptData?.[0]?.storage_ids ?? []).filter((id) => id !== fileId),
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

        <div>
          <Label className="text-sm">Storage Files (Multi-select)</Label>
          <div className="rounded-md border p-3">
            <div className="space-y-2">
              {["fake-storage-id-1", "fake-storage-id-2", "fake-storage-id-3"].map((fileId) => (
                <div key={fileId} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={fileId}
                    checked={promptData?.[0]?.storage_ids?.includes(fileId) ?? false}
                    onChange={(e) => updatePromptStepStorageIds(fileId, e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={fileId} className="text-sm">
                    {fileId.includes("florida-rfp-data-2024-01")
                      ? "florida-rfp-data-2024-01.xlsx"
                      : fileId.includes("florida-rfp-data-2024-02")
                        ? "florida-rfp-data-2024-02.xlsx"
                        : fileId.includes("florida-rfp-data-2024-03")
                          ? "florida-rfp-data-2024-03.xlsx"
                          : fileId}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
