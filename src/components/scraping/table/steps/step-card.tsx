"use client";

import { cn } from "@lib/utils";

import { Badge } from "../../../ui/badge";
import { Card, CardHeader, CardContent, CardDescription } from "../../../ui/card";

import StepConnector from "./step-connector";

interface StepCardProps {
  stepTypeIcon: React.ReactNode;
  stepTypeLabel: string;
  stepOrder: number;
  title: string;
  description?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isRunning?: boolean;
  showConnector?: boolean;
  stepType?: "playwright" | "ai_prompt" | "links_analysis" | "prompt_steps";
  isLast?: boolean;
  hasNextStep?: boolean;
  nextStepType?: "playwright" | "ai_prompt" | "links_analysis" | "prompt_steps";
}

export default function StepCard({
  stepTypeIcon,
  stepTypeLabel,
  stepOrder,
  title,
  description,
  expanded,
  onToggle,
  children,
  isRunning = false,
  showConnector = false,
  stepType,
  isLast = false,
  hasNextStep = false,
  nextStepType,
}: StepCardProps) {
  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "transition-all duration-300",
          isRunning && "bg-blue-50/50 shadow-lg ring-2 ring-blue-500 ring-offset-2"
        )}
      >
        <CardHeader
          className={cn(
            "flex cursor-pointer select-none flex-row items-center justify-between",
            isRunning && "bg-blue-100/50"
          )}
          onClick={onToggle}
        >
          <span className="flex items-center gap-2">
            <Badge
              variant={isRunning ? "default" : "secondary"}
              className={cn(
                "mr-2 min-w-8 justify-center",
                isRunning && "animate-pulse bg-blue-600"
              )}
            >
              {stepOrder}
            </Badge>
            {stepTypeIcon}
            <span>{stepTypeLabel}</span>
            {!expanded && (
              <span className="ml-2 max-w-xs truncate text-ellipsis font-medium" title={title}>
                {title}
              </span>
            )}
          </span>
          <span className="flex items-center gap-2">
            <CardDescription>
              {isRunning
                ? "Executing..."
                : expanded
                  ? description
                  : `The sequence of actions for this step`}
            </CardDescription>
          </span>
        </CardHeader>
        {expanded && <CardContent>{children}</CardContent>}
      </Card>

      {/* Step Connector */}
      {showConnector && stepType != null && (
        <StepConnector
          stepType={stepType}
          stepOrder={stepOrder}
          isLast={isLast}
          hasNextStep={hasNextStep}
          nextStepType={nextStepType}
        />
      )}
    </div>
  );
}
