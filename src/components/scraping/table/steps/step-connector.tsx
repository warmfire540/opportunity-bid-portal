"use client";

import { ArrowDown, Download, FileText, MessageSquare, ExternalLink } from "lucide-react";

import type { StepType } from "@lib/actions/scraping";
import { cn } from "@lib/utils";

import { StepOutputBlock } from "./step-output-block";

interface StepConnectorProps {
  stepType: StepType;
  stepOrder: number;
  isLast?: boolean;
  hasNextStep?: boolean;
  nextStepType?: StepType;
  stepOutputPreview?: React.ReactNode;
  stepOutputGlow?: boolean;
  playwrightOutputType?: "file" | "text";
}

export default function StepConnector({
  stepType,
  stepOrder: _stepOrder,
  isLast = false,
  hasNextStep = false,
  nextStepType,
  stepOutputPreview,
  stepOutputGlow,
  playwrightOutputType,
}: Readonly<StepConnectorProps>) {
  const getStepOutput = () => {
    switch (stepType) {
      case "playwright":
        if (playwrightOutputType === "text") {
          return {
            icon: <FileText className="h-4 w-4 text-green-600" />,
            label: "Extracted Text",
            description: "Text content extracted",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
          };
        } else {
          return {
            icon: <Download className="h-4 w-4 text-blue-600" />,
            label: "Downloaded File",
            description: "File saved to storage",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
          };
        }
      case "ai_prompt":
        return {
          icon: <MessageSquare className="h-4 w-4 text-purple-600" />,
          label: "AI Response",
          description: "Generated content",
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
        };
      case "links_analysis":
        return {
          icon: <FileText className="h-4 w-4 text-orange-600" />,
          label: "Link Analysis",
          description: "Extracted links and data",
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        };
      default:
        return null;
    }
  };

  const getStepInput = () => {
    if (nextStepType == null) return null;

    switch (nextStepType) {
      case "playwright":
        return {
          icon: <ExternalLink className="h-4 w-4 text-blue-600" />,
          label: "URLs",
          description: "Optional URL input",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "ai_prompt":
        return {
          icon: <FileText className="h-4 w-4 text-gray-600" />,
          label: "File Input",
          description: "Optional file input",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
      default:
        return null;
    }
  };

  const output = getStepOutput();
  const input = getStepInput();

  if (isLast) {
    return (
      <div className="flex flex-col items-center">
        {output != null && (
          <StepOutputBlock
            icon={output.icon}
            label={output.label}
            description={output.description}
            color={output.color}
            bgColor={output.bgColor}
            borderColor={output.borderColor}
            glow={stepOutputGlow}
            tooltipContent={stepOutputPreview}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Step Output */}
      {output != null && (
        <div className="mb-2">
          <StepOutputBlock
            icon={output.icon}
            label={output.label}
            description={output.description}
            color={output.color}
            bgColor={output.bgColor}
            borderColor={output.borderColor}
            glow={stepOutputGlow}
            tooltipContent={stepOutputPreview}
          />
        </div>
      )}

      {/* Connection Line */}
      {hasNextStep && (
        <div className="flex flex-col items-center">
          <div className="h-8 w-px bg-border" />
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
          <div className="h-8 w-px bg-border" />
        </div>
      )}

      {/* Next Step Input */}
      {input != null && hasNextStep && (
        <div
          className={cn(
            "mt-2 flex items-center gap-2 rounded-lg border p-2",
            input.bgColor,
            input.borderColor
          )}
        >
          {input.icon}
          <div className="text-xs">
            <div className={cn("font-medium", input.color)}>{input.label}</div>
            <div className="text-muted-foreground">{input.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
