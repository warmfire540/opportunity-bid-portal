"use client";

import {
  Download,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  ExternalLink,
  Code,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

import type { ScrapeConfiguration } from "@lib/actions/scrape-configurations";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Label } from "../ui/label";
import { ScrapeConfigurationSteps } from "./index";
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
};

export default function ScrapeConfigurationExpandedContent({
  configuration,
  isRunning,
  onRunScrape,
  result,
}: Readonly<Props>) {
  const steps = Array.isArray(configuration.steps) ? configuration.steps : [];
  const playwrightSteps = steps.filter((step) => step.step_type === "playwright");
  const playwrightStep = steps.find((step) => step.step_type === "playwright");
  const promptSteps = steps.filter((step) => step.step_type === "prompt_steps");
  const promptStep = steps.find((step) => step.step_type === "prompt_steps");
  const [showPlaywright, setShowPlaywright] = useState(false);
  const [showPromptSteps, setShowPromptSteps] = useState(false);

  return (
    <div className="border-t bg-muted/30 p-6">
      <div className="space-y-6">
        {/* Playwright Step Header */}
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold">Playwright File Download</h3>
            <p className="text-sm text-muted-foreground">
              Automated browser actions to download files from the target URL
            </p>
            {playwrightStep?.name && (
              <div className="mt-1 text-sm font-medium">{playwrightStep.name}</div>
            )}
            {playwrightStep?.description && (
              <div className="mt-1 text-xs text-muted-foreground">{playwrightStep.description}</div>
            )}
          </div>
          <Badge variant="secondary" className="ml-auto">
            {playwrightSteps.length} step{playwrightSteps.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Run Scrape Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Execute Playwright Actions
              </CardTitle>
              <CardDescription>Run the automated browser actions to download files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Target URL</p>
                    <p className="text-sm text-muted-foreground">{configuration.target_url}</p>
                  </div>
                </div>

                <Button
                  onClick={onRunScrape}
                  disabled={isRunning || !configuration.is_active}
                  className="w-full"
                >
                  {isRunning ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Running Playwright Actions...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Playwright Actions
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
                              Playwright actions completed successfully!
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
                            <p className="font-medium">Playwright actions failed</p>
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

        {/* Playwright Actions Steps Section */}
        <Card>
          <CardHeader
            className="flex cursor-pointer select-none flex-row items-center justify-between"
            onClick={() => setShowPlaywright((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              <span>Playwright Actions</span>
            </span>
            <span className="flex items-center gap-2">
              <CardDescription>
                The sequence of browser actions that will be executed
              </CardDescription>
              {showPlaywright ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          </CardHeader>
          {showPlaywright && (
            <CardContent>
              <ScrapeConfigurationSteps configuration={configuration} />
            </CardContent>
          )}
        </Card>

        {/* Prompt Steps Section */}
        {promptSteps.length > 0 && (
          <Card>
            <CardHeader
              className="flex cursor-pointer select-none flex-row items-center justify-between"
              onClick={() => setShowPromptSteps((v) => !v)}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>AI Prompt Analysis</span>
              </span>
              <span className="flex items-center gap-2">
                <CardDescription>
                  AI prompts for analyzing downloaded data
                </CardDescription>
                {showPromptSteps ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            </CardHeader>
            {showPromptSteps && (
              <CardContent>
                <div className="space-y-4">
                  {promptSteps.map((step, index) => (
                    <div key={index} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{step.name}</h4>
                          {step.description && (
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">Step {step.step_order}</Badge>
                      </div>
                      
                      {step.prompt_data?.[0] && (
                        <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                          <div>
                            <Label className="text-sm font-medium">Prompt</Label>
                            <div className="mt-2 rounded border bg-background p-3 text-sm">
                              <pre className="whitespace-pre-wrap">{step.prompt_data[0].prompt}</pre>
                            </div>
                          </div>
                          
                          {step.prompt_data[0].storage_ids && step.prompt_data[0].storage_ids.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Selected Files</Label>
                              <div className="mt-2 space-y-1">
                                {step.prompt_data[0].storage_ids.map((fileId) => (
                                  <div key={fileId} className="text-sm text-muted-foreground">
                                    • {fileId.includes('florida-rfp-data-2024-01') ? 'florida-rfp-data-2024-01.xlsx' :
                                       fileId.includes('florida-rfp-data-2024-02') ? 'florida-rfp-data-2024-02.xlsx' :
                                       fileId.includes('florida-rfp-data-2024-03') ? 'florida-rfp-data-2024-03.xlsx' :
                                       fileId}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
