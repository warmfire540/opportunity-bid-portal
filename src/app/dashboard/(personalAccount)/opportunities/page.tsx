import { ChevronRight, ExternalLink, Calendar, DollarSign, Tag, Target, Award, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground">
            Manage and track your RFP opportunities
          </p>
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

function OpportunityCard({ opportunity }: { opportunity: any }) {
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
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {opportunity.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-1">
              {opportunity.agency ?? "Unknown Agency"}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getStatusColor(opportunity.status)}>
            {opportunity.status.replace("_", " ")}
          </Badge>
          {opportunity.strategic_fit && (
            <Badge variant="outline" className={getStrategicFitColor(opportunity.strategic_fit)}>
              <Target className="h-3 w-3 mr-1" />
              {opportunity.strategic_fit}
            </Badge>
          )}
          {opportunity.win_probability && (
            <Badge variant="outline" className={getWinProbabilityColor(opportunity.win_probability)}>
              <Award className="h-3 w-3 mr-1" />
              {opportunity.win_probability}
            </Badge>
          )}
        </div>

        {/* Key Information */}
        <div className="space-y-2 text-sm">
          {opportunity.bid_number && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Bid:</span>
              <span>{opportunity.bid_number}</span>
            </div>
          )}
          
          {opportunity.due_date && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Due:</span>
              <span>{new Date(opportunity.due_date).toLocaleDateString()}</span>
            </div>
          )}

          {opportunity.estimated_value && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Value:</span>
              <span>${opportunity.estimated_value.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Go/No-Go Decision */}
        {opportunity.go_no_go_decision && (
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
        {opportunity.tags && opportunity.tags.length > 0 && (
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

function OpportunityDetails({ opportunity }: { opportunity: any }) {
  return (
    <details className="group">
      <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ChevronRight className="h-4 w-4 group-open:rotate-90 transition-transform" />
        View Details
      </summary>
      
      <div className="mt-4 space-y-4 pt-4 border-t">
        {/* Description */}
        {opportunity.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {opportunity.description}
            </p>
          </div>
        )}

        {/* Key Messaging Points */}
        {opportunity.key_messaging_points && opportunity.key_messaging_points.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Messaging Points</h4>
            <ul className="space-y-1">
              {opportunity.key_messaging_points.map((point: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risk Assessment */}
        {opportunity.risk_assessment && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Risk Assessment</h4>
            <p className="text-sm text-muted-foreground">{opportunity.risk_assessment}</p>
          </div>
        )}

        {/* Required Certifications */}
        {opportunity.required_certifications && opportunity.required_certifications.length > 0 && (
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
        {opportunity.keywords && opportunity.keywords.length > 0 && (
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
        {opportunity.service_areas && opportunity.service_areas.length > 0 && (
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
        {opportunity.requirements && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Requirements</h4>
            <p className="text-sm text-muted-foreground">{opportunity.requirements}</p>
          </div>
        )}

        {/* Commodity Codes */}
        {opportunity.commodity_codes && opportunity.commodity_codes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Commodity Codes</h4>
            <div className="flex flex-wrap gap-1">
              {opportunity.commodity_codes.map((code: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs font-mono">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {opportunity.contact_info && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact Information</h4>
            <div className="text-sm text-muted-foreground">
              <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">
                {JSON.stringify(opportunity.contact_info, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Metadata */}
        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created: {opportunity.created_at ? new Date(opportunity.created_at).toLocaleDateString() : "Unknown"}</span>
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
