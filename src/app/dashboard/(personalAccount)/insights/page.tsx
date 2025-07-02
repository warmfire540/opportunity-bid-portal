import {
  ChevronRight,
  TrendingUp,
  Target,
  Users,
  BarChart3,
  Lightbulb,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";

import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
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

function InsightCard({ insight }: { insight: any }) {
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
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
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
              {insight.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-1">
              {insight.description ?? "Market intelligence insight"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {insight.actionable && (
              <Badge variant="outline" className="text-xs">
                <Zap className="mr-1 h-3 w-3" />
                Actionable
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Type and Confidence */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getInsightTypeColor(insight.insight_type)}>
            {getInsightTypeIcon(insight.insight_type)}
            <span className="ml-1">{formatInsightType(insight.insight_type)}</span>
          </Badge>
          {insight.confidence_level && (
            <Badge variant="outline" className={getConfidenceColor(insight.confidence_level)}>
              {insight.confidence_level} confidence
            </Badge>
          )}
        </div>

        {/* Key Insights Preview */}
        {insight.insights && insight.insights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Key Insights</span>
            </div>
            <div className="space-y-1">
              {insight.insights.slice(0, 2).map((insightText: string, index: number) => (
                <p key={index} className="line-clamp-2 text-sm text-muted-foreground">
                  • {insightText}
                </p>
              ))}
              {insight.insights.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  ...and {insight.insights.length - 2} more insights
                </p>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 text-sm">
          {insight.created_at && (
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

function InsightDetails({ insight }: { insight: any }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        View Full Details
      </summary>

      <div className="mt-4 space-y-4 border-t pt-4">
        {/* Description */}
        {insight.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
          </div>
        )}

        {/* All Insights */}
        {insight.insights && insight.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">All Insights</h4>
            <ul className="space-y-2">
              {insight.insights.map((insightText: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 text-primary">•</span>
                  <span>{insightText}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Source Data */}
        {insight.source_data && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Source Data</h4>
            <p className="text-sm text-muted-foreground">{insight.source_data}</p>
          </div>
        )}

        {/* Actionable Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Actionability</h4>
          <div className="flex items-center gap-2">
            {insight.actionable ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Actionable</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">Informational</span>
              </>
            )}
          </div>
        </div>

        {/* Configuration Reference */}
        {insight.scrape_configuration_id && (
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
              {insight.created_at ? new Date(insight.created_at).toLocaleDateString() : "Unknown"}
            </div>
            {insight.updated_at && insight.updated_at !== insight.created_at && (
              <div>Updated: {new Date(insight.updated_at).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>
    </details>
  );
}
