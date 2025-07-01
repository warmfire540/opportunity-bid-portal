import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "../ui/button";
import { CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function ScrapeConfigurationsHeader() {
  return (
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
  );
}
