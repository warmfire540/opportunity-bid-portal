"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import type { ScrapeConfiguration } from "@lib/actions/scrape-configurations";

import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import DownloadedFiles from "./downloaded-files";

type Props = {
  configuration: ScrapeConfiguration;
};

export default function ScrapeConfigurationSteps({ configuration }: Readonly<Props>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const steps = Array.isArray(configuration.steps) ? configuration.steps : [];

  return (
    <div className="space-y-4">
      {/* Configuration Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>Configuration Steps</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription>
            The sequence of actions this configuration will perform
          </CardDescription>
        </CardHeader>
        {isExpanded && (
          <CardContent>
            {steps.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <p>No steps configured yet.</p>
                <p className="text-sm">Add steps to define the scraping workflow.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div
                    key={step.id ?? index}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {step.action_type}
                        </Badge>
                        {step.selector_type && (
                          <Badge variant="outline" className="text-xs">
                            {step.selector_type}
                          </Badge>
                        )}
                      </div>
                      {step.description && (
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      )}
                      {step.selector && (
                        <p className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {step.selector}
                        </p>
                      )}
                      {step.value && (
                        <p className="text-xs text-muted-foreground">Value: {step.value}</p>
                      )}
                      {step.wait_time && (
                        <p className="text-xs text-muted-foreground">Wait: {step.wait_time}ms</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Downloaded Files Card */}
      <DownloadedFiles configuration={configuration} />
    </div>
  );
} 