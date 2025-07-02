-- Seed sample market insights data

-- Insert market insights
INSERT INTO market_insights (
    trends, prioritization, resource_needs, created_by, created_at
) VALUES (
    ARRAY[
        'Increasing demand for leadership development programs within government agencies.',
        'Focus on measurable behavioral outcomes from training initiatives.',
        'Need for tailored training solutions to address specific departmental challenges.'
    ],
    ARRAY[
        'Prioritize opportunities that align with our core competencies in leadership and organizational development.',
        'Focus on agencies with recurring needs for development and training services.'
    ],
    ARRAY[
        'Expand capabilities in behavioral outcome measurement and assessment.',
        'Enhance our team with certified trainers and coaches specialized in government requirements.'
    ],
    '00000000-0000-0000-0000-000000000000',
    NOW()
);

-- Insert additional market insights for different regions/contexts
INSERT INTO market_insights (
    trends, prioritization, resource_needs, created_by, created_at
) VALUES (
    ARRAY[
        'Growing emphasis on remote and hybrid leadership training solutions.',
        'Increased focus on diversity, equity, and inclusion in leadership development.',
        'Demand for data-driven approaches to measure training effectiveness.'
    ],
    ARRAY[
        'Target opportunities in healthcare and education sectors with high leadership development needs.',
        'Prioritize contracts with longer-term relationship potential.'
    ],
    ARRAY[
        'Develop virtual training delivery capabilities and platforms.',
        'Build expertise in DEI leadership development and assessment tools.'
    ],
    '00000000-0000-0000-0000-000000000000',
    NOW()
);

-- Insert Florida-specific market insights
INSERT INTO market_insights (
    trends, prioritization, resource_needs, created_by, created_at
) VALUES (
    ARRAY[
        'Florida government agencies showing increased investment in leadership pipeline development.',
        'Focus on succession planning and knowledge transfer programs.',
        'Growing demand for crisis leadership and change management training.'
    ],
    ARRAY[
        'Focus on Florida Department of Transportation and Department of Health opportunities.',
        'Prioritize multi-year contracts with state agencies.'
    ],
    ARRAY[
        'Develop Florida-specific compliance and certification knowledge.',
        'Build relationships with Florida-based training and development networks.'
    ],
    '00000000-0000-0000-0000-000000000000',
    NOW()
);

-- Insert North Carolina-specific market insights
INSERT INTO market_insights (
    trends, prioritization, resource_needs, created_by, created_at
) VALUES (
    ARRAY[
        'North Carolina agencies prioritizing technology leadership and digital transformation training.',
        'Increased focus on sustainability and environmental leadership development.',
        'Growing demand for cross-functional team leadership programs.'
    ],
    ARRAY[
        'Target opportunities in technology and environmental protection agencies.',
        'Focus on Research Triangle Park area government contracts.'
    ],
    ARRAY[
        'Develop expertise in technology leadership and digital transformation.',
        'Build sustainability and environmental leadership training capabilities.'
    ],
    '00000000-0000-0000-0000-000000000000',
    NOW()
); 