"use client";

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { ChevronDown, ChevronRight, Download, FileText, Calendar } from "lucide-react";
import { useState } from "react";

import type { ScrapeConfiguration, ScrapeDownloadStep } from "@lib/actions/scraping";

import { Button } from "../../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";

type DownloadedFile = {
  id: string;
  name: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  downloadUrl: string;
};

type Props = {
  configuration: ScrapeConfiguration;
  step: ScrapeDownloadStep;
};

export default function StepDownloadedFiles({ configuration, step }: Readonly<Props>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [files, setFiles] = useState<DownloadedFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch(
        `/api/scrape/files?configurationId=${configuration.id}&stepId=${step.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files ?? []);
      } else {
        console.error("Failed to load files:", response.statusText);
      }
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle
          className="flex cursor-pointer items-center justify-between"
          onClick={() => {
            setIsExpanded(!isExpanded);
            if (!isExpanded && files.length === 0) {
              loadFiles();
            }
          }}
        >
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <span>Downloaded Files</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
        <CardDescription>Files downloaded by this step</CardDescription>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {isLoadingFiles ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>No files downloaded yet.</p>
              <p className="text-sm">Run the configuration to download files.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <FileText className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{file.filename}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                          <a href={file.downloadUrl} download={file.filename}>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
