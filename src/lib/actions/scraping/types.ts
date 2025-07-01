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
};

export type ScrapeDownloadStep = {
  id?: string;
  step_order: number;
  step_type: "playwright" | "ai_prompt" | "links_analysis";
  name: string;
  description?: string;
  sub_steps?: PlaywrightStep[]; // Only for playwright type

  ai_prompt_data?: AiPromptStep[]; // Only for ai_prompt type
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
  downloadPath?: string;
  aiResponse?: string;
};

export type BrowserSession = {
  browser: any;
  page: any;
  supabase: any;
  startTime: number;
  previousStepResults?: StepExecutionResult[];
};
