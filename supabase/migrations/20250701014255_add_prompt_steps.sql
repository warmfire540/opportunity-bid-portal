-- Add prompt_steps to the step_type constraint
ALTER TABLE scrape_download_steps 
DROP CONSTRAINT IF EXISTS scrape_download_steps_step_type_check;

ALTER TABLE scrape_download_steps 
ADD CONSTRAINT scrape_download_steps_step_type_check 
CHECK (step_type IN ('playwright', 'ai_prompt', 'links_analysis', 'prompt_steps'));

-- Create prompt_steps table to store AI prompt configurations
CREATE TABLE IF NOT EXISTS prompt_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrape_download_step_id UUID REFERENCES scrape_download_steps(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
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

-- Update the get_scrape_configurations_with_steps function to include prompt_steps
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
                        WHEN sds.step_type = 'prompt_steps' THEN (
                            SELECT json_agg(
                                json_build_object(
                                    'id', prs.id,
                                    'prompt', prs.prompt,
                                    'storage_ids', prs.storage_ids
                                )
                            ) FROM prompt_steps prs WHERE prs.scrape_download_step_id = sds.id
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