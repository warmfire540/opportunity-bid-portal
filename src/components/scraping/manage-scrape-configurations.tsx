import { Plus, Play, Pause, Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

import {
  toggleScrapeConfiguration,
  deleteScrapeConfiguration,
} from "@lib/actions/scrape-configurations";
import { createClient } from "@lib/supabase/server";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { SubmitButton } from "../ui/submit-button";
import { Table, TableRow, TableBody, TableCell, TableHead, TableHeader } from "../ui/table";

export default async function ManageScrapeConfigurations() {
  const supabaseClient = createClient();

  const { data: configurations } = await supabaseClient.rpc("get_scrape_configurations_with_steps");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>RFP Download Configurations</CardTitle>
            <CardDescription>
              Manage your automated scraping configurations for RFP downloads
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/dashboard/scrape-configurations/new">
              <Plus className="mr-2 h-4 w-4" />
              New Configuration
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!configurations || configurations.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No configurations found. Create your first one to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configurations.map((config: any) => (
                <TableRow key={config.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{config.name}</span>
                      {config.description && (
                        <span className="text-sm text-muted-foreground">{config.description}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="max-w-48 truncate text-sm text-muted-foreground">
                        {config.target_url}
                      </span>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={config.target_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {Array.isArray(config.steps) ? config.steps.length : 0} steps
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.is_active ? "default" : "secondary"}>
                      {config.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <form className="inline">
                        <input type="hidden" name="id" value={config.id} />
                        <input
                          type="hidden"
                          name="isActive"
                          value={(!config.is_active).toString()}
                        />
                        <SubmitButton
                          variant="ghost"
                          size="sm"
                          formAction={async (prevState, formData) => {
                            "use server";
                            const id = formData.get("id") as string;
                            const isActive = formData.get("isActive") === "true";
                            await toggleScrapeConfiguration(id, isActive);
                          }}
                        >
                          {config.is_active ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </SubmitButton>
                      </form>

                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/scrape-configurations/${config.id}/edit`}>
                          <Edit className="h-3 w-3" />
                        </Link>
                      </Button>

                      <form className="inline">
                        <input type="hidden" name="id" value={config.id} />
                        <SubmitButton
                          variant="ghost"
                          size="sm"
                          formAction={async (prevState, formData) => {
                            "use server";
                            const id = formData.get("id") as string;
                            await deleteScrapeConfiguration(id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </SubmitButton>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
