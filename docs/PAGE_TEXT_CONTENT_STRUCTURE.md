# Page Text Content Structure

## Overview

The scraping system has been updated to better handle two different scenarios:

1. **Multiple content pieces from a single page**: When scraping one RFP bid page and extracting 2-3 different pieces of content (e.g., header, description, requirements), these should be combined for AI analysis.

2. **Multiple pages**: When scraping 2+ different bid pages, each page should be processed separately by the AI step to maintain proper context.

## Data Structure

### PageTextContent Type

```typescript
export type PageTextContent = {
  pageId?: string; // Optional identifier for the page (URL, ID, etc.)
  content: string[]; // Multiple pieces of content from the same page
};
```

### StepExecutionResult

```typescript
export type StepExecutionResult = {
  // ... existing fields ...
  pageTextContent?: PageTextContent[]; // Array of page content, each page can have multiple content pieces
  // ... existing fields ...
};
```

## How It Works

### Playwright Step

The playwright step creates `PageTextContent` objects:

- **Single page with multiple content pieces**: Creates one `PageTextContent` with multiple strings in the `content` array
- **Multiple pages (URL type)**: Creates separate `PageTextContent` objects for each page
- **Multiple IDs (ID type)**: Creates one `PageTextContent` with all content combined (same page, different inputs)

### AI Prompt Step

The AI prompt step processes the new structure:

- **Single page**: Combines all content pieces from the page and sends one AI request
- **Multiple pages**: Sends separate AI requests for each page, then combines the results

## Example Scenarios

### Scenario 1: Single Page, Multiple Content Pieces

```typescript
// Input: One page with header, description, and requirements
pageTextContent: [
  {
    pageId: "bid-123",
    content: ["Header text...", "Description text...", "Requirements text..."],
  },
];

// AI Step: Single request with all content combined
```

### Scenario 2: Multiple Pages

```typescript
// Input: Three different bid pages
pageTextContent: [
  {
    pageId: "bid-123",
    content: ["Header text...", "Description text..."],
  },
  {
    pageId: "bid-456",
    content: ["Header text...", "Description text..."],
  },
  {
    pageId: "bid-789",
    content: ["Header text...", "Description text..."],
  },
];

// AI Step: Three separate requests, one per page
```

## Benefits

1. **Better Context**: AI can focus on one page at a time when processing multiple pages
2. **Improved Accuracy**: Single-page analysis is more focused and accurate
3. **Flexible Structure**: Can handle both single-page and multi-page scenarios
4. **Clear Separation**: Distinguishes between multiple content pieces vs multiple pages
5. **Simplified Code**: Single data structure handles all scenarios without legacy compatibility
