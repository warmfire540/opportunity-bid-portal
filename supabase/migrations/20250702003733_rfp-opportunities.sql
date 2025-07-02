/*
===============================================================================
                              OPPORTUNITIES TABLE
===============================================================================
*/

-- Create opportunities table to store RFP opportunities
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL, -- URL or source where the opportunity was found
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'rejected', 'in_progress', 'submitted', 'awarded')),
    bid_number TEXT, -- Government bid number if available
    agency TEXT, -- Government agency or department
    due_date TIMESTAMP WITH TIME ZONE, -- Bid submission deadline
    estimated_value DECIMAL(15,2), -- Estimated contract value
    commodity_codes TEXT[], -- Array of commodity codes
    contact_info JSONB, -- Contact information as JSON
    requirements TEXT, -- Key requirements or qualifications
    attachments TEXT[], -- Array of attachment URLs or file paths
    tags TEXT[], -- Array of tags for categorization
    -- AI analysis fields
    strategic_fit TEXT CHECK (strategic_fit IN ('low', 'medium', 'high')),
    go_no_go_decision TEXT,
    key_messaging_points JSONB, -- Array of messaging points
    risk_assessment TEXT,
    win_probability TEXT,
    required_certifications JSONB, -- Array of required certifications
    keywords JSONB, -- Array of keywords
    service_areas JSONB, -- Array of service areas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_due_date ON opportunities(due_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_by ON opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_opportunities_source ON opportunities(source);
CREATE INDEX IF NOT EXISTS idx_opportunities_strategic_fit ON opportunities(strategic_fit);
CREATE INDEX IF NOT EXISTS idx_opportunities_win_probability ON opportunities(win_probability);
CREATE INDEX IF NOT EXISTS idx_opportunities_go_no_go_decision ON opportunities(go_no_go_decision);

-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for opportunities
CREATE POLICY "Authenticated users can view all opportunities" ON opportunities
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert opportunities" ON opportunities
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update opportunities" ON opportunities
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete opportunities" ON opportunities
    FOR DELETE
    TO authenticated
    USING (true);

-- Add triggers for timestamps and user tracking
CREATE TRIGGER set_timestamps
    BEFORE INSERT OR UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_timestamps();

CREATE TRIGGER set_user_tracking
    BEFORE INSERT OR UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON opportunities TO authenticated;

/*
===============================================================================
                              MARKET INSIGHTS TABLE
===============================================================================
*/

-- Create market_insights table to store strategic market-level insights
CREATE TABLE IF NOT EXISTS market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrape_configuration_id UUID REFERENCES scrape_download_configurations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('trends', 'prioritization', 'resource_needs', 'competitive_analysis', 'market_overview')),
    title TEXT NOT NULL,
    description TEXT,
    insights JSONB NOT NULL, -- Array of insight strings
    source_data TEXT, -- Description of what data this insight was derived from
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
    actionable BOOLEAN DEFAULT true, -- Whether this insight leads to actionable recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_insights_configuration_id ON market_insights(scrape_configuration_id);
CREATE INDEX IF NOT EXISTS idx_market_insights_insight_type ON market_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_market_insights_created_by ON market_insights(created_by);
CREATE INDEX IF NOT EXISTS idx_market_insights_actionable ON market_insights(actionable);

-- Enable RLS
ALTER TABLE market_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for market insights
CREATE POLICY "Authenticated users can view all market insights" ON market_insights
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert market insights" ON market_insights
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update market insights" ON market_insights
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete market insights" ON market_insights
    FOR DELETE
    TO authenticated
    USING (true);

-- Add triggers for timestamps and user tracking
CREATE TRIGGER set_timestamps
    BEFORE INSERT OR UPDATE ON market_insights
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_timestamps();

CREATE TRIGGER set_user_tracking
    BEFORE INSERT OR UPDATE ON market_insights
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON market_insights TO authenticated;

/*
===============================================================================
                              CREATE OPPORTUNITY STEPS TABLE
===============================================================================
*/

-- Create create_opportunity_steps table to store opportunity creation configurations
CREATE TABLE IF NOT EXISTS create_opportunity_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scrape_download_step_id UUID REFERENCES scrape_download_steps(id) ON DELETE CASCADE,
    title_template TEXT NOT NULL,
    description_template TEXT,
    source_template TEXT NOT NULL,
    bid_number_field TEXT,
    agency_field TEXT,
    due_date_field TEXT,
    estimated_value_field TEXT,
    commodity_codes_field TEXT,
    contact_info_template JSONB,
    requirements_template TEXT,
    tags_template TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_create_opportunity_steps_scrape_download_step_id ON create_opportunity_steps(scrape_download_step_id);
CREATE INDEX IF NOT EXISTS idx_create_opportunity_steps_created_by ON create_opportunity_steps(created_by);

-- Enable RLS
ALTER TABLE create_opportunity_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for create opportunity steps
CREATE POLICY "Authenticated users can view all create opportunity steps" ON create_opportunity_steps
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert create opportunity steps" ON create_opportunity_steps
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update create opportunity steps" ON create_opportunity_steps
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can delete create opportunity steps" ON create_opportunity_steps
    FOR DELETE
    TO authenticated
    USING (true);

-- Add triggers for timestamps and user tracking
CREATE TRIGGER set_timestamps
    BEFORE INSERT OR UPDATE ON create_opportunity_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_timestamps();

CREATE TRIGGER set_user_tracking
    BEFORE INSERT OR UPDATE ON create_opportunity_steps
    FOR EACH ROW
    EXECUTE FUNCTION basejump.trigger_set_user_tracking();

-- Grant permissions
GRANT ALL ON create_opportunity_steps TO authenticated;