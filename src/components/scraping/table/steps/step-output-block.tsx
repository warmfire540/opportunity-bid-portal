"use client";

import React from "react";

import { cn } from "@lib/utils";

import { Card } from "../../../ui/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "../../../ui/hover-card";

interface StepOutputBlockProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string; // e.g. 'text-blue-600'
  bgColor: string; // e.g. 'bg-blue-50'
  borderColor: string; // e.g. 'border-blue-200'
  glow?: boolean;
  tooltipContent: React.ReactNode;
}

export function StepOutputBlock({
  icon,
  label,
  description,
  color,
  bgColor,
  borderColor,
  glow = false,
  tooltipContent,
}: Readonly<StepOutputBlockProps>) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-shadow duration-300",
            bgColor,
            borderColor,
            glow &&
              "animate-duration-2000 animate-pulse shadow-lg shadow-blue-400/30 ring-2 ring-blue-400/70 ring-offset-2"
          )}
          tabIndex={0}
          aria-label={label}
          style={glow ? { animationDuration: "2s" } : undefined}
        >
          {icon}
          <div className="text-xs">
            <div className={cn("font-medium", color)}>{label}</div>
            <div className="text-muted-foreground">{description}</div>
          </div>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-[600px] max-w-lg overflow-auto whitespace-pre-line break-words text-base">
        {tooltipContent}
      </HoverCardContent>
    </HoverCard>
  );
}
