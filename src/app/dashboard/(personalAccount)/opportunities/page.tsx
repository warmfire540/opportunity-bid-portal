import {
  ChevronRight,
  ExternalLink,
  Calendar,
  DollarSign,
  Tag,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  FileText,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { getOpportunities } from "@lib/actions/opportunities";
import type { Opportunity } from "@lib/actions/scraping";

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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">Manage and track your RFP opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {opportunities.length} total
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} opportunity={opp} />
        ))}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "submitted":
        return "bg-purple-100 text-purple-800";
      case "awarded":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStrategicFitColor = (fit: string) => {
    switch (fit) {
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

  const getWinProbabilityColor = (probability: string) => {
    if (probability !== "" && probability.toLowerCase().includes("high")) {
      return "bg-green-100 text-green-800";
    } else if (probability !== "" && probability.toLowerCase().includes("medium")) {
      return "bg-yellow-100 text-yellow-800";
    } else if (probability !== "" && probability.toLowerCase().includes("low")) {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getGoNoGoColor = (decision: string) => {
    if (decision !== "" && decision.toLowerCase().includes("go")) {
      return "bg-green-100 text-green-800";
    } else if (decision !== "" && decision.toLowerCase().includes("no-go")) {
      return "bg-red-100 text-red-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
              {opportunity.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-1">
              {opportunity.agency ?? "Unknown Agency"}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 transition-opacity group-hover:opacity-100"
            asChild
          >
            <Link href={opportunity.source} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Key Metrics */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getStatusColor(opportunity.status)}>
            {opportunity.status.replace("_", " ")}
          </Badge>
          {opportunity.strategic_fit != null && (
            <Badge variant="outline" className={getStrategicFitColor(opportunity.strategic_fit)}>
              <Target className="mr-1 h-3 w-3" />
              {opportunity.strategic_fit}
            </Badge>
          )}
          {(opportunity.win_probability === "high" ||
            opportunity.win_probability === "medium" ||
            opportunity.win_probability === "low") && (
            <Badge
              variant="outline"
              className={getWinProbabilityColor(opportunity.win_probability as string)}
            >
              <Award className="mr-1 h-3 w-3" />
              {opportunity.win_probability}
            </Badge>
          )}
        </div>

        {/* Key Information */}
        <div className="space-y-2 text-sm">
          {opportunity.bid_number != null && opportunity.bid_number !== "" && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Bid:</span>
              <span>{opportunity.bid_number}</span>
            </div>
          )}

          {opportunity.due_date != null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Due:</span>
              <span>{new Date(opportunity.due_date).toLocaleDateString()}</span>
            </div>
          )}

          {opportunity.estimated_value != null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Value:</span>
              <span>${opportunity.estimated_value.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Go/No-Go Decision */}
        {opportunity.go_no_go_decision != null && opportunity.go_no_go_decision !== "" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {opportunity.go_no_go_decision.toLowerCase().includes("go") ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">Decision</span>
            </div>
            <Badge className={getGoNoGoColor(opportunity.go_no_go_decision)}>
              {opportunity.go_no_go_decision}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {Array.isArray(opportunity.tags) && opportunity.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {opportunity.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {opportunity.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{opportunity.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Expandable Details */}
        <OpportunityDetails opportunity={opportunity} />
      </CardContent>
    </Card>
  );
}

function OpportunityDetails({ opportunity }: { opportunity: Opportunity }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        View Details
      </summary>

      <div className="mt-4 space-y-4 border-t pt-4">
        {/* Description */}
        {opportunity.description != null && opportunity.description !== "" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="line-clamp-3 text-sm text-muted-foreground">{opportunity.description}</p>
          </div>
        )}

        {/* Key Messaging Points */}
        {Array.isArray(opportunity.key_messaging_points) &&
          opportunity.key_messaging_points.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Key Messaging Points</h4>
              <ul className="space-y-1">
                {opportunity.key_messaging_points.map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 text-primary">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Risk Assessment */}
        {opportunity.risk_assessment != null && opportunity.risk_assessment !== "" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Risk Assessment</h4>
            <p className="text-sm text-muted-foreground">{opportunity.risk_assessment}</p>
          </div>
        )}

        {/* Required Certifications */}
        {Array.isArray(opportunity.required_certifications) &&
          opportunity.required_certifications.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Required Certifications</h4>
              <div className="flex flex-wrap gap-1">
                {opportunity.required_certifications.map((cert: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {/* Keywords */}
        {Array.isArray(opportunity.keywords) && opportunity.keywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Keywords</h4>
            <div className="flex flex-wrap gap-1">
              {opportunity.keywords.map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Service Areas */}
        {Array.isArray(opportunity.service_areas) && opportunity.service_areas.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Service Areas</h4>
            <div className="flex flex-wrap gap-1">
              {opportunity.service_areas.map((area: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {opportunity.requirements != null && opportunity.requirements !== "" && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Requirements</h4>
            <p className="text-sm text-muted-foreground">{opportunity.requirements}</p>
          </div>
        )}

        {/* Commodity Codes */}
        {Array.isArray(opportunity.commodity_codes) && opportunity.commodity_codes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Commodity Codes</h4>
            <div className="flex flex-wrap gap-1">
              {opportunity.commodity_codes.map((code: string, index: number) => (
                <Badge key={index} variant="secondary" className="font-mono text-xs">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {opportunity.contact_info != null &&
          typeof opportunity.contact_info === "object" &&
          Object.keys(opportunity.contact_info).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Contact Information</h4>
              <div className="text-sm text-muted-foreground">
                <pre className="whitespace-pre-wrap rounded bg-muted p-2 text-xs">
                  {JSON.stringify(opportunity.contact_info, null, 2)}
                </pre>
              </div>
            </div>
          )}

        {/* Metadata */}
        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Created:{" "}
            {opportunity.created_at != null
              ? new Date(opportunity.created_at).toLocaleDateString()
              : "Unknown"}
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link href={opportunity.source} target="_blank" rel="noopener noreferrer">
              View Source
            </Link>
          </Button>
        </div>
      </div>
    </details>
  );
}
