"use client";

import {
  Download,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  ExternalLink,
  Code,
} from "lucide-react";


import type { ScrapeConfiguration } from "@lib/actions/scrape-configurations";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { StepRenderer } from "./steps";
import DownloadedFiles from "./downloaded-files";

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
  const playwrightSteps = steps.filter((step) => step.step_type === "playwright");
  const playwrightStep = steps.find((step) => step.step_type === "playwright");

  return (
    <div className="border-t bg-muted/30 p-6">
      <div className="space-y-6">
        {/* Configuration Steps Header */}
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Configuration Steps</h3>
            <p className="text-sm text-muted-foreground">
              Automated actions and analysis steps for this configuration
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {steps.length} step{steps.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Run Scrape Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Execute Configuration
              </CardTitle>
              <CardDescription>Run the automated actions and analysis steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={onRunScrape}
                  disabled={isRunning || !configuration.is_active}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Running Configuration...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Configuration
                    </>
                  )}
                </Button>

                {!configuration.is_active && (
                  <p className="text-center text-sm text-muted-foreground">
                    Configuration is inactive. Enable it to run scrapes.
                  </p>
                )}

                {/* Result Display */}
                {result && (
                  <div className="space-y-3">
                    {result.success ? (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <div className="space-y-2">
                            <p className="font-medium">
                              Configuration executed successfully!
                            </p>
                            <div className="space-y-1 text-sm">
                              <p>Steps executed: {result.stepsExecuted}</p>
                              <p>Execution time: {result.executionTimeMs}ms</p>
                              {result.downloadUrl && (
                                <div className="flex items-center gap-2">
                                  <span>Download:</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="h-6 text-xs"
                                  >
                                    <a
                                      href={result.downloadUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="mr-1 h-3 w-3" />
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
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <div className="space-y-2">
                            <p className="font-medium">Configuration execution failed</p>
                            <p className="text-sm">{result.error}</p>
                            {result.executionTimeMs && (
                              <p className="text-sm">Execution time: {result.executionTimeMs}ms</p>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Downloaded Files Section */}
          <DownloadedFiles configuration={configuration} />
        </div>

        {/* Steps Section */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <StepRenderer 
              key={step.id ?? index} 
              step={step} 
              configuration={configuration} 
              isRunning={currentStepIndex === index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
