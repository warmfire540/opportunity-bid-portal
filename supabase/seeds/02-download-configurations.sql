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

-- Insert steps for the configuration
INSERT INTO scrape_steps (
    configuration_id, step_order, action_type, selector, selector_type, value, wait_time, description, created_by
) VALUES
-- 1. Go to URL
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 1, 'goto', NULL, NULL, NULL, NULL, 'Navigate to the bids page', '00000000-0000-0000-0000-000000000000'),
-- 2. Click "Ad Type" button
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 2, 'click', 'Ad Type', 'role', NULL, NULL, 'Click Ad Type button', '00000000-0000-0000-0000-000000000000'),
-- 3. Click "Request for Proposals" option
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 3, 'click', 'Request for Proposals', 'option', NULL, NULL, 'Select Request for Proposals', '00000000-0000-0000-0000-000000000000'),
-- 4. Click "Ad Status" button
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 4, 'click', 'Ad Status', 'role', NULL, NULL, 'Click Ad Status button', '00000000-0000-0000-0000-000000000000'),
-- 5. Click "PREVIEW" option
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 5, 'click', 'PREVIEW', 'option', NULL, NULL, 'Select PREVIEW status', '00000000-0000-0000-0000-000000000000'),
-- 6. Click "OPEN" option
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 6, 'click', 'OPEN', 'option', NULL, NULL, 'Select OPEN status', '00000000-0000-0000-0000-000000000000'),
-- 7. Click "Search" button
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 7, 'click', 'Search', 'role', NULL, NULL, 'Click Search button', '00000000-0000-0000-0000-000000000000'),
-- 8. Wait for download event
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 8, 'waitForDownload', NULL, NULL, NULL, NULL, 'Wait for download event', '00000000-0000-0000-0000-000000000000'),
-- 9. Click "Export to Excel" button
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 9, 'click', 'Export to Excel', 'role', NULL, NULL, 'Click Export to Excel', '00000000-0000-0000-0000-000000000000'),
-- 10. Save download as file
('7d1bee87-9cef-43cc-810b-297ee11f2b3e', 10, 'saveDownload', NULL, NULL, 'test-1.xlsx', NULL, 'Save download as test-1.xlsx', '00000000-0000-0000-0000-000000000000'); 