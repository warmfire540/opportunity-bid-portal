"use client";

import { Badge } from "../../ui/badge";
import { Card, CardHeader, CardContent, CardDescription } from "../../ui/card";
import { cn } from "@lib/utils";

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
}: StepCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-300",
      isRunning && "ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50 shadow-lg"
    )}>
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
              isRunning && "bg-blue-600 animate-pulse"
            )}
          >
            {stepOrder}
          </Badge>
          {stepTypeIcon}
          <span>{stepTypeLabel}</span>
          {!expanded && (
            <span className="ml-2 font-medium truncate max-w-xs text-ellipsis" title={title}>{title}</span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <CardDescription>
            {isRunning ? "Executing..." : (expanded ? description : `The sequence of actions for this step`)}
          </CardDescription>
        </span>
      </CardHeader>
      {expanded && <CardContent>{children}</CardContent>}
    </Card>
  );
} 