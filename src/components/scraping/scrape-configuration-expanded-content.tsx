"use client";

import { Download, Clock, Play, CheckCircle, XCircle, ExternalLink } from "lucide-react";

import type { ScrapeConfiguration } from "@lib/actions/scrape-configurations";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { ScrapeConfigurationSteps } from "./index";

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

  return (
    <div className="border-t bg-muted/30 p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Run Scrape Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Run Download Scrape
            </CardTitle>
            <CardDescription>
              Execute this configuration to download files from the target URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Target URL</p>
                  <p className="text-sm text-muted-foreground">{configuration.target_url}</p>
                </div>
                <Badge variant="outline">{steps.length} steps</Badge>
              </div>

              <Button
                onClick={onRunScrape}
                disabled={isRunning || !configuration.is_active}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Scrape and Find Opportunities
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
                          <p className="font-medium">Scrape completed successfully!</p>
                          <div className="space-y-1 text-sm">
                            <p>Steps executed: {result.stepsExecuted}</p>
                            <p>Execution time: {result.executionTimeMs}ms</p>
                            {result.downloadUrl && (
                              <div className="flex items-center gap-2">
                                <span>Download:</span>
                                <Button variant="outline" size="sm" asChild className="h-6 text-xs">
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
                          <p className="font-medium">Scrape failed</p>
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

        {/* Steps Section */}
        <ScrapeConfigurationSteps configuration={configuration} />
      </div>
    </div>
  );
}
