// import { writeFile } from "fs/promises";
// import path from "path";

// import Browserbase from "@browserbasehq/sdk";
// import { test } from "@playwright/test";
// import dotenv from "dotenv";
// import { chromium } from "playwright";

// test("test", async () => {
//   // Load .env.local specifically
//   dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

//   const bb = new Browserbase({
//     apiKey: process.env.BROWSERBASE_API_KEY,
//   });
//   console.log("Creating a new session...");
//   const session = await bb.createSession({
//     projectId: process.env.BROWSERBASE_PROJECT_ID,
//   });
//   console.log(`Session created with ID: ${session.id}`);
//   // @ts-ignore - SDK types may not be up to date
//   const browser = await chromium.connectOverCDP(session.connectUrl);

//   const context = browser.contexts()[0]!;
//   const bbPage = context.pages()[0]!;

//   // Set up CDP session for download handling
//   console.log("Configuring download behavior...");
//   const client = await context.newCDPSession(bbPage);
//   await client.send("Browser.setDownloadBehavior", {
//     behavior: "allow",
//     downloadPath: "downloads",
//     eventsEnabled: true,
//   });

//   await bbPage.goto("https://vendor.myfloridamarketplace.com/search/bids");
//   await bbPage.getByRole("button", { name: "Ad Type" }).click();
//   await bbPage.getByRole("option", { name: "Request for Proposals" }).click();
//   await bbPage.getByRole("button", { name: "Ad Status" }).click();
//   await bbPage.getByRole("option", { name: "PREVIEW" }).click();
//   await bbPage.getByRole("option", { name: "OPEN" }).click();
//   await bbPage.getByRole("button", { name: "Search" }).click();

//   console.log("Initiating download...");
//   const [download] = await Promise.all([
//     bbPage.waitForEvent("download"),
//     bbPage.getByRole("button", { name: "Export to Excel" }).click(),
//   ]);

//   const downloadError = await download.failure();
//   if (downloadError !== null) {
//     throw new Error(`Download failed: ${downloadError}`);
//   }

//   // Cleanup browser
//   await bbPage.close();
//   await browser.close();

//   // Verify download
//   console.log("Verifying download...");
//   const buffer = await bb.getSessionDownloads(session.id);

//   await writeFile("test-fl.xlsx", new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength));
// });
