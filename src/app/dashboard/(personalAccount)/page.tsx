import {
  TrendingUp,
  FileText,
  Settings,
  Rocket,
  Calendar,
  Target,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { getMarketInsights } from "@/src/lib/actions/insights";
import { getOpportunities } from "@/src/lib/actions/opportunities";
import { getScrapeConfigurations } from "@/src/lib/actions/scraping/crud";
import { createClient } from "@/src/lib/supabase/server";
import type { ScrapeConfiguration } from "@lib/actions/scraping";

export default async function PersonalAccountPage() {
  const supabaseClient = createClient();
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  // Fetch data for dashboard
  const [opportunities, insights, configurations] = await Promise.allSettled([
    getOpportunities(),
    getMarketInsights(),
    getScrapeConfigurations(),
  ]);

  const opportunitiesData = opportunities.status === "fulfilled" ? opportunities.value : [];
  const insightsData = insights.status === "fulfilled" ? insights.value : [];
  const configurationsData = configurations.status === "fulfilled" ? configurations.value : [];

  // Calculate statistics
  const totalOpportunities = opportunitiesData.length;
  const newOpportunities = opportunitiesData.filter((opp) => opp.status === "new").length;
  const inProgressOpportunities = opportunitiesData.filter(
    (opp) => opp.status === "in_progress"
  ).length;
  const submittedOpportunities = opportunitiesData.filter(
    (opp) => opp.status === "submitted"
  ).length;

  const totalInsights = insightsData.length;
  const activeConfigurations = configurationsData.filter(
    (config: ScrapeConfiguration) => config.is_active === true
  ).length;
  const totalConfigurations = configurationsData.length;

  // Get recent opportunities
  const recentOpportunities = opportunitiesData.slice(0, 3);

  // Get upcoming due dates
  const upcomingDueDates = opportunitiesData
    .filter((opp) => opp.due_date != null && opp.status !== "awarded" && opp.status !== "rejected")
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-y-8">
      {/* Welcome Section */}
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h1 className="mb-2 text-3xl font-bold text-blue-900">
          Welcome back
          {user?.email != null && user.email !== "" ? `, ${user.email.split("@")[0]}` : ""}!
        </h1>
        <p className="text-blue-700">
          Here&apos;s what&apos;s happening with your opportunity tracking system.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-900">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
          <span>This dashboard is a <b>proof of concept</b> and is under active construction. Features and data may change frequently.</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpportunities}</div>
            <p className="text-xs text-muted-foreground">
              {newOpportunities} new, {inProgressOpportunities} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Insights</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInsights}</div>
            <p className="text-xs text-muted-foreground">AI-generated insights available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Configurations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConfigurations}</div>
            <p className="text-xs text-muted-foreground">
              of {totalConfigurations} total configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted Bids</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedOpportunities}</div>
            <p className="text-xs text-muted-foreground">Awaiting responses</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Opportunities
            </CardTitle>
            <CardDescription>Latest opportunities added to your system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOpportunities.length > 0 ? (
              <div className="space-y-3">
                {recentOpportunities.map((opportunity, idx) => (
                  <div
                    key={opportunity.id ?? idx}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <h4 className="truncate text-sm font-medium">
                        {typeof opportunity.title === "string" && opportunity.title.trim() !== ""
                          ? opportunity.title
                          : "Untitled"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {typeof opportunity.agency === "string" && opportunity.agency.trim() !== ""
                          ? opportunity.agency
                          : "No agency"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        opportunity.status === "new"
                          ? "default"
                          : opportunity.status === "in_progress"
                            ? "secondary"
                            : opportunity.status === "submitted"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {typeof opportunity.status === "string" && opportunity.status.trim() !== ""
                        ? opportunity.status.replace(/_/g, " ")
                        : "Unknown"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No opportunities yet</p>
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/opportunities">View All Opportunities</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Due Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Due Dates
            </CardTitle>
            <CardDescription>Opportunities with approaching deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDueDates.length > 0 ? (
              <div className="space-y-3">
                {upcomingDueDates.map((opportunity, idx) => (
                  <div
                    key={opportunity.id ?? idx}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <h4 className="truncate text-sm font-medium">
                        {typeof opportunity.title === "string" && opportunity.title.trim() !== ""
                          ? opportunity.title
                          : "Untitled"}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Due:{" "}
                        {opportunity.due_date != null
                          ? new Date(opportunity.due_date).toLocaleDateString()
                          : "No date"}
                      </p>
                    </div>
                    {typeof opportunity.estimated_value === "number" &&
                    !isNaN(opportunity.estimated_value) ? (
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${opportunity.estimated_value.toLocaleString()}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No upcoming deadlines</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>Quick actions to get you up and running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/configurations">
                  <Settings className="mr-2 h-4 w-4" />
                  Create Your First Configuration
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/opportunities">
                  <FileText className="mr-2 h-4 w-4" />
                  View Opportunities
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/insights">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Check Market Insights
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current system configuration and health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Configurations</span>
                <Badge variant={activeConfigurations > 0 ? "default" : "secondary"}>
                  {activeConfigurations} active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Opportunities</span>
                <Badge variant="outline">{totalOpportunities}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Market Insights</span>
                <Badge variant="outline">{totalInsights}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">System Status</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button asChild className="flex h-auto flex-col items-center gap-2 p-4">
              <Link href="/dashboard/configurations">
                <Settings className="h-6 w-6" />
                <span>Manage Configurations</span>
              </Link>
            </Button>
            <Button
              asChild
              className="flex h-auto flex-col items-center gap-2 p-4"
              variant="outline"
            >
              <Link href="/dashboard/opportunities">
                <FileText className="h-6 w-6" />
                <span>View Opportunities</span>
              </Link>
            </Button>
            <Button
              asChild
              className="flex h-auto flex-col items-center gap-2 p-4"
              variant="outline"
            >
              <Link href="/dashboard/insights">
                <TrendingUp className="h-6 w-6" />
                <span>Market Insights</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
