"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@lib/supabase/server";

export type ScrapeStep = {
  id?: string;
  step_order: number;
  action_type: string;
  selector?: string;
  selector_type?: string;
  value?: string;
  wait_time?: number;
  description?: string;
};

export type ScrapeConfiguration = {
  id?: string;
  name: string;
  description?: string;
  target_url: string;
  is_active?: boolean;
  steps: ScrapeStep[];
};

export async function getScrapeConfigurations() {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_scrape_configurations_with_steps");

  if (error) {
    throw new Error(`Failed to fetch configurations: ${error.message}`);
  }

  return data;
}

export async function createScrapeConfiguration(configuration: ScrapeConfiguration) {
  const supabase = createClient();

  // Insert the configuration
  const { data: configData, error: configError } = await supabase
    .from("scrape_download_configurations")
    .insert({
      name: configuration.name,
      description: configuration.description,
      target_url: configuration.target_url,
      is_active: configuration.is_active ?? true,
    })
    .select()
    .single();

  if (configError) {
    throw new Error(`Failed to create configuration: ${configError.message}`);
  }

  // Insert the steps if any
  if (configuration.steps.length > 0) {
    const stepsToInsert = configuration.steps.map((step) => ({
      configuration_id: configData.id,
      step_order: step.step_order,
      action_type: step.action_type,
      selector: step.selector,
      selector_type: step.selector_type,
      value: step.value,
      wait_time: step.wait_time,
      description: step.description,
    }));

    const { error: stepsError } = await supabase.from("scrape_steps").insert(stepsToInsert);

    if (stepsError) {
      throw new Error(`Failed to create steps: ${stepsError.message}`);
    }
  }

  revalidatePath("/dashboard");
  return configData;
}

export async function updateScrapeConfiguration(id: string, configuration: ScrapeConfiguration) {
  const supabase = createClient();

  // Update the configuration
  const { error: configError } = await supabase
    .from("scrape_download_configurations")
    .update({
      name: configuration.name,
      description: configuration.description,
      target_url: configuration.target_url,
      is_active: configuration.is_active,
    })
    .eq("id", id);

  if (configError) {
    throw new Error(`Failed to update configuration: ${configError.message}`);
  }

  // Delete existing steps
  const { error: deleteError } = await supabase
    .from("scrape_steps")
    .delete()
    .eq("configuration_id", id);

  if (deleteError) {
    throw new Error(`Failed to delete existing steps: ${deleteError.message}`);
  }

  // Insert new steps
  if (configuration.steps.length > 0) {
    const stepsToInsert = configuration.steps.map((step) => ({
      configuration_id: id,
      step_order: step.step_order,
      action_type: step.action_type,
      selector: step.selector,
      selector_type: step.selector_type,
      value: step.value,
      wait_time: step.wait_time,
      description: step.description,
    }));

    const { error: stepsError } = await supabase.from("scrape_steps").insert(stepsToInsert);

    if (stepsError) {
      throw new Error(`Failed to update steps: ${stepsError.message}`);
    }
  }

  revalidatePath("/dashboard");
}

export async function deleteScrapeConfiguration(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("scrape_download_configurations").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete configuration: ${error.message}`);
  }

  revalidatePath("/dashboard");
}

export async function toggleScrapeConfiguration(id: string, isActive: boolean) {
  const supabase = createClient();

  const { error } = await supabase
    .from("scrape_download_configurations")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle configuration: ${error.message}`);
  }

  revalidatePath("/dashboard");
}

export async function getScrapeConfiguration(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("get_scrape_configurations_with_steps");

  if (error) {
    throw new Error(`Failed to fetch configurations: ${error.message}`);
  }

  const configuration = data?.find((config: any) => config.id === id);
  
  if (!configuration) {
    throw new Error(`Configuration with id ${id} not found`);
  }

  return configuration;
}

export async function toggleScrapeConfigurationAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const isActive = formData.get("isActive") === "true";
  await toggleScrapeConfiguration(id, isActive);
}

export async function deleteScrapeConfigurationAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deleteScrapeConfiguration(id);
}
