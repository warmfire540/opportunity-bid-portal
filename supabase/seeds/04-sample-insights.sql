-- Seed sample market insights data using the new schema
-- Each insight is stored as a separate row with insight_type and insight_text

-- Florida configuration ID (from the scrape_download_configurations table)
-- This should match the actual Florida configuration ID from your database
-- For now using a placeholder - replace with actual ID when available
DO $$
DECLARE
    florida_config_id UUID := '7d1bee87-9cef-43cc-810b-297ee11f2b3e'; -- Florida config ID
BEGIN

-- Insert trends insights
INSERT INTO market_insights (
    scrape_configuration_id, insight_type, insight_text, created_by, created_at
) VALUES 
    (florida_config_id, 'trends', 'Increasing demand for leadership development programs within government agencies.', '00000000-0000-0000-0000-000000000000', NOW()),
    (florida_config_id, 'trends', 'Focus on measurable behavioral outcomes from training initiatives.', '00000000-0000-0000-0000-000000000000', NOW()),
    (florida_config_id, 'trends', 'Need for tailored training solutions to address specific departmental challenges.', '00000000-0000-0000-0000-000000000000', NOW());

-- Insert prioritization insights
INSERT INTO market_insights (
    scrape_configuration_id, insight_type, insight_text, created_by, created_at
) VALUES 
    (florida_config_id, 'prioritization', 'Prioritize opportunities that align with our core competencies in leadership and organizational development.', '00000000-0000-0000-0000-000000000000', NOW()),
    (florida_config_id, 'prioritization', 'Focus on agencies with recurring needs for development and training services.', '00000000-0000-0000-0000-000000000000', NOW());

-- Insert resource needs insights
INSERT INTO market_insights (
    scrape_configuration_id, insight_type, insight_text, created_by, created_at
) VALUES 
    (florida_config_id, 'resource_needs', 'Expand capabilities in behavioral outcome measurement and assessment.', '00000000-0000-0000-0000-000000000000', NOW()),
    (florida_config_id, 'resource_needs', 'Enhance our team with certified trainers and coaches specialized in government requirements.', '00000000-0000-0000-0000-000000000000', NOW());

-- Insert competitive analysis insights
INSERT INTO market_insights (
    scrape_configuration_id, insight_type, insight_text, created_by, created_at
) VALUES 
    (florida_config_id, 'competitive_analysis', 'Limited expertise in organizational change management among current government contractors.', '00000000-0000-0000-0000-000000000000', NOW()),
    (florida_config_id, 'competitive_analysis', 'Most competitors focus on basic training rather than strategic leadership development.', '00000000-0000-0000-0000-000000000000', NOW());

-- Insert market overview insights
INSERT INTO market_insights (
    scrape_configuration_id, insight_type, insight_text, created_by, created_at
) VALUES 
    (florida_config_id, 'market_overview', 'Growing emphasis on measurable leadership outcomes and ROI in government training programs.', '00000000-0000-0000-0000-000000000000', NOW()),
    (florida_config_id, 'market_overview', 'Shift toward evidence-based leadership development approaches in public sector.', '00000000-0000-0000-0000-000000000000', NOW());
END $$;