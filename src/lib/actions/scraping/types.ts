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

export type PromptStep = {
  id?: string;
  prompt: string;
  storage_ids?: string[];
};

export type ScrapeDownloadStep = {
  id?: string;
  step_order: number;
  step_type: "playwright" | "ai_prompt" | "links_analysis" | "prompt_steps";
  name: string;
  description?: string;
  sub_steps?: PlaywrightStep[]; // Only for playwright type
  prompt_data?: PromptStep[]; // Only for prompt_steps type
};

export type ScrapeConfiguration = {
  id?: string;
  name: string;
  description?: string;
  target_url: string;
  is_active?: boolean;
  steps: ScrapeDownloadStep[];
};

export type StepExecutionResult = {
  success: boolean;
  error?: string;
  storageObjectId?: string;
  downloadUrl?: string;
};

export type BrowserSession = {
  browser: any;
  page: any;
  supabase: any;
  startTime: number;
}; 