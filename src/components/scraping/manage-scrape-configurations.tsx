"use client";

import { useEffect, useState } from "react";

import { getScrapeConfigurations } from "@lib/actions/scraping";

import { Card, CardContent } from "../ui/card";

import ScrapeConfigurationsEmpty from "./scrape-configurations-empty";
import ScrapeConfigurationsHeader from "./scrape-configurations-header";
import ScrapeConfigurationsLoading from "./scrape-configurations-loading";
import ScrapeConfigurationsTable from "./table/scrape-configurations-table";

export default function ManageScrapeConfigurations() {
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfigurations = async () => {
    try {
      const data = await getScrapeConfigurations();
      setConfigurations(data ?? []);
    } catch (error) {
      console.error("Failed to load configurations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  const handleUpdate = () => {
    loadConfigurations();
  };

  if (isLoading) {
    return <ScrapeConfigurationsLoading />;
  }

  return (
    <Card>
      <ScrapeConfigurationsHeader onUpdate={handleUpdate} />
      <CardContent>
        {configurations.length === 0 ? (
          <ScrapeConfigurationsEmpty />
        ) : (
          <ScrapeConfigurationsTable configurations={configurations} onUpdate={handleUpdate} />
        )}
      </CardContent>
    </Card>
  );
}
