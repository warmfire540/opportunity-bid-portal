# Auto-Scroll Feature

## Overview

The auto-scroll feature automatically scrolls the page to follow the currently executing step during configuration execution. This provides a better user experience by keeping the active step visible as the automation progresses.

## How It Works

### Auto-Scroll Hook (`useAutoScroll`)

The `useAutoScroll` hook in `src/lib/hooks/use-auto-scroll.ts` provides the core functionality:

- **Automatic Detection**: Detects when an element becomes active
- **Smart Scrolling**: Scrolls either the window or a container element
- **Configurable Options**:
  - `enabled`: Enable/disable auto-scrolling
  - `offset`: Distance from the top when scrolling to element
  - `behavior`: Scroll behavior (smooth, instant)
  - `delay`: Delay before scrolling (useful for animations)
  - `highlight`: Add visual highlight effect when scrolling

### Implementation Points

1. **Step Cards**: Each step card uses auto-scroll when it becomes active
2. **Progress Indicator**: The progress bar scrolls into view when execution starts
3. **Steps Container**: The entire steps section scrolls into view when execution begins

### Visual Feedback

- **Highlight Animation**: Active steps get a blue glow effect when scrolled to
- **Pulse Animation**: Running steps have a subtle pulse animation
- **Smooth Transitions**: All scrolling uses smooth behavior for better UX

## Usage

The auto-scroll feature is automatically enabled during configuration execution. No user interaction is required - it will:

1. Scroll to the steps section when execution starts
2. Scroll to each step as it becomes active
3. Scroll to the progress indicator when steps are running
4. Provide visual feedback with highlight effects

## Technical Details

- **Container Support**: Works with both window scrolling and container scrolling
- **Performance**: Uses `setTimeout` to avoid blocking the main thread
- **Accessibility**: Maintains focus and keyboard navigation
- **Responsive**: Works across different screen sizes and orientations

## CSS Classes

- `.scroll-highlight`: Applied to elements when auto-scrolling to them
- `data-scroll-container`: Marks containers that can be scrolled within

## Future Enhancements

- User preference to disable auto-scrolling
- Different scroll behaviors for different step types
- Keyboard shortcuts to manually trigger scrolling
- Scroll history to allow users to go back to previous steps
