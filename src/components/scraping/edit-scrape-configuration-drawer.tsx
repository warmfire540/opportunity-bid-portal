"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Edit, ChevronDown, ChevronRight } from "lucide-react";

import type {
  ScrapeConfiguration,
  ScrapeDownloadStep,
  PlaywrightStep,
  PromptStep,
} from "@lib/actions/scrape-configurations";
import { updateScrapeConfiguration } from "@lib/actions/scrape-configurations";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

type Props = {
  configuration: ScrapeConfiguration;
  onUpdate?: () => void;
};

const STEP_TYPES = [
  { value: "playwright", label: "Playwright File Download" },
  { value: "ai_prompt", label: "AI Prompt" },
  { value: "links_analysis", label: "Links Analysis" },
  { value: "prompt_steps", label: "Prompt Steps" },
];

const ACTION_TYPES = [
  { value: "goto", label: "Navigate to URL" },
  { value: "click", label: "Click Element" },
  { value: "type", label: "Type Text" },
  { value: "select", label: "Select Option" },
  { value: "wait", label: "Wait" },
  { value: "waitForDownload", label: "Wait for Download" },
  { value: "saveDownload", label: "Save Download" },
];

const SELECTOR_TYPES = [
  { value: "role", label: "Role" },
  { value: "text", label: "Text" },
  { value: "css", label: "CSS Selector" },
  { value: "xpath", label: "XPath" },
];

export default function EditScrapeConfigurationDrawer({
  configuration,
  onUpdate,
}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ScrapeConfiguration>({
    id: configuration.id,
    name: configuration.name,
    description: configuration.description ?? "",
    target_url: configuration.target_url,
    is_active: configuration.is_active ?? true,
    steps: configuration.steps ?? [],
  });
  const [expandedPlaywrightSections, setExpandedPlaywrightSections] = useState<Set<number>>(
    new Set()
  );

  const togglePlaywrightSection = (stepIndex: number) => {
    setExpandedPlaywrightSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  const addStep = () => {
    const newStep: ScrapeDownloadStep = {
      step_order: formData.steps.length + 1,
      step_type: "playwright",
      name: "New Step",
      description: "",
      sub_steps: [],
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const updateStep = (index: number, field: keyof ScrapeDownloadStep, value: any) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? { ...step, [field]: value } : step)),
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_order: i + 1 })),
    }));
  };

  const addPlaywrightStep = (stepIndex: number) => {
    const newPlaywrightStep: PlaywrightStep = {
      step_order: (formData.steps[stepIndex].sub_steps?.length ?? 0) + 1,
      action_type: "click",
      selector: "",
      selector_type: "role",
      value: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === stepIndex
          ? {
              ...step,
              sub_steps: [...(step.sub_steps ?? []), newPlaywrightStep],
            }
          : step
      ),
    }));
  };

  const updatePlaywrightStep = (
    stepIndex: number,
    subStepIndex: number,
    field: keyof PlaywrightStep,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === stepIndex
          ? {
              ...step,
              sub_steps:
                step.sub_steps?.map((subStep, j) =>
                  j === subStepIndex ? { ...subStep, [field]: value } : subStep
                ) ?? [],
            }
          : step
      ),
    }));
  };

  const removePlaywrightStep = (stepIndex: number, subStepIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === stepIndex
          ? {
              ...step,
              sub_steps:
                step.sub_steps
                  ?.filter((_, j) => j !== subStepIndex)
                  .map((subStep, j) => ({ ...subStep, step_order: j + 1 })) ?? [],
            }
          : step
      ),
    }));
  };

  const updatePromptStep = (stepIndex: number, field: keyof PromptStep, value: any) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === stepIndex
          ? {
              ...step,
              prompt_data: [
                {
                  ...(step.prompt_data?.[0] ?? { prompt: "", storage_ids: [] }),
                  [field]: value,
                },
              ],
            }
          : step
      ),
    }));
  };

  const updatePromptStepStorageIds = (stepIndex: number, fileId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === stepIndex
          ? {
              ...step,
              prompt_data: [
                {
                  ...(step.prompt_data?.[0] ?? { prompt: "", storage_ids: [] }),
                  storage_ids: checked
                    ? [...(step.prompt_data?.[0]?.storage_ids ?? []), fileId]
                    : (step.prompt_data?.[0]?.storage_ids ?? []).filter((id) => id !== fileId),
                },
              ],
            }
          : step
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    setIsSubmitting(true);
    try {
      await updateScrapeConfiguration(formData.id, formData);
      setIsOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update configuration:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-3 w-3" />
        </Button>
      </SheetTrigger>
      <SheetContent className="!w-[80%] !max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Configuration</SheetTitle>
          <SheetDescription>Update your scraping configuration and its steps.</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Configuration Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="target_url">Target URL</Label>
              <Input
                id="target_url"
                value={formData.target_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, target_url: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Steps</Label>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>

            {formData.steps.map((step, stepIndex) => (
              <Card key={stepIndex} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">Step {step.step_order}</Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(stepIndex)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Step Type</Label>
                      <Select
                        value={step.step_type}
                        onValueChange={(value) => updateStep(stepIndex, "step_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STEP_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Name</Label>
                      <Input
                        value={step.name}
                        onChange={(e) => updateStep(stepIndex, "name", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={step.description ?? ""}
                      onChange={(e) => updateStep(stepIndex, "description", e.target.value)}
                    />
                  </div>

                  {/* Playwright Sub-steps */}
                  {step.step_type === "playwright" && (
                    <div className="space-y-4 border-t pt-4">
                      <div
                        className="flex cursor-pointer items-center justify-between"
                        onClick={() => togglePlaywrightSection(stepIndex)}
                      >
                        <div className="flex items-center gap-2">
                          {expandedPlaywrightSections.has(stepIndex) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Label className="text-sm font-medium">Playwright Actions</Label>
                        </div>
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addPlaywrightStep(stepIndex);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Add Action
                        </Button>
                      </div>

                      {expandedPlaywrightSections.has(stepIndex) && (
                        <>
                          {step.sub_steps?.map((subStep, subStepIndex) => (
                            <Card key={subStepIndex} className="bg-muted/50 p-3">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      Action {subStep.step_order}
                                    </Badge>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePlaywrightStep(stepIndex, subStepIndex)}
                                    className="h-6 w-6 p-0 text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Action Type</Label>
                                    <Select
                                      value={subStep.action_type}
                                      onValueChange={(value) =>
                                        updatePlaywrightStep(
                                          stepIndex,
                                          subStepIndex,
                                          "action_type",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {ACTION_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label className="text-xs">Selector Type</Label>
                                    <Select
                                      value={subStep.selector_type ?? "role"}
                                      onValueChange={(value) =>
                                        updatePlaywrightStep(
                                          stepIndex,
                                          subStepIndex,
                                          "selector_type",
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {SELECTOR_TYPES.map((type) => (
                                          <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Selector</Label>
                                    <Input
                                      value={subStep.selector ?? ""}
                                      onChange={(e) =>
                                        updatePlaywrightStep(
                                          stepIndex,
                                          subStepIndex,
                                          "selector",
                                          e.target.value
                                        )
                                      }
                                      className="h-8"
                                    />
                                  </div>

                                  <div>
                                    <Label className="text-xs">Value</Label>
                                    <Input
                                      value={subStep.value ?? ""}
                                      onChange={(e) =>
                                        updatePlaywrightStep(
                                          stepIndex,
                                          subStepIndex,
                                          "value",
                                          e.target.value
                                        )
                                      }
                                      className="h-8"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-xs">Description</Label>
                                  <Input
                                    value={subStep.description ?? ""}
                                    onChange={(e) =>
                                      updatePlaywrightStep(
                                        stepIndex,
                                        subStepIndex,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="h-8"
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Prompt Steps */}
                  {step.step_type === "prompt_steps" && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">AI Prompt Configuration</Label>
                        
                        <div>
                          <Label className="text-sm">Prompt</Label>
                          <Textarea
                            value={step.prompt_data?.[0]?.prompt ?? ""}
                            onChange={(e) => updatePromptStep(stepIndex, "prompt", e.target.value)}
                            placeholder="Enter your AI prompt here..."
                            rows={8}
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Storage Files (Multi-select)</Label>
                          <div className="rounded-md border p-3">
                            <div className="space-y-2">
                              {['fake-storage-id-1', 'fake-storage-id-2', 'fake-storage-id-3'].map((fileId) => (
                                <div key={fileId} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={fileId}
                                    checked={step.prompt_data?.[0]?.storage_ids?.includes(fileId) ?? false}
                                    onChange={(e) => updatePromptStepStorageIds(stepIndex, fileId, e.target.checked)}
                                    className="h-4 w-4"
                                  />
                                  <label htmlFor={fileId} className="text-sm">
                                    {fileId.includes('florida-rfp-data-2024-01') ? 'florida-rfp-data-2024-01.xlsx' :
                                     fileId.includes('florida-rfp-data-2024-02') ? 'florida-rfp-data-2024-02.xlsx' :
                                     fileId.includes('florida-rfp-data-2024-03') ? 'florida-rfp-data-2024-03.xlsx' :
                                     fileId}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
