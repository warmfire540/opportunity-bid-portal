"use client";

import type { PlaywrightStep } from "@lib/actions/scraping";

// Accept subSteps directly
interface Props {
  subSteps: PlaywrightStep[];
}

export default function ScrapeConfigurationSteps({ subSteps }: Readonly<Props>) {
  if (subSteps.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No Playwright actions configured for this step.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subSteps.map((subStep, subIndex) => (
        <div key={subStep.id ?? subIndex} className="mb-2 rounded bg-muted/50 p-3">
          <div className="text-sm">
            {subStep.description != null && subStep.description !== "" && (
              <p className="mb-1 text-muted-foreground">{subStep.description}</p>
            )}
            {subStep.selector != null && subStep.selector !== "" && (
              <p className="text-xs">
                <span className="font-medium">Selector:</span> {subStep.selector}
                {subStep.selector_type != null &&
                  subStep.selector_type !== "" &&
                  ` (${subStep.selector_type})`}
              </p>
            )}
            {subStep.value != null && subStep.value !== "" && (
              <p className="text-xs">
                <span className="font-medium">Value:</span> {subStep.value}
              </p>
            )}
            {subStep.wait_time != null && subStep.wait_time !== 0 && (
              <p className="text-xs">
                <span className="font-medium">Wait:</span> {subStep.wait_time}ms
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
