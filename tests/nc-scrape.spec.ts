import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("https://evp.nc.gov/solicitations/");
  await page.getByRole("textbox", { name: "To search on partial text," }).click();
  await page.getByRole("textbox", { name: "To search on partial text," }).fill("54-12141455-CM");
  await page.getByRole("button", { name: "Search Results" }).click();
  await page.locator("table.table-striped td a").first().click();

  await page.waitForLoadState("networkidle");

  const content = await page.innerText("body");
  console.log(content);

  const description = await page.locator("textarea").textContent();
  console.log(description);
});
