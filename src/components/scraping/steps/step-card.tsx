"use client";

import { Badge } from "../../ui/badge";
import { Card, CardHeader, CardContent, CardDescription } from "../../ui/card";

interface StepCardProps {
  stepTypeIcon: React.ReactNode;
  stepTypeLabel: string;
  stepOrder: number;
  title: string;
  description?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
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
}: StepCardProps) {
  return (
    <Card>
      <CardHeader
        className="flex cursor-pointer select-none flex-row items-center justify-between"
        onClick={onToggle}
      >
        <span className="flex items-center gap-2">
          <Badge variant="secondary" className="mr-2 min-w-8 justify-center">{stepOrder}</Badge>
          {stepTypeIcon}
          <span>{stepTypeLabel}</span>
          {!expanded && (
            <span className="ml-2 font-medium truncate max-w-xs text-ellipsis" title={title}>{title}</span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <CardDescription>
            {expanded ? description : `The sequence of actions for this step`}
          </CardDescription>
        </span>
      </CardHeader>
      {expanded && <CardContent>{children}</CardContent>}
    </Card>
  );
} 