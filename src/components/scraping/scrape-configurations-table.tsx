import type { ScrapeConfiguration } from "@lib/actions/scrape-configurations";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table";
import ScrapeConfigurationRow from "./scrape-configuration-row";

type Props = {
  configurations: ScrapeConfiguration[];
  onUpdate: () => void;
};

export default function ScrapeConfigurationsTable({ configurations, onUpdate }: Readonly<Props>) {
  return (
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
        {configurations.map((config) => (
          <ScrapeConfigurationRow key={config.id} configuration={config} onUpdate={onUpdate} />
        ))}
      </TableBody>
    </Table>
  );
}
