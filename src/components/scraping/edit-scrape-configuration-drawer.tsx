"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Edit } from "lucide-react";

import type { ScrapeConfiguration, ScrapeStep } from "@lib/actions/scrape-configurations";
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

export default function EditScrapeConfigurationDrawer({ configuration, onUpdate }: Props) {
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

  const addStep = () => {
    const newStep: ScrapeStep = {
      step_order: formData.steps.length + 1,
      action_type: "click",
      selector: "",
      selector_type: "role",
      value: "",
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
  };

  const updateStep = (index: number, field: keyof ScrapeStep, value: any) => {
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

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= formData.steps.length) return;

    setFormData((prev) => {
      const newSteps = [...prev.steps];
      const [movedStep] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, movedStep);

      return {
        ...prev,
        steps: newSteps.map((step, i) => ({ ...step, step_order: i + 1 })),
      };
    });
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
      <SheetContent className="w-[800px] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Configuration</SheetTitle>
          <SheetDescription>
            Update your scraping configuration and steps
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
              <CardDescription>Basic information about your scraping configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name ?? ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Florida RFP Scraper"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this configuration does..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_url">Target URL *</Label>
                <Input
                  id="target_url"
                  type="url"
                  value={formData.target_url ?? ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, target_url: e.target.value }))}
                  placeholder="https://vendor.myfloridamarketplace.com/search/bids"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Scraping Steps</CardTitle>
                  <CardDescription>Define the sequence of actions to perform</CardDescription>
                </div>
                <Button type="button" onClick={addStep} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Step
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.steps.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No steps defined. Add your first step to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.steps.map((step, index) => (
                    <div key={index} className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">Step {step.step_order}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStep(index, index - 1)}
                            >
                              ↑
                            </Button>
                          )}
                          {index < formData.steps.length - 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveStep(index, index + 1)}
                            >
                              ↓
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Action Type *</Label>
                          <Select
                            value={step.action_type}
                            onValueChange={(value) => updateStep(index, "action_type", value)}
                          >
                            <SelectTrigger>
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

                        {step.action_type !== "goto" && step.action_type !== "wait" && (
                          <div className="space-y-2">
                            <Label>Selector Type</Label>
                            <Select
                              value={step.selector_type}
                              onValueChange={(value) => updateStep(index, "selector_type", value)}
                            >
                              <SelectTrigger>
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
                        )}
                      </div>

                      {step.action_type !== "goto" && step.action_type !== "wait" && (
                        <div className="space-y-2">
                          <Label>Selector</Label>
                          <Input
                            value={step.selector ?? ""}
                            onChange={(e) => updateStep(index, "selector", e.target.value)}
                            placeholder={
                              step.selector_type === "role" ? "button" : "CSS selector, text, etc."
                            }
                          />
                        </div>
                      )}

                      {(step.action_type === "type" || step.action_type === "select") && (
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <Input
                            value={step.value ?? ""}
                            onChange={(e) => updateStep(index, "value", e.target.value)}
                            placeholder="Text to type or option to select"
                          />
                        </div>
                      )}

                      {step.action_type === "wait" && (
                        <div className="space-y-2">
                          <Label>Wait Time (ms)</Label>
                          <Input
                            type="number"
                            value={step.wait_time ?? ""}
                            onChange={(e) =>
                              updateStep(index, "wait_time", parseInt(e.target.value) || 0)
                            }
                            placeholder="1000"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={step.description ?? ""}
                          onChange={(e) => updateStep(index, "description", e.target.value)}
                          placeholder="Optional description of this step"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Configuration"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
} 