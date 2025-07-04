import type { SupabaseClient } from "@supabase/supabase-js";
import type { Browser, Page } from "playwright";

export type StepType = "playwright" | "ai_prompt" | "create_opportunity";

export type PlaywrightStep = {
  id?: string;
  step_order: number;
  action_type: string;
  selector?: string;
  selector_type?: string;
  value?: string;
  wait_time?: number;
  description?: string;
};

export type AiPromptStep = {
  id?: string;
  prompt: string;
  system_prompt?: string;
};

export type CreateOpportunityStep = {
  id?: string;
  title_template: string;
  description_template?: string;
  source_template: string;
  bid_number_field?: string;
  agency_field?: string;
  due_date_field?: string;
  estimated_value_field?: string;
  commodity_codes_field?: string;
  contact_info_template?: Record<string, unknown>;
  requirements_template?: string;
  tags_template?: string[];
};

export type Opportunity = {
  id?: string;
  title: string;
  description?: string;
  source: string;
  status: "new" | "rejected" | "in_progress" | "submitted" | "awarded";
  bid_number?: string;
  agency?: string;
  due_date?: Date;
  estimated_value?: number;
  commodity_codes?: string[];
  contact_info?: Record<string, unknown>;
  requirements?: string;
  attachments?: string[];
  tags?: string[];
  // AI analysis fields
  strategic_fit?: "low" | "medium" | "high";
  go_no_go_decision?: string;
  key_messaging_points?: string[];
  risk_assessment?: string;
  win_probability?: string;
  required_certifications?: string[];
  keywords?: string[];
  service_areas?: string[];
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
};

export type MarketInsight = {
  id?: string;
  scrape_configuration_id?: string;
  insight_type:
    | "trends"
    | "prioritization"
    | "resource_needs"
    | "competitive_analysis"
    | "market_overview";
  insight_text: string; // Individual insight string
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
  updated_by?: string;
};

export type ScrapeDownloadStep = {
  id?: string;
  step_order: number;
  step_type: StepType;
  name: string;
  description?: string;
  sub_steps?: PlaywrightStep[]; // Only for playwright type

  ai_prompt_data?: AiPromptStep[]; // Only for ai_prompt type

  create_opportunity_data?: CreateOpportunityStep[]; // Only for create_opportunity type
};

export type ScrapeConfiguration = {
  id?: string;
  name: string;
  description?: string;
  target_url: string;
  is_active?: boolean;
  account_id?: string;
  steps: ScrapeDownloadStep[];
};

// New type to represent text content from a single page
export type PageTextContent = {
  pageId?: string; // Optional identifier for the page (URL, ID, etc.)
  content: string[]; // Multiple pieces of content from the same page
};

export type StepExecutionResult = {
  success: boolean;
  error?: string;
  storageObjectId?: string;
  downloadUrl?: string;
  downloadPath?: string;
  aiResponse?: string;
  pageTextContent?: PageTextContent[]; // Array of page content, each page can have multiple content pieces
  urlArray?: string[]; // Array of URLs from AI step
  opportunities?: Opportunity[]; // Array of created opportunities
  opportunityCount?: number; // Number of opportunities created
  marketInsights?: MarketInsight[]; // Array of market insights
  typedAiResponse?: TypedAiResponse; // New typed AI response structure
};

// New type for type-aware AI responses
export type TypedAiResponse = {
  type: "url" | "id";
  values: string[];
};

export type BrowserSession = {
  browser: Browser;
  page: Page;
  supabase: SupabaseClient;
  startTime: number;
  previousStepResults?: StepExecutionResult[];
};

export type ScrapeResult = {
  completed: boolean;
  success: boolean;
  downloadPath?: string;
  downloadUrl?: string;
  executionTimeMs?: number;
  stepsExecuted?: number;
  error?: string;
  stepResults?: StepExecutionResponse[];
};

export type StepExecutionResponse = {
  success: boolean;
  error?: string;
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  downloadUrl?: string;
  stepName?: string;
  result?: StepExecutionResult;
};

export type StartExecutionResponse = {
  success: boolean;
  error?: string;
  sessionId: string;
  totalSteps: number;
};

export type CleanupSessionResponse = {
  success: boolean;
  error?: string;
};
