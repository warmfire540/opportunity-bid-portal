"use server";

import type { Opportunity } from "@lib/actions/scraping";
import { createClient } from "@lib/supabase/server";

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = createClient();

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error != null) {
    console.error("Error fetching opportunities:", error);
    throw new Error("Failed to fetch opportunities");
  }

  return opportunities;
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  const supabase = createClient();

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (error != null) {
    console.error("Error fetching opportunity:", error);
    throw new Error("Failed to fetch opportunity");
  }

  if (opportunity == null) {
    return null;
  }
  return opportunity;
}

export async function updateOpportunityStatus(
  id: string,
  status: Opportunity["status"]
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("opportunities").update({ status }).eq("id", id);

  if (error != null) {
    console.error("Error updating opportunity status:", error);
    throw new Error("Failed to update opportunity status");
  }
}
