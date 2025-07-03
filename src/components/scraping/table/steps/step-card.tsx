"use client";

import type { StepType, StepExecutionResult } from "@lib/actions/scraping";
import { useAutoScroll } from "@lib/hooks/use-auto-scroll";
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
  stepType?: StepType;
  isLast?: boolean;
  hasNextStep?: boolean;
  nextStepType?: StepType;
  stepOutputPreview?: React.ReactNode;
  stepOutputGlow?: boolean;
  playwrightOutputType?: "file" | "text" | null;
  stepResult?: StepExecutionResult;
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
  stepOutputPreview,
  stepOutputGlow,
  playwrightOutputType,
  stepResult,
}: Readonly<StepCardProps>) {
  // Auto-scroll to the step when it's running
  const stepRef = useAutoScroll<HTMLDivElement>(isRunning, {
    enabled: isRunning,
    offset: 120,
    delay: 300,
    highlight: true,
  });

  return (
    <div ref={stepRef} className="space-y-4">
      <Card
        className={cn(
          "transition-all duration-300",
          isRunning &&
            "bg-blue-50/50 shadow-lg shadow-blue-500/25 ring-2 ring-blue-500 ring-offset-2"
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
              className={cn("relative mr-2 min-w-8 justify-center", isRunning && "bg-blue-600")}
            >
              {isRunning && (
                <div
                  className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75"
                  style={{ animationDuration: "2s" }}
                />
              )}
              <span className="relative z-10">{stepOrder}</span>
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
              {(() => {
                if (isRunning) return "Executing...";
                if (expanded) return description;
                return "The sequence of actions for this step";
              })()}
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
          stepOutputPreview={stepOutputPreview}
          stepOutputGlow={stepOutputGlow}
          playwrightOutputType={playwrightOutputType}
          stepResult={stepResult}
        />
      )}
    </div>
  );
}
