import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://vendor.myfloridamarketplace.com/search/bids/detail/13149");

  // Target div containing h1 element and extract bidheader
  const bidheader = await page.locator("div.topPadding:has(h1)").innerText();
  console.log("Bid Header:", bidheader);

  // Target div containing h2 element and extract inquiryDetails
  const inquiryDetails = await page.locator("section:has(h2)").innerText();
  console.log("Inquiry Details:", inquiryDetails);

  // Extract bid description
  const bidDescription = await page.locator("#mainSection").innerText();
  console.log(bidDescription);

  // Convert table data to CSV format
  const codes = await page.locator("mfmp-commodity-codes-list").innerText();
  console.log("Commodity Codes", codes);
});

test("content", async ({ page }) => {
  await page.goto("https://vendor.myfloridamarketplace.com/search/bids/detail/13149");

  const content = await page.innerText("body");
  console.log(content);
});
