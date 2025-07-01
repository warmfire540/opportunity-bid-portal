import { redirect } from "next/navigation";

import { createScrapeConfiguration } from "@lib/actions/scrape-configurations";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Badge } from "@/src/components/ui/badge";
import { Plus, Trash2, GripVertical } from "lucide-react";

export default function NewScrapeConfigurationPage() {
  async function createConfiguration(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const target_url = formData.get("target_url") as string;

    // For now, create a basic configuration with one playwright step
    const configuration = {
      name,
      description,
      target_url,
      is_active: true,
      steps: [
        {
          step_order: 1,
          step_type: "playwright" as const,
          name: "Download RFP Data",
          description: "Navigate to the site and download RFP data using Playwright automation",
          sub_steps: [
            {
              step_order: 1,
              action_type: "goto",
              description: "Navigate to the target URL",
            },
          ],
        },
      ],
    };

    await createScrapeConfiguration(configuration);
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">New Scrape Configuration</h1>
          <p className="text-muted-foreground">
            Create a new automated scraping configuration for RFP downloads
          </p>
        </div>

        <form action={createConfiguration}>
          <div className="space-y-6">
            {/* Basic Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration Details</CardTitle>
                <CardDescription>
                  Basic information about your scraping configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" placeholder="e.g., Florida RFP Scraper" required />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what this configuration does..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="target_url">Target URL *</Label>
                  <Input
                    id="target_url"
                    name="target_url"
                    type="url"
                    placeholder="https://vendor.myfloridamarketplace.com/search/bids"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Steps Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Steps</CardTitle>
                <CardDescription>Define the steps for your scraping workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">Step 1</Badge>
                      <Badge variant="secondary">playwright</Badge>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">Step Type</Label>
                        <Select defaultValue="playwright" disabled>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="playwright">Playwright File Download</SelectItem>
                            <SelectItem value="ai_prompt">AI Prompt</SelectItem>
                            <SelectItem value="links_analysis">Links Analysis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Name</Label>
                        <Input defaultValue="Download RFP Data" disabled />
                      </div>

                      <div>
                        <Label className="text-sm">Description</Label>
                        <Textarea
                          defaultValue="Navigate to the site and download RFP data using Playwright automation"
                          disabled
                          rows={2}
                        />
                      </div>

                      {/* Playwright Sub-steps */}
                      <div className="border-t pt-4">
                        <div className="mb-3 flex items-center justify-between">
                          <Label className="text-sm font-medium">Playwright Actions</Label>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded bg-muted/50 p-3">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Action 1
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                goto
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Navigate to the target URL
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">
                      More step types and configuration options will be available in the edit
                      interface.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <a href="/dashboard">Cancel</a>
              </Button>
              <Button type="submit">Create Configuration</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
