"use client";

import { Clock, CheckCircle, XCircle, ExternalLink, Code, Zap } from "lucide-react";

import type { ScrapeConfiguration } from "@lib/actions/scraping";

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

  return (
    <div className={`border-t p-6 transition-all duration-500 ${isRunning ? 'bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-200' : 'bg-muted/30'}`}>
      <div className="space-y-6">
        {/* Configuration Steps Header with Execute Button */}
        <div className={`flex items-center gap-3 transition-all duration-500 ${isRunning ? 'bg-blue-50/30 rounded-lg p-3 shadow-sm' : ''}`}>
          <Code className={`h-5 w-5 transition-all duration-300 ${isRunning ? 'text-blue-600 animate-pulse' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h3 className={`text-lg font-semibold transition-all duration-300 ${isRunning ? 'text-blue-600 animate-pulse' : ''}`}>
              Configuration Steps
            </h3>
            <p className={`text-sm transition-all duration-300 ${isRunning ? 'text-blue-700 animate-pulse' : 'text-muted-foreground'}`}>
              Automated actions and analysis steps for this configuration
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isRunning ? "default" : "secondary"} className={isRunning ? "animate-pulse bg-blue-600" : ""}>
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
                  : "bg-gradient-to-r from-green-500 to-blue-600 hover:scale-105 hover:from-green-600 hover:to-blue-700 hover:shadow-lg hover:shadow-green-500/25 hover:rotate-1"
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
                    <Zap className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                    <span className="font-semibold">Execute Configuration</span>
                  </div>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Execution Started Notification */}
        {isRunning && currentStepIndex === undefined && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="rounded-lg border bg-green-50/50 p-4 shadow-sm border-green-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 rounded-full bg-green-600 animate-pulse" />
                  <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-400 animate-ping opacity-75" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 animate-pulse">
                    Configuration execution started
                  </p>
                  <p className="text-xs text-green-700 animate-pulse">
                    Initializing browser and preparing steps...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {isRunning && currentStepIndex != null && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="rounded-lg border bg-blue-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
                  <div className="absolute inset-0 h-3 w-3 rounded-full bg-blue-400 animate-ping opacity-75" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 animate-pulse">
                    Executing step {currentStepIndex + 1} of {steps.length}
                  </p>
                  <p className="text-xs text-blue-700 animate-pulse">
                    {steps[currentStepIndex]?.name ?? "Processing..."}
                  </p>
                </div>
                <div className="text-xs text-blue-600 font-mono animate-pulse">
                  {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
                </div>
              </div>
              <div className="mt-2 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full relative"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result != null && (
          <div className="duration-500 animate-in slide-in-from-top-2 scale-in-95">
            {result.success ? (
              <Alert className="border-green-200 bg-green-50 shadow-lg animate-pulse">
                <CheckCircle className="h-4 w-4 text-green-600 animate-bounce" />
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
              <Alert className="border-red-200 bg-red-50 shadow-lg animate-pulse">
                <XCircle className="h-4 w-4 text-red-600 animate-bounce" />
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
        <div className={`space-y-4 transition-all duration-500 ${isRunning ? 'scale-[1.02]' : 'scale-100'}`}>
          {steps.map((step, index) => (
            <StepRenderer
              key={step.id ?? index}
              step={step}
              configuration={configuration}
              isRunning={currentStepIndex === index}
              isLast={index === steps.length - 1}
              hasNextStep={index < steps.length - 1}
              nextStepType={index < steps.length - 1 ? steps[index + 1]?.step_type : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
