/*
===============================================================================
                              SAMPLE OPPORTUNITIES
===============================================================================
This seed file contains sample opportunities with AI analysis data for testing
the new fields without having to re-run the scraping analysis.
===============================================================================
*/

-- Insert sample opportunity with AI analysis data
INSERT INTO opportunities (
    id, title, description, source, status, bid_number, agency, due_date, 
    estimated_value, commodity_codes, contact_info, requirements, attachments, tags,
    strategic_fit, go_no_go_decision, key_messaging_points, risk_assessment, 
    win_probability, required_certifications, keywords, service_areas,
    created_at, updated_at, created_by, updated_by
) VALUES 
(
    'f7eb3369-8adc-4372-a7ac-9c3a549846aa',
    'Workforce Leadership Development and Behavioral Outcomes Training',
    'Conduct a Needs Assessment and Gap Analysis for workforce leadership development, and develop an Annual Training Plan including coaching and tailored training sessions.',
    'https://vendor.myfloridamarketplace.com/search/bids/detail/RFP-13149',
    'new',
    'RFP-13149',
    'Department of Children and Families (DCF)',
    '2025-09-04 00:00:00+00',
    NULL,
    NULL,
    NULL,
    'High',
    NULL,
    ARRAY['leadership', 'development', 'consulting'],
    'high',
    'Go - This opportunity aligns closely with our expertise in leadership development and organizational training.',
    '["Extensive experience in conducting needs assessments and gap analyses for organizations.", "Proven track record in delivering customized training plans that enhance workforce capabilities.", "Strong methodologies for behavioral outcomes measurement tied to leadership development."]',
    'Medium - Potential challenges in aligning with existing departmental structures and processes.',
    'Medium - Competitive landscape, but our tailored approach can differentiate us.',
    '["Certified Executive Coaches", "Trainers with experience in behavioral outcomes methodologies"]',
    '["leadership development", "needs assessment", "gap analysis", "professional coaching", "training plan"]',
    '["executive coaching", "team development", "organizational change", "strategic planning"]',
    '2025-07-02 02:56:56.937813+00',
    '2025-07-02 02:56:56.937813+00',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111'
); 