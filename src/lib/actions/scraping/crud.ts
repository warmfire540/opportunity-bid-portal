"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@lib/supabase/server";
import type { ScrapeConfiguration } from "./types";

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

  // Insert the scrape download steps if any
  if (configuration.steps.length > 0) {
    for (const step of configuration.steps) {
      const { data: stepData, error: stepError } = await supabase
        .from("scrape_download_steps")
        .insert({
          configuration_id: configData.id,
          step_order: step.step_order,
          step_type: step.step_type,
          name: step.name,
          description: step.description,
        })
        .select()
        .single();

      if (stepError) {
        throw new Error(`Failed to create scrape download step: ${stepError.message}`);
      }

      // Insert playwright sub-steps if this is a playwright step
      if (step.step_type === "playwright" && step.sub_steps && step.sub_steps.length > 0) {
        const playwrightStepsToInsert = step.sub_steps.map((subStep) => ({
          scrape_download_step_id: stepData.id,
          step_order: subStep.step_order,
          action_type: subStep.action_type,
          selector: subStep.selector,
          selector_type: subStep.selector_type,
          value: subStep.value,
          wait_time: subStep.wait_time,
          description: subStep.description,
        }));

        const { error: playwrightStepsError } = await supabase
          .from("playwright_steps")
          .insert(playwrightStepsToInsert);

        if (playwrightStepsError) {
          throw new Error(`Failed to create playwright steps: ${playwrightStepsError.message}`);
        }
      }

      // Insert prompt steps if this is a prompt_steps step
      if (step.step_type === "prompt_steps" && step.prompt_data && step.prompt_data.length > 0) {
        const promptStepsToInsert = step.prompt_data.map((promptStep) => ({
          scrape_download_step_id: stepData.id,
          prompt: promptStep.prompt,
          storage_ids: promptStep.storage_ids ?? [],
        }));

        const { error: promptStepsError } = await supabase
          .from("prompt_steps")
          .insert(promptStepsToInsert);

        if (promptStepsError) {
          throw new Error(`Failed to create prompt steps: ${promptStepsError.message}`);
        }
      }
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

  // Delete existing scrape download steps (this will cascade delete playwright steps)
  const { error: deleteError } = await supabase
    .from("scrape_download_steps")
    .delete()
    .eq("configuration_id", id);

  if (deleteError) {
    throw new Error(`Failed to delete existing steps: ${deleteError.message}`);
  }

  // Insert new scrape download steps
  if (configuration.steps.length > 0) {
    for (const step of configuration.steps) {
      const { data: stepData, error: stepError } = await supabase
        .from("scrape_download_steps")
        .insert({
          configuration_id: id,
          step_order: step.step_order,
          step_type: step.step_type,
          name: step.name,
          description: step.description,
        })
        .select()
        .single();

      if (stepError) {
        throw new Error(`Failed to create scrape download step: ${stepError.message}`);
      }

      // Insert playwright sub-steps if this is a playwright step
      if (step.step_type === "playwright" && step.sub_steps && step.sub_steps.length > 0) {
        const playwrightStepsToInsert = step.sub_steps.map((subStep) => ({
          scrape_download_step_id: stepData.id,
          step_order: subStep.step_order,
          action_type: subStep.action_type,
          selector: subStep.selector,
          selector_type: subStep.selector_type,
          value: subStep.value,
          wait_time: subStep.wait_time,
          description: subStep.description,
        }));

        const { error: playwrightStepsError } = await supabase
          .from("playwright_steps")
          .insert(playwrightStepsToInsert);

        if (playwrightStepsError) {
          throw new Error(`Failed to create playwright steps: ${playwrightStepsError.message}`);
        }
      }

      // Insert prompt steps if this is a prompt_steps step
      if (step.step_type === "prompt_steps" && step.prompt_data && step.prompt_data.length > 0) {
        const promptStepsToInsert = step.prompt_data.map((promptStep) => ({
          scrape_download_step_id: stepData.id,
          prompt: promptStep.prompt,
          storage_ids: promptStep.storage_ids ?? [],
        }));

        const { error: promptStepsError } = await supabase
          .from("prompt_steps")
          .insert(promptStepsToInsert);

        if (promptStepsError) {
          throw new Error(`Failed to create prompt steps: ${promptStepsError.message}`);
        }
      }
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

// Form action wrappers
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