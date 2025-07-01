-- Seed example RFP Download Configuration and steps

-- Insert configuration
INSERT INTO scrape_download_configurations (
    id, name, description, target_url, is_active, created_by
) VALUES (
    '7d1bee87-9cef-43cc-810b-297ee11f2b3e',
    'Florida RFP Download',
    'Downloads RFPs from MyFloridaMarketPlace with filters applied',
    'https://vendor.myfloridamarketplace.com/search/bids',
    true,
    '00000000-0000-0000-0000-000000000000' -- replace with a real user UUID if needed
);

-- Insert scrape download step (playwright type)
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    '8e2cfa98-0df1-54dd-921c-408ff22f3c4f',
    '7d1bee87-9cef-43cc-810b-297ee11f2b3e',
    1,
    'playwright',
    'Download RFP Data',
    'Navigate to the site and download RFP data using Playwright automation',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert scrape download step (ai_prompt type) - Step 2
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    '9f3d6b09-1ef2-45ee-832d-519ff33f4d5f',
    '7d1bee87-9cef-43cc-810b-297ee11f2b3e',
    2,
    'ai_prompt',
    'Analyze RFP Data',
    'Use AI to analyze the downloaded RFP data and identify relevant opportunities',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert playwright steps for the scrape download step
INSERT INTO playwright_steps (
    scrape_download_step_id, step_order, action_type, selector, selector_type, value, wait_time, description, created_by
) VALUES
-- 1. Go to URL
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 1, 'goto', NULL, NULL, NULL, NULL, 'Navigate to the bids page', '00000000-0000-0000-0000-000000000000'),
-- 2. Click "Ad Type" button
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 2, 'click', 'Ad Type', 'role', NULL, NULL, 'Click Ad Type button', '00000000-0000-0000-0000-000000000000'),
-- 3. Click "Request for Proposals" option
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 3, 'click', 'Request for Proposals', 'option', NULL, NULL, 'Select Request for Proposals', '00000000-0000-0000-0000-000000000000'),
-- 4. Click "Ad Status" button
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 4, 'click', 'Ad Status', 'role', NULL, NULL, 'Click Ad Status button', '00000000-0000-0000-0000-000000000000'),
-- 5. Click "PREVIEW" option
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 5, 'click', 'PREVIEW', 'option', NULL, NULL, 'Select PREVIEW status', '00000000-0000-0000-0000-000000000000'),
-- 6. Click "OPEN" option
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 6, 'click', 'OPEN', 'option', NULL, NULL, 'Select OPEN status', '00000000-0000-0000-0000-000000000000'),
-- 7. Click "Search" button
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 7, 'click', 'Search', 'role', NULL, NULL, 'Click Search button', '00000000-0000-0000-0000-000000000000'),
-- 8. Wait for download event
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 8, 'waitForDownload', NULL, NULL, NULL, NULL, 'Wait for download event', '00000000-0000-0000-0000-000000000000'),
-- 9. Click "Export to Excel" button
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 9, 'click', 'Export to Excel', 'role', NULL, NULL, 'Click Export to Excel', '00000000-0000-0000-0000-000000000000'),
-- 10. Save download as file
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 10, 'saveDownload', NULL, NULL, 'test-1.xlsx', NULL, 'Save download as test-1.xlsx', '00000000-0000-0000-0000-000000000000');

-- Insert prompt step with the specified prompt
INSERT INTO prompt_steps (
    scrape_download_step_id, prompt, storage_ids, created_by
) VALUES (
    '9f3d6b09-1ef2-45ee-832d-519ff33f4d5f',
    'Analyze this Florida Marketplace bid data and identify procurement opportunities that match our services.

Look for bids containing these keywords:
- Leadership development
- Coaching (executive, business, or organizational)
- Executive coaching
- Organizational development
- Strategy consulting
- Leadership training
- Employee development
- Executive Leadership Training
- Assessments (personality, leadership, organizational)
- Consulting services
- Staff Development

For each relevant opportunity found:
1. Extract the bid number (remove "RFP-" prefix if present)
2. Create the direct link: https://vendor.myfloridamarketplace.com/search/bids/detail/{number}

Return ONLY a JSON array of links in this exact format:
["https://vendor.myfloridamarketplace.com/search/bids/detail/12345", "https://vendor.myfloridamarketplace.com/search/bids/detail/67890"]

Do not include any other text, analysis, or formatting. Just the JSON array.',
    ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'],
    '00000000-0000-0000-0000-000000000000'
);

-- Insert fake storage objects for testing
INSERT INTO storage.objects (
    id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata
) VALUES 
('11111111-1111-1111-1111-111111111111', 'scrape-downloads', '7d1bee87-9cef-43cc-810b-297ee11f2b3e/florida-rfp-data-2024-01.xlsx', '00000000-0000-0000-0000-000000000000', now(), now(), now(), '{"size": 1024000, "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}'),
('22222222-2222-2222-2222-222222222222', 'scrape-downloads', '7d1bee87-9cef-43cc-810b-297ee11f2b3e/florida-rfp-data-2024-02.xlsx', '00000000-0000-0000-0000-000000000000', now(), now(), now(), '{"size": 2048000, "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}'),
('33333333-3333-3333-3333-333333333333', 'scrape-downloads', '7d1bee87-9cef-43cc-810b-297ee11f2b3e/florida-rfp-data-2024-03.xlsx', '00000000-0000-0000-0000-000000000000', now(), now(), now(), '{"size": 1536000, "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}');

-- Second Configuration: Example.com Scraping
-- Insert configuration
INSERT INTO scrape_download_configurations (
    id, name, description, target_url, is_active, created_by
) VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Example.com Data Collection',
    'Collects data from example.com for testing purposes',
    'https://example.com/',
    true,
    '00000000-0000-0000-0000-000000000000'
);

-- Insert first scrape download step (playwright type) - Step 1
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    '8d106cd6-84ee-4e03-80d1-b28b475d1bf5',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    1,
    'playwright',
    'Navigate to Example.com',
    'Navigate to example.com and collect basic page data',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert second scrape download step (playwright type) - Step 2
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    '68e39794-acc2-4ad4-bc3f-4b13832af482',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    2,
    'playwright',
    'Extract Page Content',
    'Extract and save page content for analysis',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert third scrape download step (ai_prompt type) - Step 3
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    'dc5c7983-da35-4699-bc36-238695f13263',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    3,
    'ai_prompt',
    'Analyze Page Content',
    'Use AI to analyze the collected page content and extract insights',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert playwright steps for the first scrape download step (one action for example.com)
INSERT INTO playwright_steps (
    scrape_download_step_id, step_order, action_type, selector, selector_type, value, wait_time, description, created_by
) VALUES
('8d106cd6-84ee-4e03-80d1-b28b475d1bf5', 1, 'goto', NULL, NULL, 'https://example.com/', NULL, 'Navigate to example.com', '00000000-0000-0000-0000-000000000000');

-- Insert playwright steps for the second scrape download step (one random action)
INSERT INTO playwright_steps (
    scrape_download_step_id, step_order, action_type, selector, selector_type, value, wait_time, description, created_by
) VALUES
('68e39794-acc2-4ad4-bc3f-4b13832af482', 1, 'screenshot', NULL, NULL, 'example-page.png', NULL, 'Take a screenshot of the page', '00000000-0000-0000-0000-000000000000');

-- Insert prompt step for the AI analysis
INSERT INTO prompt_steps (
    scrape_download_step_id, prompt, storage_ids, created_by
) VALUES (
    'dc5c7983-da35-4699-bc36-238695f13263',
    'Analyze the content from example.com and provide insights about:

1. Page structure and layout
2. Content type and purpose
3. Key information presented
4. Any notable elements or features

Return your analysis in a structured format with clear sections for each insight area.',
    ARRAY['44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555'],
    '00000000-0000-0000-0000-000000000000'
);

-- Insert additional fake storage objects for the second configuration
INSERT INTO storage.objects (
    id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata
) VALUES 
('44444444-4444-4444-4444-444444444444', 'scrape-downloads', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890/example-page-content.html', '00000000-0000-0000-0000-000000000000', now(), now(), now(), '{"size": 512000, "mimetype": "text/html"}'),
('55555555-5555-5555-5555-555555555555', 'scrape-downloads', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890/example-page-screenshot.png', '00000000-0000-0000-0000-000000000000', now(), now(), now(), '{"size": 256000, "mimetype": "image/png"}'); 