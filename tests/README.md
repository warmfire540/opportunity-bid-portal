# Playwright Tests for Florida Marketplace Scraping

This directory contains Playwright tests for exploring and recording interactions with the Florida Marketplace website.

## Quick Start

### 1. Run the existing test to explore the page structure:

```bash
npm run test:headed
```

This will run the test in headed mode (visible browser) so you can see what's happening.

### 2. Record a new test by interacting with the website:

```bash
npm run test:record
```

This will open Playwright's code generator and navigate to the Florida Marketplace. You can then:

- Interact with the website manually
- Watch Playwright generate the corresponding test code
- Copy the generated code into your test files

### 3. Debug a test step by step:

```bash
npm run test:debug
```

This will run tests in debug mode, allowing you to step through each action.

### 4. View test reports:

```bash
npm run test:report
```

This will open the HTML test report showing screenshots, videos, and traces.

## Test Files

- `florida-marketplace.spec.ts` - Sample test that explores the Florida Marketplace page structure
- `screenshots/` - Directory where test screenshots are saved

## Recording New Tests

When you want to record a new test for the scraping functionality:

1. **Start the code generator:**

   ```bash
   npm run test:record
   ```

2. **Navigate and interact with the website:**
   - Go to the search page
   - Fill in search criteria
   - Click search
   - Look for download options
   - Click download buttons

3. **Copy the generated code:**
   - The code generator will show you the Playwright code for your actions
   - Copy this code into a new test file or update the existing scraping action

4. **Customize the code:**
   - Add proper waits and error handling
   - Add screenshots for debugging
   - Add assertions to verify the expected behavior

## Useful Commands

```bash
# Run all tests
npm run test

# Run tests with visible browser
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Record new test
npm run test:record

# Show test report
npm run test:report

# Run specific test file
npx playwright test florida-marketplace.spec.ts

# Run tests and generate report
npx playwright test --reporter=html
```

## Tips for Recording Tests

1. **Start with the main page:** Always begin by navigating to the main search page
2. **Take screenshots:** Use `await page.screenshot()` to capture the page state at key points
3. **Add waits:** Use `await page.waitForLoadState()` and `await page.waitForTimeout()` to ensure elements are ready
4. **Handle dynamic content:** Some elements might load dynamically, so add appropriate waits
5. **Test error scenarios:** Try different search criteria and see how the page responds
6. **Look for patterns:** Notice how the page structure changes after different actions

## Common Selectors to Look For

When recording tests, pay attention to these common selectors:

- **Search forms:** `form`, `.search-form`, `[data-testid="search-form"]`
- **Search inputs:** `input[type="text"]`, `input[placeholder*="search"]`
- **Date inputs:** `input[type="date"]`, `input[placeholder*="date"]`
- **Search buttons:** `button[type="submit"]`, `button:has-text("Search")`
- **Download buttons:** `button:has-text("Download")`, `button:has-text("Export")`
- **Results tables:** `table`, `.results-table`, `[data-testid="results"]`

## Debugging

If tests fail or behave unexpectedly:

1. **Check screenshots:** Look at the screenshots in the `tests/screenshots/` directory
2. **View traces:** Use `npm run test:report` to see detailed traces
3. **Run in headed mode:** Use `npm run test:headed` to see what's happening visually
4. **Add more logging:** Add `console.log()` statements to understand the page state
5. **Check selectors:** Verify that your selectors are still valid if the page structure changes
