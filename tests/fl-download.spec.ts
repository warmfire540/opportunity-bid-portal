import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://vendor.myfloridamarketplace.com/search/bids");
  await page.getByRole("button", { name: "Ad Type" }).click();
  await page.getByRole("option", { name: "Request for Proposals" }).click();
  await page.getByRole("button", { name: "Ad Status" }).click();
  await page.getByRole("option", { name: "PREVIEW" }).click();
  await page.getByRole("option", { name: "OPEN" }).click();
  await page.getByRole("button", { name: "Search" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export to Excel" }).click();
  const download = await downloadPromise;
  await download.saveAs("test-fl.xlsx");
});
