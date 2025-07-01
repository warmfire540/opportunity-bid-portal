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

-- Create scrape steps table to store Playwright actions as structured data
CREATE TABLE IF NOT EXISTS scrape_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_id UUID REFERENCES scrape_download_configurations(id) ON DELETE CASCADE,
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
    UNIQUE(configuration_id, step_order)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scrape_steps_configuration_id ON scrape_steps(configuration_id);
CREATE INDEX IF NOT EXISTS idx_scrape_steps_created_by ON scrape_steps(created_by);

-- Enable RLS
ALTER TABLE scrape_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for steps
CREATE POLICY "Authenticated users can view all scrape steps" ON scrape_steps
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert scrape steps" ON scrape_steps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update scrape steps" ON scrape_steps
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete scrape steps" ON scrape_steps
    FOR DELETE
    TO authenticated
    USING (true);

-- Add triggers for timestamps and user tracking
CREATE TRIGGER set_timestamps
    BEFORE INSERT OR UPDATE ON scrape_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_timestamps();

CREATE TRIGGER set_user_tracking
    BEFORE INSERT OR UPDATE ON scrape_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON scrape_steps TO authenticated;

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
                    'id', ss.id,
                    'step_order', ss.step_order,
                    'action_type', ss.action_type,
                    'selector', ss.selector,
                    'selector_type', ss.selector_type,
                    'value', ss.value,
                    'wait_time', ss.wait_time,
                    'description', ss.description
                ) ORDER BY ss.step_order
            ) FILTER (WHERE ss.id IS NOT NULL),
            '[]'::json
        ) as steps
    FROM scrape_download_configurations sdc
    LEFT JOIN scrape_steps ss ON sdc.id = ss.configuration_id
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