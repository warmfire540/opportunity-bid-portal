# Step Connections Feature

## Overview

The step connections feature provides visual feedback showing how data flows between different steps in a scraping configuration. This helps users understand the relationship between steps and what data is being passed between them.

## How It Works

### Step Types and Their Inputs/Outputs

#### Playwright File Download Step

- **Output**: Downloaded File (saved to storage)
- **Visual**: Blue badge with download icon
- **Description**: "File saved to storage"

#### AI Prompt Analysis Step (prompt_steps)

- **Input**: Downloaded File (optional, when preceded by playwright step) OR Text Content (optional, when preceded by playwright step with text extraction)
- **Output**: Analysis Results (AI-generated insights)
- **Visual**: Green badge with message icon
- **Description**: "AI-generated insights"

#### AI Prompt Step (ai_prompt)

- **Input**: File Input (optional)
- **Output**: AI Response (generated content)
- **Visual**: Purple badge with message icon
- **Description**: "Generated content"

#### Links Analysis Step

- **Output**: Link Analysis (extracted links and data)
- **Visual**: Orange badge with file icon
- **Description**: "Extracted links and data"

### Visual Connection Elements

1. **Step Output Badge**: Shows what the current step produces
2. **Connection Line**: Vertical line with arrow indicating data flow
3. **Next Step Input Badge**: Shows what the next step can accept (when applicable)

### Example Configurations

#### Florida RFP Download

```
Step 1: Playwright File Download
├── Output: Downloaded File
│   ↓ (connection line)
Step 2: AI Prompt Analysis
├── Input: Downloaded File (from previous step)
├── Output: Analysis Results
│   ↓ (connection line)
Step 3: Playwright Text Extraction
├── Input: URLs from previous step
├── Output: Text Content
│   ↓ (connection line)
Step 4: AI Prompt Analysis
├── Input: Text Content (from previous step)
└── Output: Analysis Results
```

#### Example.com Data Collection

```
Step 1: Playwright File Download
├── Output: Downloaded File
│   ↓ (connection line)
Step 2: Playwright File Download
├── Input: Downloaded File (from previous step)
├── Output: Downloaded File
│   ↓ (connection line)
Step 3: AI Prompt Analysis
├── Input: Downloaded File (from previous step)
└── Output: Analysis Results
```

## Implementation Details

### Components

- `StepConnector`: Renders the visual connection elements
- `StepCard`: Enhanced to include connector functionality
- `PlaywrightStep`: Updated to show "Downloaded File" output
- `AiPromptStep`: Updated to show file input when preceded by playwright step

### Key Features

1. **Automatic Detection**: The system automatically detects step sequences and shows appropriate connections
2. **Visual Hierarchy**: Clear visual distinction between different step types using color-coded badges
3. **Responsive Design**: Connections adapt to different screen sizes
4. **Accessibility**: Proper ARIA labels and semantic HTML structure

### Benefits

1. **Clear Data Flow**: Users can easily see how data moves between steps
2. **Better Understanding**: Visual representation helps users understand step relationships
3. **Debugging Aid**: When troubleshooting, users can quickly see what each step produces and consumes
4. **Configuration Validation**: Helps users verify that their step sequence makes logical sense

## Usage

The feature is automatically enabled for all scraping configurations. When viewing a configuration's expanded content, you'll see:

1. Each step card with its type and description
2. Output badges showing what each step produces
3. Connection lines between steps
4. Input badges showing what the next step can accept

The connections are purely visual and don't affect the actual execution of the steps - they're designed to help users understand the data flow and relationships between steps.
