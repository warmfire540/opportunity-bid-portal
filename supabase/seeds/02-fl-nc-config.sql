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

-- Insert scrape download step (playwright type) - Step 3 (Text Extraction)
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    'b7e2cfa9-0df1-54dd-921c-408ff22f3c4f',
    '7d1bee87-9cef-43cc-810b-297ee11f2b3e',
    3,
    'playwright',
    'Extract Bid Details',
    'Extract bid header, inquiry details, description, and commodity codes from each bid page',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert scrape download step (ai_prompt type) - Step 4 (AI Analysis of Text Content)
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    'c8f3d7b0-1ef2-45ee-832d-519ff33f4d5f',
    '7d1bee87-9cef-43cc-810b-297ee11f2b3e',
    4,
    'ai_prompt',
    'Analyze Extracted Bid Content',
    'Use AI to analyze the extracted bid details and identify key opportunities',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert playwright steps for the scrape download step
INSERT INTO playwright_steps (
    scrape_download_step_id, step_order, action_type, selector, selector_type, value, wait_time, description, created_by
) VALUES
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 1, 'goto', NULL, NULL, NULL, NULL, 'Navigate to the bids page', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 2, 'click', 'button', 'role', 'Ad Type', NULL, 'Click Ad Type button', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 3, 'click', 'option', 'role', 'Request for Proposals', NULL, 'Select Request for Proposals', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 4, 'click', 'button', 'role', 'Ad Status', NULL, 'Click Ad Status button', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 5, 'click', 'option', 'role', 'PREVIEW', NULL, 'Select PREVIEW status', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 6, 'click', 'option', 'role', 'OPEN', NULL, 'Select OPEN status', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 7, 'click', 'button', 'role', 'Search', NULL, 'Click Search button', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 8, 'waitForDownload', NULL, NULL, NULL, NULL, 'Wait for download event', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 9, 'click', 'button',  'role', 'Export to Excel', NULL, 'Click Export to Excel', '00000000-0000-0000-0000-000000000000'),
('8e2cfa98-0df1-54dd-921c-408ff22f3c4f', 10, 'saveDownload', NULL, NULL, NULL, NULL, 'Save download excel file', '00000000-0000-0000-0000-000000000000');

-- Insert prompt step with the specified prompt
INSERT INTO prompt_steps (
    scrape_download_step_id, prompt, system_prompt, storage_ids, created_by
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
- Staff Development',
    'IMPORTANT: Respond with pure JavaScript code only. Do not include any markdown formatting, code blocks, or explanatory text. Return only the JavaScript code that can be directly executed. You must return a valid JSON object with type and values fields.
    
For each relevant opportunity found:
1. Extract the bid number (remove "RFP-" prefix if present)
2. Create the direct link: https://vendor.myfloridamarketplace.com/search/bids/detail/{number}

Return ONLY a JSON object in this exact format:
{
  "type": "url",
  "values": ["https://vendor.myfloridamarketplace.com/search/bids/detail/12345", "https://vendor.myfloridamarketplace.com/search/bids/detail/67890"]
}

Do not include any other text, analysis, or formatting. Just the JSON object.',
    ARRAY['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'],
    '00000000-0000-0000-0000-000000000000'
);

-- Insert prompt step for Step 4 (AI Analysis of Text Content)
INSERT INTO prompt_steps (
    scrape_download_step_id, prompt, system_prompt, storage_ids, created_by
) VALUES (
    'c8f3d7b0-1ef2-45ee-832d-519ff33f4d5f',
    'As a CEO of a leadership development and consulting company, analyze this Request for Proposal and provide strategic insights for our bidding approach:

## BIDDING STRATEGY ANALYSIS

For the RFP, evaluate:

**1. Strategic Fit Assessment**
- How well does this RFP align with our core leadership development services?
- Which of our key service areas (executive coaching, team development, organizational change, strategic planning) are most relevant?
- What is the potential for long-term relationship building vs. one-time project?

**2. Competitive Positioning**
- What unique value propositions should we emphasize?
- How can we differentiate from typical government contractors?
- What leadership expertise gaps might exist in the current vendor pool?

**3. Keyword & Requirements Alignment**
- Identify leadership-related keywords and requirements that match our expertise
- Highlight any specific leadership competencies, certifications, or methodologies mentioned
- Note any organizational development, change management, or strategic planning elements

**4. Bidding Recommendations**
- Recommended approach: Full bid, joint venture, or pass?
- Key differentiators to emphasize in our proposal
- Potential partners or subcontractors to consider
- Risk factors and mitigation strategies

**5. Resource & Timeline Assessment**
- Estimated effort level (Low/Medium/High) and why
- Key personnel needed for successful delivery
- Timeline feasibility and potential conflicts
- Required certifications or qualifications

## OVERALL STRATEGIC INSIGHTS

- **Market Trends**: What patterns emerge about leadership development needs in Florida government?
- **Opportunity Prioritization**: Rank these RFPs by strategic value and win probability
- **Resource Planning**: What capabilities should we develop or strengthen?
- **Relationship Building**: Which agencies show recurring leadership development needs?

## ACTIONABLE RECOMMENDATIONS

For each RFP, provide:
- **Go/No-Go Decision** with clear rationale
- **3-5 Key Messaging Points** for our proposal
- **Risk Assessment** (Low/Medium/High) with specific concerns
- **Estimated Win Probability** (Low/Medium/High) with reasoning

Focus on insights that help us make strategic decisions about where to invest our bidding resources and how to position ourselves as the premier leadership development partner for Florida government agencies.',
    'IMPORTANT: You must return your analysis in a specific JSON format that can be used to create opportunities. Return ONLY valid JSON with the following structure:

{
  "opportunities": [
    {
      "bidNumber": "string - The bid/RFP number",
      "title": "string - The title of the RFP",
      "agency": "string - The government agency issuing the RFP",
      "description": "string - Brief description of the opportunity",
      "strategicFit": "string - Low/Medium/High - How well it aligns with our services",
      "goNoGoDecision": "string - Go/No-Go with brief rationale",
      "keyMessagingPoints": ["string", "string", "string"] - Array of 3-5 key points for our proposal,
      "riskAssessment": "string - Low/Medium/High with specific concerns",
      "winProbability": "string - Low/Medium/High with reasoning",
      "estimatedValue": "string - Estimated contract value if available",
      "deadline": "string - Submission deadline if available",
      "requiredCertifications": ["string"] - Array of required certifications or qualifications,
      "keywords": ["string"] - Array of relevant keywords found in the RFP,
      "serviceAreas": ["string"] - Array of our service areas that match this opportunity
    }
  ],
  "marketInsights": {
    "trends": ["string"] - Array of market trends identified (e.g., "Increasing demand for leadership development in government agencies"),
    "prioritization": ["string"] - Array of recommendations for opportunity prioritization (e.g., "Focus on agencies with recurring training needs"),
    "resourceNeeds": ["string"] - Array of capabilities we should develop (e.g., "Need for certified leadership assessment tools"),
    "competitiveAnalysis": ["string"] - Array of competitive insights (e.g., "Limited expertise in organizational change management among competitors"),
    "marketOverview": ["string"] - Array of market overview insights (e.g., "Growing emphasis on measurable leadership outcomes")
  }
}

Note: For marketInsights, you do not need to be exhaustive or find insights for every category. Generate insights naturally based on the content provided. Focus on the most relevant and actionable insights that emerge from your analysis.

Do not include any markdown formatting, explanatory text, or code blocks. Return only the JSON object.',
    NULL,
    '00000000-0000-0000-0000-000000000000'
);

-- Insert opportunity creation step (Step 5) for the first configuration
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    'ef0ed781-3438-4ea9-b549-ddf5f397e5f3',
    '7d1bee87-9cef-43cc-810b-297ee11f2b3e',
    5,
    'create_opportunity',
    'Create Opportunities & Market Insights',
    'Parse AI response and create opportunities and market insights in the database',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert create opportunity step configuration
INSERT INTO create_opportunity_steps (
    scrape_download_step_id, title_template, description_template, source_template, 
    bid_number_field, agency_field, due_date_field, estimated_value_field,
    commodity_codes_field, requirements_template, tags_template, created_by
) VALUES (
    'ef0ed781-3438-4ea9-b549-ddf5f397e5f3',
    '{{title}}',
    '{{description}}',
    'https://vendor.myfloridamarketplace.com/search/bids/detail/{{bidNumber}}',
    'bidNumber',
    'agency',
    'deadline',
    'estimatedValue',
    'commodityCodes',
    'strategicFit',
    ARRAY['leadership', 'development', 'consulting'],
    '00000000-0000-0000-0000-000000000000'
);

-- Insert playwright steps for text extraction (getInnerText action)
INSERT INTO playwright_steps (
    scrape_download_step_id, step_order, action_type, selector, selector_type, value, wait_time, description, created_by
) VALUES
('b7e2cfa9-0df1-54dd-921c-408ff22f3c4f', 1, 'goto', NULL, NULL, '{url}', NULL, 'Navigate to bid detail page using dynamic URL', '00000000-0000-0000-0000-000000000000'),
('b7e2cfa9-0df1-54dd-921c-408ff22f3c4f', 2, 'getInnerText', 'body', 'page', NULL, NULL, 'Extract all text from the bid detail page', '00000000-0000-0000-0000-000000000000');

-- ===============================================================================
-- NORTH CAROLINA ELECTRONIC VENDOR PORTAL CONFIGURATION
-- ===============================================================================

-- Insert North Carolina configuration
INSERT INTO scrape_download_configurations (
    id, name, description, target_url, is_active, created_by
) VALUES (
    '92349122-9870-4657-8c6e-d29826c532fc',
    'North Carolina RFP Download',
    'Downloads RFPs from the North Carolina Electronic Vendor Portal',
    'https://evp.nc.gov/solicitations/',
    true,
    '00000000-0000-0000-0000-000000000000'
);

-- Insert scrape download step (playwright type) - Step 1
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    'd9ed4ae2-dcd5-4b8d-a82b-7e90e2b8b225',
    '92349122-9870-4657-8c6e-d29826c532fc',
    1,
    'playwright',
    'Download RFP Data',
    'Navigate to the NC portal and download RFP data using Playwright automation',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert scrape download step (ai_prompt type) - Step 2
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    '7787395d-a6c3-4fd3-87fc-d6d15a315608',
    '92349122-9870-4657-8c6e-d29826c532fc',
    2,
    'ai_prompt',
    'Analyze RFP Data',
    'Use AI to analyze the downloaded RFP data and identify relevant opportunities',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert scrape download step (playwright type) - Step 3 (Text Extraction)
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    '53f00fe6-7cfb-4e3f-9301-bda89a6d9ab3',
    '92349122-9870-4657-8c6e-d29826c532fc',
    3,
    'playwright',
    'Extract Bid Details',
    'Extract bid header, inquiry details, description, and commodity codes from each bid page',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert scrape download step (ai_prompt type) - Step 4 (AI Analysis of Text Content)
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    'f578fb1e-094a-4172-9d49-ec888e4e3971',
    '92349122-9870-4657-8c6e-d29826c532fc',
    4,
    'ai_prompt',
    'Analyze Extracted Bid Content',
    'Use AI to analyze the extracted bid details and identify key opportunities',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert opportunity creation step (Step 5) for North Carolina
INSERT INTO scrape_download_steps (
    id, configuration_id, step_order, step_type, name, description, created_by
) VALUES (
    'bcd71d4a-9f97-4878-8f3b-a0d10bfdf217',
    '92349122-9870-4657-8c6e-d29826c532fc',
    5,
    'create_opportunity',
    'Create Opportunities & Market Insights',
    'Parse AI response and create opportunities and market insights in the database',
    '00000000-0000-0000-0000-000000000000'
);

-- Insert playwright steps for North Carolina (Step 1)
INSERT INTO playwright_steps (
    scrape_download_step_id, step_order, action_type, selector, selector_type, value, wait_time, description, created_by
) VALUES
('d9ed4ae2-dcd5-4b8d-a82b-7e90e2b8b225', 1, 'goto', NULL, NULL, NULL, NULL, 'Navigate to the NC solicitations page', '00000000-0000-0000-0000-000000000000'),
('d9ed4ae2-dcd5-4b8d-a82b-7e90e2b8b225', 2, 'waitForDownload', NULL, NULL, NULL, NULL, 'Wait for download event', '00000000-0000-0000-0000-000000000000'),
('d9ed4ae2-dcd5-4b8d-a82b-7e90e2b8b225', 3, 'click', 'a[title="Download"]', NULL, NULL, NULL, 'Click download link', '00000000-0000-0000-0000-000000000000'),
('d9ed4ae2-dcd5-4b8d-a82b-7e90e2b8b225', 4, 'saveDownload', NULL, NULL, NULL, NULL, 'Save download excel file', '00000000-0000-0000-0000-000000000000');

-- Insert prompt step for North Carolina (Step 2)
INSERT INTO prompt_steps (
    scrape_download_step_id, prompt, system_prompt, storage_ids, created_by
) VALUES (
    '7787395d-a6c3-4fd3-87fc-d6d15a315608',
    'Analyze this North Carolina Electronic Vendor Portal bid data and identify procurement opportunities that match our services.

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
- Staff Development',
    'IMPORTANT: Respond with pure JavaScript code only. Do not include any markdown formatting, code blocks, or explanatory text. Return only the JavaScript code that can be directly executed. You must return a valid JSON object with type and values fields.
    
For each relevant opportunity found:
1. Extract the Solicitation Number
2. Return ONLY a JSON object in this exact format:
{
  "type": "id",
  "values": ["12345", "67890", "ABCDE"]
}

Do not include any other text, analysis, or formatting. Just the JSON object of solicitation numbers.',
    ARRAY['44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666'],
    '00000000-0000-0000-0000-000000000000'
);

-- Insert prompt step for North Carolina (Step 4)
INSERT INTO prompt_steps (
    scrape_download_step_id, prompt, system_prompt, storage_ids, created_by
) VALUES (
    'f578fb1e-094a-4172-9d49-ec888e4e3971',
    'As a CEO of a leadership development and consulting company, analyze this Request for Proposal and provide strategic insights for our bidding approach:

## BIDDING STRATEGY ANALYSIS

For the RFP, evaluate:

**1. Strategic Fit Assessment**
- How well does this RFP align with our core leadership development services?
- Which of our key service areas (executive coaching, team development, organizational change, strategic planning) are most relevant?
- What is the potential for long-term relationship building vs. one-time project?

**2. Competitive Positioning**
- What unique value propositions should we emphasize?
- How can we differentiate from typical government contractors?
- What leadership expertise gaps might exist in the current vendor pool?

**3. Keyword & Requirements Alignment**
- Identify leadership-related keywords and requirements that match our expertise
- Highlight any specific leadership competencies, certifications, or methodologies mentioned
- Note any organizational development, change management, or strategic planning elements

**4. Bidding Recommendations**
- Recommended approach: Full bid, joint venture, or pass?
- Key differentiators to emphasize in our proposal
- Potential partners or subcontractors to consider
- Risk factors and mitigation strategies

**5. Resource & Timeline Assessment**
- Estimated effort level (Low/Medium/High) and why
- Key personnel needed for successful delivery
- Timeline feasibility and potential conflicts
- Required certifications or qualifications

## OVERALL STRATEGIC INSIGHTS

- **Market Trends**: What patterns emerge about leadership development needs in North Carolina government?
- **Opportunity Prioritization**: Rank these RFPs by strategic value and win probability
- **Resource Planning**: What capabilities should we develop or strengthen?
- **Relationship Building**: Which agencies show recurring leadership development needs?

## ACTIONABLE RECOMMENDATIONS

For each RFP, provide:
- **Go/No-Go Decision** with clear rationale
- **3-5 Key Messaging Points** for our proposal
- **Risk Assessment** (Low/Medium/High) with specific concerns
- **Estimated Win Probability** (Low/Medium/High) with reasoning

Focus on insights that help us make strategic decisions about where to invest our bidding resources and how to position ourselves as the premier leadership development partner for North Carolina government agencies.',
    'IMPORTANT: You must return your analysis in a specific JSON format that can be used to create opportunities. Return ONLY valid JSON with the following structure:

{
  "opportunities": [
    {
      "bidNumber": "string - The bid/RFP number",
      "title": "string - The title of the RFP",
      "agency": "string - The government agency issuing the RFP",
      "description": "string - Brief description of the opportunity",
      "strategicFit": "string - Low/Medium/High - How well it aligns with our services",
      "goNoGoDecision": "string - Go/No-Go with brief rationale",
      "keyMessagingPoints": ["string", "string", "string"] - Array of 3-5 key points for our proposal,
      "riskAssessment": "string - Low/Medium/High with specific concerns",
      "winProbability": "string - Low/Medium/High with reasoning",
      "estimatedValue": "string - Estimated contract value if available",
      "deadline": "string - Submission deadline if available",
      "requiredCertifications": ["string"] - Array of required certifications or qualifications,
      "keywords": ["string"] - Array of relevant keywords found in the RFP,
      "serviceAreas": ["string"] - Array of our service areas that match this opportunity
    }
  ],
  "marketInsights": {
    "trends": ["string"] - Array of market trends identified (e.g., "Increasing demand for leadership development in government agencies"),
    "prioritization": ["string"] - Array of recommendations for opportunity prioritization (e.g., "Focus on agencies with recurring training needs"),
    "resourceNeeds": ["string"] - Array of capabilities we should develop (e.g., "Need for certified leadership assessment tools"),
    "competitiveAnalysis": ["string"] - Array of competitive insights (e.g., "Limited expertise in organizational change management among competitors"),
    "marketOverview": ["string"] - Array of market overview insights (e.g., "Growing emphasis on measurable leadership outcomes")
  }
}

Note: For marketInsights, you do not need to be exhaustive or find insights for every category. Generate insights naturally based on the content provided. Focus on the most relevant and actionable insights that emerge from your analysis.

Do not include any markdown formatting, explanatory text, or code blocks. Return only the JSON object.',
    NULL,
    '00000000-0000-0000-0000-000000000000'
);

-- Insert create opportunity step configuration for North Carolina
INSERT INTO create_opportunity_steps (
    scrape_download_step_id, title_template, description_template, source_template, 
    bid_number_field, agency_field, due_date_field, estimated_value_field,
    commodity_codes_field, requirements_template, tags_template, created_by
) VALUES (
    'bcd71d4a-9f97-4878-8f3b-a0d10bfdf217',
    '{{title}}',
    '{{description}}',
    'https://evp.nc.gov/solicitations/{{bidNumber}}',
    'bidNumber',
    'agency',
    'deadline',
    'estimatedValue',
    'commodityCodes',
    'strategicFit',
    ARRAY['leadership', 'development', 'consulting', 'north-carolina'],
    '00000000-0000-0000-0000-000000000000'
);

-- Insert playwright steps for text extraction (Step 3) - NC uses search and navigation
INSERT INTO playwright_steps (
    scrape_download_step_id, step_order, action_type, selector, selector_type, value, wait_time, description, created_by
) VALUES
('53f00fe6-7cfb-4e3f-9301-bda89a6d9ab3', 1, 'goto', NULL, NULL, NULL, NULL, 'Navigate to the NC solicitations page', '00000000-0000-0000-0000-000000000000'),
('53f00fe6-7cfb-4e3f-9301-bda89a6d9ab3', 2, 'click', 'textbox', 'role', 'To search on partial text,', NULL, 'Click the search textbox', '00000000-0000-0000-0000-000000000000'),
('53f00fe6-7cfb-4e3f-9301-bda89a6d9ab3', 3, 'type', 'To search on partial text,', 'role', '{id}', NULL, 'Fill search box with the ID from AI response', '00000000-0000-0000-0000-000000000000'),
('53f00fe6-7cfb-4e3f-9301-bda89a6d9ab3', 4, 'click', 'button', 'role', 'Search Results', NULL, 'Click the Search Results button', '00000000-0000-0000-0000-000000000000'),
('53f00fe6-7cfb-4e3f-9301-bda89a6d9ab3', 5, 'click', 'table.table-striped td a', NULL, NULL, NULL, 'Click the first result in the table', '00000000-0000-0000-0000-000000000000'),
('53f00fe6-7cfb-4e3f-9301-bda89a6d9ab3', 6, 'wait', NULL, NULL, 'networkidle', NULL, 'Wait for page to load completely', '00000000-0000-0000-0000-000000000000'),
('53f00fe6-7cfb-4e3f-9301-bda89a6d9ab3', 7, 'getInnerText', 'body', 'page', NULL, NULL, 'Extract all text from the bid detail page', '00000000-0000-0000-0000-000000000000');
