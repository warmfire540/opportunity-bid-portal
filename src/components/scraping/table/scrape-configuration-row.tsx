"use client";

import { ChevronDown, ChevronRight, ExternalLink, Pause, Play, Trash2 } from "lucide-react";
import { useState } from "react";

import type { ScrapeConfiguration, StepExecutionResult } from "@lib/actions/scraping";
import {
  toggleScrapeConfigurationAction,
  deleteScrapeConfigurationAction,
  startStepExecutionAction,
  executeNextStepAction,
  cleanupSessionAction,
} from "@lib/actions/scraping";

import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { SubmitButton } from "../../ui/submit-button";
import { TableRow, TableCell } from "../../ui/table";
import EditScrapeConfigurationDrawer from "../edit-scrape-configuration-drawer";

import ScrapeConfigurationExpandedContent from "./scrape-configuration-expanded-content";

type ScrapeResult = {
  success: boolean;
  downloadPath?: string;
  downloadUrl?: string;
  executionTimeMs?: number;
  stepsExecuted?: number;
  error?: string;
  stepResults?: StepExecutionResult[];
};

type Props = {
  configuration: ScrapeConfiguration;
  onUpdate: () => void;
};

export default function ScrapeConfigurationRow({ configuration, onUpdate }: Readonly<Props>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleToggle = async (prevState: any, formData: FormData) => {
    const result = await toggleScrapeConfigurationAction(formData);
    setTimeout(() => onUpdate(), 100);
    return result;
  };

  const handleDelete = async (prevState: any, formData: FormData) => {
    const result = await deleteScrapeConfigurationAction(formData);
    setTimeout(() => onUpdate(), 100);
    return result;
  };

  const handleRunScrape = async () => {
    setIsRunning(true);
    setResult(null);
    setCurrentStepIndex(undefined);
    setSessionId(null);

    const steps = Array.isArray(configuration.steps) ? configuration.steps : [];
    const stepResults: StepExecutionResult[] = [];
    const startTime = Date.now();

    try {
      // Start the execution session
      const startResult = await startStepExecutionAction(configuration.id!);

      if (!startResult.success) {
        throw new Error(startResult.error);
      }

      setSessionId(startResult.sessionId);

      // Execute each step one by one
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);

        // Execute the step using the server action
        const stepResult = await executeNextStepAction(startResult.sessionId, i);
        stepResults.push(stepResult.result);

        if (!stepResult.success) {
          throw new Error(`Step ${i + 1} failed: ${stepResult.error}`);
        }

        // If this was the last step, we're done
        if (stepResult.isComplete) {
          const executionTimeMs = Date.now() - startTime;
          setResult({
            success: true,
            downloadPath: `/downloads/${configuration.id}-${Date.now()}.xlsx`,
            downloadUrl: stepResult.downloadUrl,
            executionTimeMs,
            stepsExecuted: stepResult.currentStep,
            stepResults,
          });
          break;
        }
      }
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      console.error("Scrape execution failed:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        executionTimeMs,
        stepsExecuted: currentStepIndex ?? 0,
      });
    } finally {
      // Clean up session if it exists
      if (sessionId != null) {
        try {
          await cleanupSessionAction(sessionId);
        } catch (cleanupError) {
          console.error(`[SCRAPE ROW] Error cleaning up session:`, cleanupError);
        }
      }

      setIsRunning(false);
      setCurrentStepIndex(undefined);
      setSessionId(null);
    }
  };

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <TableCell>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="flex flex-col">
              <span className="font-medium">{configuration.name}</span>
              {configuration.description != null && (
                <span className="text-sm text-muted-foreground">{configuration.description}</span>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="max-w-48 truncate text-sm text-muted-foreground">
              {configuration.target_url}
            </span>
            <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
              <a href={configuration.target_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            <Badge variant="outline">
              {Array.isArray(configuration.steps) ? configuration.steps.length : 0}
            </Badge>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={
              configuration.is_active != null && configuration.is_active ? "default" : "secondary"
            }
          >
            {(configuration.is_active ?? false) ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <form className="inline">
              <input type="hidden" name="id" value={configuration.id} />
              <input
                type="hidden"
                name="isActive"
                value={(!(configuration.is_active ?? false)).toString()}
              />
              <SubmitButton variant="ghost" size="sm" formAction={handleToggle}>
                {(configuration.is_active ?? false) ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </SubmitButton>
            </form>

            <EditScrapeConfigurationDrawer configuration={configuration} onUpdate={onUpdate} />

            <form className="inline">
              <input type="hidden" name="id" value={configuration.id} />
              <SubmitButton
                variant="ghost"
                size="sm"
                formAction={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </SubmitButton>
            </form>
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={5} className="p-0">
            <ScrapeConfigurationExpandedContent
              configuration={configuration}
              isRunning={isRunning}
              onRunScrape={handleRunScrape}
              result={result}
              currentStepIndex={currentStepIndex}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
