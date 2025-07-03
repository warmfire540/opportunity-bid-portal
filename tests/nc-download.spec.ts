import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://evp.nc.gov/solicitations/");
  const downloadPromise = page.waitForEvent("download");
  await page.locator('a[title="Download"]').click();
  const download = await downloadPromise;
  await download.saveAs("test-nc.xlsx");
});
