/*
===============================================================================
                    RFP SCRAPE DOWNLOAD CONFIGURATIONS
===============================================================================
This migration creates the complete schema for RFP scraping and download
configurations, including:
- Main configuration tables
- Step management (playwright, prompt_steps, ai_prompt, create_opportunity)
- Storage configuration
- Functions for data retrieval
===============================================================================
*/

/*
===============================================================================
                              MAIN TABLES
===============================================================================
*/

-- Create scrape download configurations table
CREATE TABLE IF NOT EXISTS scrape_download_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    target_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scrape_download_configurations_created_by ON scrape_download_configurations(created_by);

-- Enable RLS
ALTER TABLE scrape_download_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view all scrape download configurations" ON scrape_download_configurations
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert scrape download configurations" ON scrape_download_configurations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update scrape download configurations" ON scrape_download_configurations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete scrape download configurations" ON scrape_download_configurations
    FOR DELETE
    TO authenticated
    USING (true);

-- Add triggers for timestamps and user tracking
CREATE TRIGGER set_timestamps
    BEFORE INSERT OR UPDATE ON scrape_download_configurations
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_timestamps();

CREATE TRIGGER set_user_tracking
    BEFORE INSERT OR UPDATE ON scrape_download_configurations
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON scrape_download_configurations TO authenticated;

-- Create scrape download steps table to store different types of steps
CREATE TABLE IF NOT EXISTS scrape_download_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID REFERENCES scrape_download_configurations(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN ('playwright', 'ai_prompt', 'create_opportunity')),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(configuration_id, step_order)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scrape_download_steps_configuration_id ON scrape_download_steps(configuration_id);
CREATE INDEX IF NOT EXISTS idx_scrape_download_steps_created_by ON scrape_download_steps(created_by);

-- Enable RLS
ALTER TABLE scrape_download_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for scrape download steps
CREATE POLICY "Authenticated users can view all scrape download steps" ON scrape_download_steps
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert scrape download steps" ON scrape_download_steps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update scrape download steps" ON scrape_download_steps
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete scrape download steps" ON scrape_download_steps
    FOR DELETE
    TO authenticated
    USING (true);

-- Add triggers for timestamps and user tracking
CREATE TRIGGER set_timestamps
    BEFORE INSERT OR UPDATE ON scrape_download_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_timestamps();

CREATE TRIGGER set_user_tracking
    BEFORE INSERT OR UPDATE ON scrape_download_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON scrape_download_steps TO authenticated;

/*
===============================================================================
                              PLAYWRIGHT STEPS TABLE
===============================================================================
*/

-- Create playwright steps table to store Playwright actions as structured data
CREATE TABLE IF NOT EXISTS playwright_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrape_download_step_id UUID REFERENCES scrape_download_steps(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    action_type TEXT NOT NULL, -- 'click', 'type', 'wait', 'select', 'download', etc.
    selector TEXT, -- CSS selector, role, text, etc.
    selector_type TEXT, -- 'css', 'role', 'text', 'xpath', etc.
    value TEXT, -- text to type, option to select, etc.
    wait_time INTEGER, -- milliseconds to wait
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(scrape_download_step_id, step_order)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_playwright_steps_scrape_download_step_id ON playwright_steps(scrape_download_step_id);
CREATE INDEX IF NOT EXISTS idx_playwright_steps_created_by ON playwright_steps(created_by);

-- Enable RLS
ALTER TABLE playwright_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for playwright steps
CREATE POLICY "Authenticated users can view all playwright steps" ON playwright_steps
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert playwright steps" ON playwright_steps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update playwright steps" ON playwright_steps
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete playwright steps" ON playwright_steps
    FOR DELETE
    TO authenticated
    USING (true);

-- Add triggers for timestamps and user tracking
CREATE TRIGGER set_timestamps
    BEFORE INSERT OR UPDATE ON playwright_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_timestamps();

CREATE TRIGGER set_user_tracking
    BEFORE INSERT OR UPDATE ON playwright_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON playwright_steps TO authenticated;

/*
===============================================================================
                              PROMPT STEPS TABLE
===============================================================================
*/

-- Create prompt_steps table to store AI prompt configurations
CREATE TABLE IF NOT EXISTS prompt_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrape_download_step_id UUID REFERENCES scrape_download_steps(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    system_prompt TEXT, -- System instructions for AI behavior
    storage_ids TEXT[], -- Array of storage object IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompt_steps_scrape_download_step_id ON prompt_steps(scrape_download_step_id);
CREATE INDEX IF NOT EXISTS idx_prompt_steps_created_by ON prompt_steps(created_by);

-- Enable RLS
ALTER TABLE prompt_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prompt steps
CREATE POLICY "Authenticated users can view all prompt steps" ON prompt_steps
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert prompt steps" ON prompt_steps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update prompt steps" ON prompt_steps
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete prompt steps" ON prompt_steps
    FOR DELETE
    TO authenticated
    USING (true);

-- Add triggers for timestamps and user tracking
CREATE TRIGGER set_timestamps
    BEFORE INSERT OR UPDATE ON prompt_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_timestamps();

CREATE TRIGGER set_user_tracking
    BEFORE INSERT OR UPDATE ON prompt_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON prompt_steps TO authenticated;

/*
===============================================================================
                              FUNCTIONS
===============================================================================
*/

-- Create a function to get configurations with their steps
CREATE OR REPLACE FUNCTION get_scrape_configurations_with_steps()
    RETURNS TABLE (
        id UUID,
        name TEXT,
        description TEXT,
        target_url TEXT,
        is_active BOOLEAN,
        created_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE,
        steps JSON
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sdc.id,
        sdc.name,
        sdc.description,
        sdc.target_url,
        sdc.is_active,
        sdc.created_at,
        sdc.updated_at,
        COALESCE(
            json_agg(
                json_build_object(
                    'id', sds.id,
                    'step_order', sds.step_order,
                    'step_type', sds.step_type,
                    'name', sds.name,
                    'description', sds.description,
                    'sub_steps', CASE 
                        WHEN sds.step_type = 'playwright' THEN (
                            SELECT json_agg(
                                json_build_object(
                                    'id', ps.id,
                                    'step_order', ps.step_order,
                                    'action_type', ps.action_type,
                                    'selector', ps.selector,
                                    'selector_type', ps.selector_type,
                                    'value', ps.value,
                                    'wait_time', ps.wait_time,
                                    'description', ps.description
                                ) ORDER BY ps.step_order
                            ) FROM playwright_steps ps WHERE ps.scrape_download_step_id = sds.id
                        )
                        ELSE NULL
                    END,
                    'ai_prompt_data', CASE 
                        WHEN sds.step_type = 'ai_prompt' THEN (
                            SELECT json_agg(
                                json_build_object(
                                    'id', prs.id,
                                    'prompt', prs.prompt,
                                    'system_prompt', prs.system_prompt,
                                    'storage_ids', prs.storage_ids
                                )
                            ) FROM prompt_steps prs WHERE prs.scrape_download_step_id = sds.id
                        )
                        ELSE NULL
                    END,
                    'create_opportunity_data', CASE 
                        WHEN sds.step_type = 'create_opportunity' THEN (
                            SELECT json_agg(
                                json_build_object(
                                    'id', cos.id,
                                    'title_template', cos.title_template,
                                    'description_template', cos.description_template,
                                    'source_template', cos.source_template,
                                    'bid_number_field', cos.bid_number_field,
                                    'agency_field', cos.agency_field,
                                    'due_date_field', cos.due_date_field,
                                    'estimated_value_field', cos.estimated_value_field,
                                    'commodity_codes_field', cos.commodity_codes_field,
                                    'contact_info_template', cos.contact_info_template,
                                    'requirements_template', cos.requirements_template,
                                    'tags_template', cos.tags_template
                                )
                            ) FROM create_opportunity_steps cos WHERE cos.scrape_download_step_id = sds.id
                        )
                        ELSE NULL
                    END
                ) ORDER BY sds.step_order
            ) FILTER (WHERE sds.id IS NOT NULL),
            '[]'::json
        ) as steps
    FROM scrape_download_configurations sdc
    LEFT JOIN scrape_download_steps sds ON sdc.id = sds.configuration_id
    GROUP BY sdc.id, sdc.name, sdc.description, sdc.target_url, sdc.is_active, sdc.created_at, sdc.updated_at
    ORDER BY sdc.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_scrape_configurations_with_steps() TO authenticated; 

/*
===============================================================================
                              STORAGE CONFIGURATION
===============================================================================
*/

-- Create storage bucket for receipts
insert into storage.buckets (id, name, public)
values ('scrape-downloads', 'scrape-downloads', false);

-- Create policy to allow users to upload scrape downloads
CREATE POLICY "Users can upload scrape downloads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'scrape-downloads' 
);

-- Create policy to allow users to view scrape downloads
CREATE POLICY "Users can view scrape downloads"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'scrape-downloads' );
