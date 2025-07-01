"use client";

import { useState } from "react";
import { Play, Pause, Trash2, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

import type { ScrapeConfiguration } from "@lib/actions/scrape-configurations";
import {
  toggleScrapeConfigurationAction,
  deleteScrapeConfigurationAction,
} from "@lib/actions/scrape-configurations";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { SubmitButton } from "../ui/submit-button";
import { TableRow, TableCell } from "../ui/table";
import EditScrapeConfigurationDrawer from "./edit-scrape-configuration-drawer";
import ScrapeConfigurationExpandedContent from "./scrape-configuration-expanded-content";

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
  const [result, setResult] = useState<ScrapeResult | null>(null);

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
    setResult(null); // Clear previous result
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: configuration.id }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Scrape completed successfully:", result);
        setResult({
          success: true,
          downloadPath: result.downloadPath,
          downloadUrl: result.downloadUrl,
          executionTimeMs: result.executionTimeMs,
          stepsExecuted: result.stepsExecuted,
        });
      } else {
        console.error("Scrape failed:", result.error);
        setResult({
          success: false,
          error: result.error,
          executionTimeMs: result.executionTimeMs,
          stepsExecuted: result.stepsExecuted,
        });
      }
    } catch (error) {
      console.error("Failed to run scrape:", error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsRunning(false);
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
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
