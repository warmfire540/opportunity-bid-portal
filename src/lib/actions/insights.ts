"use server";

import { createClient } from "@lib/supabase/server";

import type { MarketInsight } from "./scraping/types";

export async function getMarketInsights(): Promise<MarketInsight[]> {
  const supabase = createClient();

  const { data: insights, error } = await supabase
    .from("market_insights")
    .select("*")
    .order("created_at", { ascending: false });

  if (error != null) {
    console.error("Error fetching market insights:", error);
    throw new Error("Failed to fetch market insights");
  }

  return insights;
}
