"use client";

import {
  ArrowDown,
  Download,
  FileText,
  MessageSquare,
  ExternalLink,
  Briefcase,
  TrendingUp,
} from "lucide-react";

import type { StepExecutionResult, StepType } from "@lib/actions/scraping";

import { StepInputBlock } from "./step-input-block";
import { StepOutputBlock } from "./step-output-block";

interface StepConnectorProps {
  stepType: StepType;
  stepOrder: number;
  isLast?: boolean;
  hasNextStep?: boolean;
  nextStepType?: StepType;
  stepOutputPreview?: React.ReactNode;
  stepOutputGlow?: boolean;
  playwrightOutputType?: "file" | "text" | null;
  stepResult?: StepExecutionResult;
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
  stepResult,
}: Readonly<StepConnectorProps>) {
  const getStepOutputs = () => {
    switch (stepType) {
      case "playwright": {
        // Determine which outputs are active based on actual results
        const fileName = stepResult?.downloadPath?.split("/").pop();
        const hasFileOutput = fileName != null && fileName !== "";
        const hasTextResults =
          stepResult?.textResults != null &&
          Array.isArray(stepResult.textResults) &&
          stepResult.textResults.length > 0;
        const hasTextOutput = hasTextResults;

        // If no stepResult (before execution or editor mode), show both as active
        const isBeforeExecution = stepResult == null;

        return [
          {
            icon: <Download className="h-4 w-4" />,
            label: "Downloaded File",
            description: "File saved to storage",
            color: isBeforeExecution || hasFileOutput ? "text-blue-600" : "text-gray-400",
            bgColor: isBeforeExecution || hasFileOutput ? "bg-blue-50" : "bg-gray-50",
            borderColor: isBeforeExecution || hasFileOutput ? "border-blue-200" : "border-gray-200",
            isActive: isBeforeExecution || hasFileOutput,
            tooltipContent:
              isBeforeExecution || hasFileOutput
                ? stepOutputPreview
                : "No file was downloaded in this step",
          },
          {
            icon: <FileText className="h-4 w-4" />,
            label: "Extracted Text",
            description: "Text content extracted",
            color: isBeforeExecution || hasTextOutput ? "text-green-600" : "text-gray-400",
            bgColor: isBeforeExecution || hasTextOutput ? "bg-green-50" : "bg-gray-50",
            borderColor:
              isBeforeExecution || hasTextOutput ? "border-green-200" : "border-gray-200",
            isActive: isBeforeExecution || hasTextOutput,
            tooltipContent:
              isBeforeExecution || hasTextOutput
                ? stepOutputPreview
                : "No text was extracted in this step",
          },
        ];
      }
      case "ai_prompt":
        return [
          {
            icon: <MessageSquare className="h-4 w-4 text-purple-600" />,
            label: "AI Response",
            description: "Generated content",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            isActive: true,
            tooltipContent: stepOutputPreview ?? "AI response content",
          },
        ];
      case "create_opportunity": {
        const isBeforeExecution = stepResult == null;
        const hasMarketInsights =
          stepResult != null &&
          stepResult.success &&
          stepResult.marketInsights != null &&
          stepResult.marketInsights.length > 0;
        const hasOpportunities =
          stepResult != null &&
          stepResult.success &&
          stepResult.opportunities != null &&
          stepResult.opportunities.length > 0;

        return [
          {
            icon: <Briefcase className="h-4 w-4 text-green-600" />,
            label: "Opportunities",
            description: "Created opportunities",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            isActive: hasOpportunities,
            tooltipContent: hasOpportunities
              ? stepOutputPreview
              : "No opportunities were created in this step",
          },
          {
            icon: <TrendingUp className="h-4 w-4" />,
            label: "Market Insights",
            description: "Generated insights",
            color: isBeforeExecution || hasMarketInsights ? "text-blue-600" : "text-gray-400",
            bgColor: isBeforeExecution || hasMarketInsights ? "bg-blue-50" : "bg-gray-50",
            borderColor:
              isBeforeExecution || hasMarketInsights ? "border-blue-200" : "border-gray-200",
            isActive: isBeforeExecution || hasMarketInsights,
            tooltipContent: isBeforeExecution
              ? "Market insights will be generated here"
              : hasMarketInsights
                ? stepOutputPreview
                : "No market insights were generated in this step",
          },
        ];
      }
      default:
        return null;
    }
  };

  const getStepInputs = () => {
    if (nextStepType == null) return null;

    switch (nextStepType) {
      case "playwright":
        return [
          {
            icon: <ExternalLink className="h-4 w-4 text-blue-600" />,
            label: "URLs",
            description: "Optional URL input",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            isActive: true,
          },
        ];
      case "ai_prompt":
        // Determine which inputs are active based on previous step output
        const hasFileOutput = stepType === "playwright" && playwrightOutputType !== "text";
        const hasTextOutput = stepType === "playwright" && playwrightOutputType === "text";

        // If no playwrightOutputType (before execution or editor mode), show both as active
        const isBeforeExecution = playwrightOutputType == null;

        return [
          {
            icon: <Download className="h-4 w-4" />,
            label: "File Input",
            description: "Downloaded file content",
            color: isBeforeExecution || hasFileOutput ? "text-blue-600" : "text-gray-400",
            bgColor: isBeforeExecution || hasFileOutput ? "bg-blue-50" : "bg-gray-50",
            borderColor: isBeforeExecution || hasFileOutput ? "border-blue-200" : "border-gray-200",
            isActive: isBeforeExecution || hasFileOutput,
          },
          {
            icon: <FileText className="h-4 w-4" />,
            label: "Text Input",
            description: "Extracted text content",
            color: isBeforeExecution || hasTextOutput ? "text-green-600" : "text-gray-400",
            bgColor: isBeforeExecution || hasTextOutput ? "bg-green-50" : "bg-gray-50",
            borderColor:
              isBeforeExecution || hasTextOutput ? "border-green-200" : "border-gray-200",
            isActive: isBeforeExecution || hasTextOutput,
          },
        ];
      case "create_opportunity": {
        const hasAiResponse =
          stepType === "ai_prompt" &&
          stepResult?.aiResponse != null &&
          stepResult.aiResponse !== "";
        // If no stepResult (before execution or editor mode), show as active
        const isBeforeExecution = stepResult == null;
        return [
          {
            icon: <MessageSquare className="h-4 w-4" />,
            label: "AI Response",
            description: "AI-generated opportunity data",
            color: isBeforeExecution || hasAiResponse ? "text-purple-600" : "text-gray-400",
            bgColor: isBeforeExecution || hasAiResponse ? "bg-purple-50" : "bg-gray-50",
            borderColor:
              isBeforeExecution || hasAiResponse ? "border-purple-200" : "border-gray-200",
            isActive: isBeforeExecution || hasAiResponse,
          },
        ];
      }
      default:
        return null;
    }
  };

  const outputs = getStepOutputs();
  const inputs = getStepInputs();

  if (isLast) {
    return (
      <div className="flex flex-col items-center">
        {outputs != null && (
          <div className="flex gap-2">
            {outputs.map((output, index) => (
              <StepOutputBlock
                key={index}
                icon={output.icon}
                label={output.label}
                description={output.description}
                color={output.color}
                bgColor={output.bgColor}
                borderColor={output.borderColor}
                glow={output.isActive && stepOutputGlow}
                tooltipContent={
                  output.tooltipContent ??
                  (output.isActive ? stepOutputPreview : "No data available")
                }
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Step Outputs */}
      {outputs != null && (
        <div className="mb-2 flex gap-2">
          {outputs.map((output, index) => (
            <StepOutputBlock
              key={index}
              icon={output.icon}
              label={output.label}
              description={output.description}
              color={output.color}
              bgColor={output.bgColor}
              borderColor={output.borderColor}
              glow={output.isActive && stepOutputGlow}
              tooltipContent={output.isActive ? stepOutputPreview : "No data available"}
            />
          ))}
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

      {/* Next Step Inputs */}
      {inputs != null && hasNextStep && (
        <div className="mt-2 flex gap-2">
          {inputs.map((input, index) => (
            <StepInputBlock
              key={index}
              icon={input.icon}
              label={input.label}
              description={input.description}
              color={input.color}
              bgColor={input.bgColor}
              borderColor={input.borderColor}
              isActive={input.isActive}
              tooltipContent={
                input.isActive
                  ? "Data available from previous step"
                  : "No data available from previous step"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
