import Link from "next/link";

import { getOpportunities } from "@lib/actions/opportunities";

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities();

  if (opportunities.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="mb-2 text-lg font-semibold">No opportunities found</div>
        <div className="text-sm">Opportunities you create or import will appear here.</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Opportunities</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Agency</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Source</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp.id} className="border-t">
                <td className="px-4 py-2 font-medium">{opp.title}</td>
                <td className="px-4 py-2">{opp.agency ?? "-"}</td>
                <td className="px-4 py-2">
                  {opp.due_date != null ? new Date(opp.due_date).toLocaleDateString() : "-"}
                </td>
                <td className="px-4 py-2 capitalize">{opp.status}</td>
                <td className="px-4 py-2">
                  <Link
                    href={opp.source}
                    className="text-blue-600 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
