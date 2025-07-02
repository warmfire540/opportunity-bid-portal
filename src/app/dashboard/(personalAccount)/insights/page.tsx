import {
  ChevronRight,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Lightbulb,
  Calendar,
} from "lucide-react";

import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { getMarketInsights } from "@lib/actions/insights";
import type { MarketInsight } from "@lib/actions/scraping/types";

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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Insights</h1>
          <p className="text-muted-foreground">
            Strategic insights and market intelligence from your data analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {insights.length} insights
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: MarketInsight }) {
  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case "trends":
        return <TrendingUp className="h-4 w-4" />;
      case "prioritization":
        return <Target className="h-4 w-4" />;
      case "resource_needs":
        return <Users className="h-4 w-4" />;
      case "competitive_analysis":
        return <BarChart3 className="h-4 w-4" />;
      case "market_overview":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case "trends":
        return "bg-blue-100 text-blue-800";
      case "prioritization":
        return "bg-green-100 text-green-800";
      case "resource_needs":
        return "bg-purple-100 text-purple-800";
      case "competitive_analysis":
        return "bg-orange-100 text-orange-800";
      case "market_overview":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatInsightType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Type */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getInsightTypeColor(insight.insight_type)}>
            {getInsightTypeIcon(insight.insight_type)}
            <span className="ml-1">{formatInsightType(insight.insight_type)}</span>
          </Badge>
        </div>

        {/* Insight Text */}
        <div className="space-y-2">
          <p className="line-clamp-3 text-sm text-muted-foreground">{insight.insight_text}</p>
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm">
          {insight.created_at != null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Created:</span>
              <span>{new Date(insight.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Expandable Details */}
        <InsightDetails insight={insight} />
      </CardContent>
    </Card>
  );
}

function InsightDetails({ insight }: { insight: MarketInsight }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        View Full Details
      </summary>

      <div className="mt-4 space-y-4 border-t pt-4">
        {/* Configuration Reference */}
        {insight.scrape_configuration_id != null && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Configuration</h4>
            <div className="text-sm text-muted-foreground">
              <code className="rounded bg-muted px-2 py-1 text-xs">
                {insight.scrape_configuration_id}
              </code>
            </div>
          </div>
        )}

        {/* Metadata */}
        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="space-y-1">
            <div>
              Created:{" "}
              {insight.created_at != null ? new Date(insight.created_at).toLocaleDateString() : "Unknown"}
            </div>
            {insight.updated_at != null && insight.updated_at !== insight.created_at && (
              <div>Updated: {new Date(insight.updated_at).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}
