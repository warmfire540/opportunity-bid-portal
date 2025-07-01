"use client";

import { useState } from "react";

import type { ScrapeConfiguration } from "@lib/actions/scraping";
import {
  toggleScrapeConfigurationAction,
  deleteScrapeConfigurationAction,
  startStepExecutionAction,
  executeNextStepAction,
  cleanupSessionAction,
} from "@lib/actions/scraping";
import ScrapeConfigurationExpandedContent from "./scrape-configuration-expanded-content";
import { Button } from "../../ui/button";
import { SubmitButton } from "../../ui/submit-button";
import { TableRow, TableCell } from "../../ui/table";
import EditScrapeConfigurationDrawer from "../edit-scrape-configuration-drawer";
import { Badge } from "../../ui/badge";
import { ChevronDown, ChevronRight, ExternalLink, Pause, Play, Trash2 } from "lucide-react";

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
    const startTime = Date.now();

    try {
      // Start the execution session
      console.log(`[SCRAPE ROW] Starting execution for configuration: ${configuration.id}`);
      const startResult = await startStepExecutionAction(configuration.id!);

      if (!startResult.success) {
        throw new Error(startResult.error);
      }

      setSessionId(startResult.sessionId);
      console.log(`[SCRAPE ROW] Session started: ${startResult.sessionId}`);

      // Execute each step one by one
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);

        console.log(`[SCRAPE ROW] Executing step ${i + 1}/${steps.length}: ${steps[i].name}`);

        // Execute the step using the server action
        const stepResult = await executeNextStepAction(startResult.sessionId, i);

        if (!stepResult.success) {
          throw new Error(`Step ${i + 1} failed: ${stepResult.error}`);
        }

        console.log(`[SCRAPE ROW] Step ${i + 1} completed successfully: ${stepResult.stepName}`);

        // If this was the last step, we're done
        if (stepResult.isComplete) {
          const executionTimeMs = Date.now() - startTime;
          setResult({
            success: true,
            downloadPath: `/downloads/${configuration.id}-${Date.now()}.xlsx`,
            downloadUrl: stepResult.downloadUrl,
            executionTimeMs,
            stepsExecuted: stepResult.currentStep,
          });
          console.log(`[SCRAPE ROW] All steps completed successfully`);
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
      if (sessionId) {
        try {
          await cleanupSessionAction(sessionId);
          console.log(`[SCRAPE ROW] Session ${sessionId} cleaned up`);
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
              {configuration.description && (
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
          <Badge variant={configuration.is_active ? "default" : "secondary"}>
            {configuration.is_active ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <form className="inline">
              <input type="hidden" name="id" value={configuration.id} />
              <input type="hidden" name="isActive" value={(!configuration.is_active).toString()} />
              <SubmitButton variant="ghost" size="sm" formAction={handleToggle}>
                {configuration.is_active ? (
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
