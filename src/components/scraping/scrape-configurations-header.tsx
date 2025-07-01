"use client";

import { Plus } from "lucide-react";

import { Button } from "../ui/button";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";
import EditScrapeConfigurationDrawer from "./edit-scrape-configuration-drawer";

type Props = {
  onUpdate?: () => void;
};

export default function ScrapeConfigurationsHeader({ onUpdate }: Readonly<Props>) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>RFP Download Configurations</CardTitle>
          <CardDescription>
            Manage your automated scraping configurations for RFP downloads
          </CardDescription>
        </div>
        <EditScrapeConfigurationDrawer
          mode="create"
          onUpdate={onUpdate}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Configuration
            </Button>
          }
        />
      </div>
    </CardHeader>
  );
}
