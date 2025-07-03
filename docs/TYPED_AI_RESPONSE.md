# Typed AI Response Feature

## Overview

The typed AI response feature allows the AI prompt step to return structured data with type information, making it easier for subsequent steps to understand how to handle the data.

## Problem Solved

Previously, the AI step would return arrays of structured data (URLs or IDs) without type information, making it difficult for the next step to know:

- Whether the values are URLs that should be navigated to directly
- Whether the values are IDs that need to be converted to URLs first
- How to handle different data formats consistently

## Solution

The AI response now includes a `type` field that indicates the nature of the values:

### Response Format

```json
{
  "type": "url" | "id",
  "values": ["value1", "value2", "value3"]
}
```

### Type Values

- **`"url"`**: The values are complete URLs that can be navigated to directly
- **`"id"`**: The values are IDs that need to be converted to URLs using a template

## Implementation Details

### 1. AI Prompt Step

The AI prompt step now parses the response and extracts both:

- `aiResponse`: The raw AI response (for backward compatibility)
- `typedAiResponse`: The structured response with type and values

### 2. Playwright Step

The playwright step now:

- First checks for `typedAiResponse` (new format)
- Falls back to parsing `aiResponse` (legacy format)
- Uses the appropriate template for navigation with structured data

### 3. URL Templates

Different configurations can use different URL templates:

**Florida (URL type):**

```
{url} -> https://vendor.myfloridamarketplace.com/search/bids/detail/12345
```

**North Carolina (ID type):**

```
{id} -> https://evp.nc.gov/solicitations/12345
```

## Configuration Examples

### Florida Configuration

```sql
-- AI prompt returns URLs
{
  "type": "url",
  "values": [
    "https://vendor.myfloridamarketplace.com/search/bids/detail/12345",
    "https://vendor.myfloridamarketplace.com/search/bids/detail/67890"
  ]
}

-- Playwright step uses {url} template
'goto', NULL, NULL, '{url}', NULL, 'Navigate to bid detail page using dynamic URL'
```

### North Carolina Configuration

```sql
-- AI prompt returns IDs
{
  "type": "id",
  "values": ["12345", "67890", "ABCDE"]
}

-- Playwright step uses {id} template
'goto', NULL, NULL, 'https://evp.nc.gov/solicitations/{id}', NULL, 'Navigate to bid detail page using dynamic ID'
```

## Backward Compatibility

The system maintains backward compatibility by:

1. First checking for the new `typedAiResponse` format
2. Falling back to parsing the legacy array format from `aiResponse`
3. Automatically detecting the type based on content (URLs vs IDs)

## Benefits

1. **Type Safety**: Clear indication of data type
2. **Flexibility**: Support for different URL patterns
3. **Maintainability**: Easier to add new data types
4. **Backward Compatibility**: Existing configurations continue to work
5. **Consistency**: Standardized approach across different portals

## Future Enhancements

The typed response structure can be extended to support additional types:

- `"search_query"`: For search-based navigation
- `"form_data"`: For form submissions
- `"api_endpoint"`: For API calls
