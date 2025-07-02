"use client";

import { Clock, CheckCircle, XCircle, ExternalLink, Code, Zap } from "lucide-react";

import type { ScrapeConfiguration } from "@lib/actions/scraping";
import { useAutoScroll } from "@lib/hooks/use-auto-scroll";

import { Alert, AlertDescription } from "../../ui/alert";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

import { StepRenderer } from "./steps";

type ScrapeResult = {
  success: boolean;
  downloadPath?: string;
  downloadUrl?: string;
  executionTimeMs?: number;
  stepsExecuted?: number;
  error?: string;
  stepResults?: any[];
};

type Props = {
  configuration: ScrapeConfiguration;
  isRunning: boolean;
  onRunScrape: () => void;
  result?: ScrapeResult | null;
  currentStepIndex?: number;
};

export default function ScrapeConfigurationExpandedContent({
  configuration,
  isRunning,
  onRunScrape,
  result,
  currentStepIndex,
}: Readonly<Props>) {
  const steps = Array.isArray(configuration.steps) ? configuration.steps : [];

  // Auto-scroll to the steps section when execution starts
  const stepsContainerRef = useAutoScroll<HTMLDivElement>(
    isRunning && currentStepIndex === undefined,
    {
      enabled: isRunning,
      offset: 150,
      delay: 300,
    }
  );

  // Auto-scroll to progress indicator when a step is running
  const progressRef = useAutoScroll<HTMLDivElement>(isRunning && currentStepIndex != null, {
    enabled: isRunning,
    offset: 120,
    delay: 200,
    highlight: true,
  });

  return (
    <div
      className={`border-t p-6 transition-all duration-500 ${isRunning ? "border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50" : "bg-muted/30"}`}
    >
      <div className="space-y-6">
        {/* Configuration Steps Header with Execute Button */}
        <div
          className={`flex items-center gap-3 transition-all duration-500 ${isRunning ? "rounded-lg bg-blue-50/30 p-3 shadow-sm" : ""}`}
        >
          <Code
            className={`h-5 w-5 transition-all duration-300 ${isRunning ? "animate-pulse text-blue-600" : "text-blue-600"}`}
          />
          <div className="flex-1">
            <h3
              className={`text-lg font-semibold transition-all duration-300 ${isRunning ? "animate-pulse text-blue-600" : ""}`}
            >
              Configuration Steps
            </h3>
            <p
              className={`text-sm transition-all duration-300 ${isRunning ? "animate-pulse text-blue-700" : "text-muted-foreground"}`}
            >
              Automated actions and analysis steps for this configuration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={isRunning ? "default" : "secondary"}
              className={isRunning ? "animate-pulse bg-blue-600" : ""}
            >
              {steps.length} step{steps.length !== 1 ? "s" : ""}
            </Badge>

            {/* Execute Button */}
            <Button
              onClick={onRunScrape}
              disabled={isRunning || configuration.is_active === false}
              size="lg"
              className={`group relative overflow-hidden transition-all duration-300 ease-out ${
                isRunning
                  ? "scale-105 animate-pulse bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
                  : "bg-gradient-to-r from-green-500 to-blue-600 hover:rotate-1 hover:scale-105 hover:from-green-600 hover:to-blue-700 hover:shadow-lg hover:shadow-green-500/25"
              } ${configuration.is_active === false ? "cursor-not-allowed opacity-50" : ""} `}
            >
              {isRunning ? (
                <>
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-400 to-purple-500 opacity-75" />
                  <div className="relative flex items-center gap-2">
                    <div className="relative">
                      <Clock className="h-5 w-5 animate-spin" />
                      <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />
                    </div>
                    <span className="font-semibold">Running...</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-0 transition-opacity duration-300 hover:opacity-20" />
                  <div className="relative flex items-center gap-2">
                    <Zap className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    <span className="font-semibold">Execute Configuration</span>
                  </div>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Execution Started Notification */}
        {isRunning && currentStepIndex === undefined && (
          <div className="duration-300 animate-in slide-in-from-top-2">
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-green-600" />
                  <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-green-400 opacity-75" />
                </div>
                <div className="flex-1">
                  <p className="animate-pulse text-sm font-medium text-green-900">
                    Configuration execution started
                  </p>
                  <p className="animate-pulse text-xs text-green-700">
                    Initializing browser and preparing steps...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {isRunning && currentStepIndex != null && (
          <div ref={progressRef} className="duration-300 animate-in slide-in-from-top-2">
            <div className="rounded-lg border bg-blue-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-blue-600" />
                  <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-blue-400 opacity-75" />
                </div>
                <div className="flex-1">
                  <p className="animate-pulse text-sm font-medium text-blue-900">
                    Executing step {currentStepIndex + 1} of {steps.length}
                  </p>
                  <p className="animate-pulse text-xs text-blue-700">
                    {steps[currentStepIndex]?.name ?? "Processing..."}
                  </p>
                </div>
                <div className="animate-pulse font-mono text-xs text-blue-600">
                  {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
                </div>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-blue-200">
                <div
                  className="relative h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                >
                  <div className="absolute inset-0 animate-pulse rounded-full bg-white/30" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result != null && (
          <div className="scale-in-95 duration-500 animate-in slide-in-from-top-2">
            {result.success ? (
              <Alert className="animate-pulse border-green-200 bg-green-50 shadow-lg">
                <CheckCircle className="h-4 w-4 animate-bounce text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="space-y-2">
                    <p className="font-medium">Configuration executed successfully!</p>
                    <div className="space-y-1 text-sm">
                      <p>Steps executed: {result.stepsExecuted}</p>
                      <p>Execution time: {result.executionTimeMs}ms</p>
                      {result.downloadUrl != null && result.downloadUrl !== "" && (
                        <div className="flex items-center gap-2">
                          <span>Download:</span>
                          <Button variant="outline" size="sm" asChild className="h-6 text-xs">
                            <a href={result.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1 h-3 w-3 transition-transform duration-300 hover:scale-110" />
                              View File
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="animate-pulse border-red-200 bg-red-50 shadow-lg">
                <XCircle className="h-4 w-4 animate-bounce text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="space-y-2">
                    <p className="font-medium">Configuration execution failed</p>
                    <p className="text-sm">{result.error}</p>
                    {result.executionTimeMs != null && result.executionTimeMs > 0 && (
                      <p className="text-sm">Execution time: {result.executionTimeMs}ms</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Steps Section */}
        <div
          ref={stepsContainerRef}
          className={`space-y-4 transition-all duration-500 ${isRunning ? "scale-[1.02]" : "scale-100"}`}
        >
          {steps.map((step, index) => (
            <StepRenderer
              key={step.id ?? index}
              step={step}
              configuration={configuration}
              isRunning={currentStepIndex === index}
              isLast={index === steps.length - 1}
              hasNextStep={index < steps.length - 1}
              nextStepType={index < steps.length - 1 ? steps[index + 1]?.step_type : undefined}
              stepResult={result?.stepResults?.[index]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
