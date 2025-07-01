"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Edit } from "lucide-react";

import type {
  ScrapeConfiguration,
  ScrapeDownloadStep,
  PlaywrightStep,
  PromptStep,
} from "@lib/actions/scrape-configurations";
import {
  updateScrapeConfiguration,
  createScrapeConfiguration,
} from "@lib/actions/scrape-configurations";

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
import { PlaywrightStep as PlaywrightStepComponent, AiPromptStep } from "./editor/steps";

type Props = {
  configuration?: ScrapeConfiguration;
  onUpdate?: () => void;
  mode?: "create" | "edit";
  trigger?: React.ReactNode;
};

const STEP_TYPES = [
  { value: "playwright", label: "Playwright File Download" },
  { value: "ai_prompt", label: "AI Prompt" },
  { value: "links_analysis", label: "Links Analysis" },
  { value: "prompt_steps", label: "Prompt Steps" },
];

export default function EditScrapeConfigurationDrawer({
  configuration,
  onUpdate,
  mode = "edit",
  trigger,
}: Readonly<Props>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For edit mode, we need an ID
    if (mode === "edit" && !formData.id) return;

    // Basic validation for create mode
    if (mode === "create") {
      if (!formData.name.trim() || !formData.target_url.trim()) {
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="!w-[80%] !max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mode === "create" ? "New Configuration" : "Edit Configuration"}</SheetTitle>
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
                    <PlaywrightStepComponent
                      subSteps={step.sub_steps ?? []}
                      onUpdate={(subSteps) => {
                        setFormData((prev) => ({
                          ...prev,
                          steps: prev.steps.map((s, i) =>
                            i === stepIndex ? { ...s, sub_steps: subSteps } : s
                          ),
                        }));
                      }}
                      expanded={expandedPlaywrightSections.has(stepIndex)}
                      onToggleExpanded={() => togglePlaywrightSection(stepIndex)}
                    />
                  )}

                  {/* Prompt Steps */}
                  {step.step_type === "prompt_steps" && (
                    <AiPromptStep
                      promptData={step.prompt_data ?? []}
                      onUpdate={(promptData) => {
                        setFormData((prev) => ({
                          ...prev,
                          steps: prev.steps.map((s, i) =>
                            i === stepIndex ? { ...s, prompt_data: promptData } : s
                          ),
                        }));
                      }}
                    />
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
  );
}
