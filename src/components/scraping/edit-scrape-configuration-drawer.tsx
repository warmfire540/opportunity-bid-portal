"use client";

import { Plus, Trash2, GripVertical, Edit } from "lucide-react";
import { useState } from "react";

import { Textarea } from "@/src/components/ui/textarea";
import type { ScrapeConfiguration, ScrapeDownloadStep } from "@lib/actions/scraping";
import { updateScrapeConfiguration, createScrapeConfiguration } from "@lib/actions/scraping";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

import {
  PlaywrightStep as PlaywrightStepComponent,
  AiPromptStep as AiPromptStepComponent,
} from "./editor/steps";

type Props = {
  configuration?: ScrapeConfiguration;
  onUpdate?: () => void;
  mode?: "create" | "edit";
  trigger?: React.ReactNode;
};

const STEP_TYPES = [
  { value: "playwright", label: "Playwright Web Scraping" },
  { value: "ai_prompt", label: "AI Prompt" },
  { value: "create_opportunity", label: "Create Opportunity" },
];

export default function EditScrapeConfigurationDrawer({
  configuration,
  onUpdate,
  mode = "edit",
  trigger,
}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteStepIndex, setDeleteStepIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ScrapeConfiguration>({
    id: configuration?.id,
    name: configuration?.name ?? "",
    description: configuration?.description ?? "",
    target_url: configuration?.target_url ?? "",
    is_active: configuration?.is_active ?? true,
    steps:
      configuration?.steps ??
      (mode === "create"
        ? [
            {
              step_order: 1,
              step_type: "playwright",
              name: "Download RFP Data",
              description: "Navigate to the site and download RFP data using Playwright automation",
              sub_steps: [
                {
                  step_order: 1,
                  action_type: "goto",
                  description: "Navigate to the target URL",
                },
              ],
            },
          ]
        : []),
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
    setDeleteStepIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For edit mode, we need an ID
    if (mode === "edit" && formData.id == null) return;

    // Basic validation for create mode
    if (mode === "create") {
      if (formData.name.trim() === "" || formData.target_url.trim() === "") {
        console.error("Name and Target URL are required");
        return;
      }
    }

    console.log("Submitting form:", { mode, formData });
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        console.log("Creating configuration...");
        await createScrapeConfiguration(formData);
        console.log("Configuration created successfully");
      } else {
        console.log("Updating configuration...");
        await updateScrapeConfiguration(formData.id!, formData);
        console.log("Configuration updated successfully");
      }
      setIsOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update configuration:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {trigger ?? (
            <Button variant="ghost" size="sm">
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent className="!w-[80%] !max-w-none overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {mode === "create" ? "New Configuration" : "Edit Configuration"}
            </SheetTitle>
            <SheetDescription>
              {mode === "create"
                ? "Create a new scraping configuration and its steps."
                : "Update your scraping configuration and its steps."}
            </SheetDescription>
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
                  value={formData.description ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
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
                <div key={stepIndex} className="space-y-4">
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">Step {step.step_order}</Badge>
                        </div>
                        <Dialog
                          open={deleteStepIndex === stepIndex}
                          onOpenChange={(open) => setDeleteStepIndex(open ? stepIndex : null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Delete Step</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete &quot;{step.name}&quot;? This action
                                cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeleteStepIndex(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => removeStep(stepIndex)}
                              >
                                Delete Step
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
                        <PlaywrightStepComponent
                          subSteps={step.sub_steps ?? []}
                          onUpdate={(subSteps) => updateStep(stepIndex, "sub_steps", subSteps)}
                          expanded={expandedPlaywrightSections.has(stepIndex)}
                          onToggleExpanded={() => togglePlaywrightSection(stepIndex)}
                        />
                      )}

                      {/* AI Prompt Configuration */}
                      {step.step_type === "ai_prompt" && (
                        <AiPromptStepComponent
                          ai_prompt_data={step.ai_prompt_data ?? []}
                          onUpdate={(ai_prompt_data) =>
                            updateStep(stepIndex, "ai_prompt_data", ai_prompt_data)
                          }
                        />
                      )}

                      {/* Create Opportunity Configuration */}
                      {step.step_type === "create_opportunity" && (
                        <div className="space-y-4">
                          <Label>Create Opportunity Configuration</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Title Template</Label>
                              <Input
                                value={
                                  step.create_opportunity_data?.[0]?.title_template ?? "{{title}}"
                                }
                                onChange={(e) =>
                                  updateStep(stepIndex, "create_opportunity_data", [
                                    {
                                      ...step.create_opportunity_data?.[0],
                                      title_template: e.target.value,
                                    },
                                  ])
                                }
                                placeholder="{{title}}"
                              />
                            </div>
                            <div>
                              <Label>Source Template</Label>
                              <Input
                                value={
                                  step.create_opportunity_data?.[0]?.source_template ??
                                  "{{source_url}}"
                                }
                                onChange={(e) =>
                                  updateStep(stepIndex, "create_opportunity_data", [
                                    {
                                      ...step.create_opportunity_data?.[0],
                                      source_template: e.target.value,
                                    },
                                  ])
                                }
                                placeholder="{{source_url}}"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? mode === "create"
                    ? "Creating..."
                    : "Saving..."
                  : mode === "create"
                    ? "Create Configuration"
                    : "Save Changes"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
