"use client";

import React from "react";

import { cn } from "@lib/utils";

import { Card } from "../../../ui/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../../../ui/hover-card";

interface StepInputBlockProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string; // e.g. 'text-blue-600'
  bgColor: string; // e.g. 'bg-blue-50'
  borderColor: string; // e.g. 'border-blue-200'
  isActive: boolean;
  tooltipContent: React.ReactNode;
}

export function StepInputBlock({
  icon,
  label,
  description,
  color,
  bgColor,
  borderColor,
  isActive,
  tooltipContent,
}: Readonly<StepInputBlockProps>) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors",
            bgColor,
            borderColor,
            !isActive && "opacity-50"
          )}
          tabIndex={0}
          aria-label={label}
        >
          {icon}
          <div className="text-xs">
            <div className={cn("font-medium", color)}>{label}</div>
            <div className={cn(isActive ? "text-muted-foreground" : "text-gray-400")}>
              {description}
            </div>
          </div>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-[600px] max-w-lg overflow-auto whitespace-pre-line break-words text-base">
        {tooltipContent}
      </HoverCardContent>
    </HoverCard>
  );
}
