"use client";

import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

import type { PlaywrightStep } from "@lib/actions/scraping";

import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Card } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";

const ACTION_TYPES = [
  { value: "goto", label: "Navigate to URL" },
  { value: "click", label: "Click Element" },
  { value: "type", label: "Type Text" },
  { value: "select", label: "Select Option" },
  { value: "wait", label: "Wait" },
  { value: "waitForDownload", label: "Wait for Download" },
  { value: "saveDownload", label: "Save Download" },
  { value: "getInnerText", label: "Get Inner Text" },
];

const SELECTOR_TYPES = [
  { value: "role", label: "Role" },
  { value: "text", label: "Text" },
  { value: "css", label: "CSS Selector" },
  { value: "xpath", label: "XPath" },
  { value: "page", label: "Page" },
];

type Props = {
  subSteps: PlaywrightStep[];
  onUpdate: (subSteps: PlaywrightStep[]) => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
};

export default function PlaywrightStep({
  subSteps,
  onUpdate,
  expanded = false,
  onToggleExpanded,
}: Readonly<Props>) {
  const addPlaywrightStep = () => {
    const newPlaywrightStep: PlaywrightStep = {
      step_order: subSteps.length + 1,
      action_type: "click",
      selector: "",
      selector_type: "role",
      value: "",
      description: "",
    };
    onUpdate([...subSteps, newPlaywrightStep]);
  };

  const updatePlaywrightStep = (
    subStepIndex: number,
    field: keyof PlaywrightStep,
    value: string | number | undefined
  ) => {
    const updatedSteps = subSteps.map((subStep, j) =>
      j === subStepIndex ? { ...subStep, [field]: value } : subStep
    );
    onUpdate(updatedSteps);
  };

  const removePlaywrightStep = (subStepIndex: number) => {
    const updatedSteps = subSteps
      .filter((_, j) => j !== subStepIndex)
      .map((subStep, j) => ({ ...subStep, step_order: j + 1 }));
    onUpdate(updatedSteps);
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex cursor-pointer items-center justify-between" onClick={onToggleExpanded}>
        <div className="flex items-center gap-2">
          {expanded ? (
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
            addPlaywrightStep();
          }}
          size="sm"
          variant="outline"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Action
        </Button>
      </div>

      {expanded && (
        <>
          {subSteps.map((subStep, subStepIndex) => (
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
                    onClick={() => removePlaywrightStep(subStepIndex)}
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
                        updatePlaywrightStep(subStepIndex, "action_type", value)
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
                        updatePlaywrightStep(subStepIndex, "selector_type", value)
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
                        updatePlaywrightStep(subStepIndex, "selector", e.target.value)
                      }
                      className="h-8"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Value</Label>
                    <Input
                      value={subStep.value ?? ""}
                      onChange={(e) => updatePlaywrightStep(subStepIndex, "value", e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={subStep.description ?? ""}
                    onChange={(e) =>
                      updatePlaywrightStep(subStepIndex, "description", e.target.value)
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
  );
}
