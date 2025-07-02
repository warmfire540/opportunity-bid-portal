import { getMarketInsights } from "@lib/actions/insights";

export default async function InsightsPage() {
  const insights = await getMarketInsights();

  if (insights.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="mb-2 text-lg font-semibold">No insights found</div>
        <div className="text-sm">
          Insights generated from your scraping configurations will appear here.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Market Insights</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Confidence</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Insights</th>
            </tr>
          </thead>
          <tbody>
            {insights.map((insight) => (
              <tr key={insight.id} className="border-t">
                <td className="px-4 py-2 font-medium">{insight.title}</td>
                <td className="px-4 py-2 capitalize">{insight.insight_type.replace(/_/g, " ")}</td>
                <td className="px-4 py-2 capitalize">{insight.confidence_level ?? "-"}</td>
                <td className="px-4 py-2">
                  {insight.created_at != null
                    ? new Date(insight.created_at).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-2">
                  {Array.isArray(insight.insights)
                    ? insight.insights.slice(0, 2).map((i, idx) => (
                        <div key={idx} className="mb-1">
                          • {i}
                        </div>
                      ))
                    : "-"}
                  {Array.isArray(insight.insights) && insight.insights.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      ...and {insight.insights.length - 2} more
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
