import fs from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const services = [
  "App development",
  "AI agents and automation",
  "AI strategy consulting",
  "AI training seminars",
  "Healthcare app development",
];

const projects = ["ACS CARES", "Well Aware", "Smithsonian National Museum of African Art"];

const routes = [
  "/",
  "/services/",
  "/services/app-development/",
  "/services/ai-agents-and-automation/",
  "/services/ai-strategy-consulting/",
  "/services/ai-training-seminars/",
  "/services/healthcare-app-development/",
  "/portfolio/",
  "/portfolio/acs-cares/",
  "/portfolio/well-aware/",
  "/portfolio/smithsonian-national-museum-of-african-art/",
  "/approach/",
  "/resources/blog/",
  "/contact/",
  "/careers/",
];

function watch(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (/favicon\.ico/i.test(message.text())) return;
    errors.push(message.text());
  });
  return errors;
}

async function settle(page: Page): Promise<void> {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const toggle = page.getByRole("banner").getByRole("button", { name: /^(menu|close)$/i });
  if (await toggle.isVisible()) await expect(toggle).toHaveAttribute("aria-expanded", "false");
}

async function openNav(page: Page): Promise<void> {
  await settle(page);
  const servicesLink = page.getByRole("banner").getByRole("link", { name: "Services", exact: true });
  if (await servicesLink.isVisible()) return;
  await page.getByRole("banner").getByRole("button", { name: /^menu$/i }).click();
  await expect(servicesLink).toBeVisible();
}

function serviceRow(page: Page, href: string) {
  return page.getByRole("main").locator(`a[href="${href}"]`);
}

async function noOverflow(page: Page): Promise<void> {
  const delta = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(delta).toBeLessThanOrEqual(1);
}

async function openReport(page: Page) {
  await page.getByRole("button", { name: /report a problem/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  return dialog;
}

async function shoot(page: Page, name: string): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });
  const file = path.join("reports", "screenshots", `${name}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, fullPage: false });
}

function crosscommPath(href: string | null): string {
  const url = new URL(href ?? "https://invalid.example/");
  expect(["www.crosscomm.com", "crosscomm.com"]).toContain(url.hostname);
  return url.pathname.replace(/\/+$/, "") || "/";
}

test("navigation, pages, and layout hold on this viewport", async ({ page }) => {
  const errors = watch(page);
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await noOverflow(page);
  }
  expect(errors).toEqual([]);
});

test("header links reach the main sections", async ({ page }) => {
  await page.goto("/");
  await openNav(page);
  const banner = page.getByRole("banner");
  await banner.getByRole("link", { name: "Work", exact: true }).click();
  await expect(page).toHaveURL(/\/portfolio\/$/);
  await settle(page);
  await openNav(page);
  await banner.getByRole("link", { name: "Approach", exact: true }).click();
  await expect(page).toHaveURL(/\/approach\/$/);
  await settle(page);
  await openNav(page);
  await banner.getByRole("link", { name: "Insights", exact: true }).click();
  await expect(page).toHaveURL(/\/resources\/blog\/$/);
  await settle(page);
  await openNav(page);
  await banner.getByRole("link", { name: /let.s talk/i }).click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await settle(page);
});

test("homepage shows every service and the three case studies", async ({ page }) => {
  await page.goto("/");
  const main = page.getByRole("main");
  const serviceHrefs = [
    "/services/app-development/",
    "/services/ai-agents-and-automation/",
    "/services/ai-strategy-consulting/",
    "/services/ai-training-seminars/",
    "/services/healthcare-app-development/",
  ];
  for (const [href, name] of serviceHrefs.map((href, index) => [href, services[index]] as const)) {
    const row = serviceRow(page, href);
    await expect(row).toBeVisible();
    await expect(row.getByRole("heading", { name })).toBeVisible();
  }
  for (const name of projects) {
    await expect(main.getByRole("link", { name, exact: true })).toBeVisible();
  }
});

test("a service page and a case study say something specific", async ({ page }) => {
  await page.goto("/services/healthcare-app-development/");
  await expect(page.getByRole("heading", { level: 1, name: "Healthcare app development" })).toBeVisible();
  await expect(page.getByRole("main")).toContainText(/research teams and care organizations/i);
  await expect(page.getByRole("main")).not.toContainText(/HIPAA certified|SOC 2 certified/i);
  await page.getByRole("main").getByRole("link", { name: "ACS CARES", exact: true }).first().click();
  await expect(page).toHaveURL(/\/portfolio\/acs-cares\/$/);
  await expect(page.getByRole("main")).toContainText("American Cancer Society");
  await expect(page.getByRole("main")).toContainText(/semantic search/i);
  const source = page.getByRole("main").locator('a[href*="crosscomm.com/portfolio/acs-cares"]');
  await expect(source).toBeVisible();
  expect(crosscommPath(await source.getAttribute("href"))).toBe("/portfolio/acs-cares");
});

test("work filters hide the projects that do not match", async ({ page }) => {
  await page.goto("/portfolio/");
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Healthcare", exact: true }).click();
  await expect(main.getByRole("link", { name: "ACS CARES", exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "Well Aware", exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "Smithsonian National Museum of African Art", exact: true })).toBeHidden();
  await main.getByRole("button", { name: "Web", exact: true }).click();
  await expect(main.getByRole("link", { name: "Smithsonian National Museum of African Art", exact: true })).toBeVisible();
  await expect(main.getByRole("link", { name: "ACS CARES", exact: true })).toBeHidden();
  await main.getByRole("button", { name: "All", exact: true }).click();
  for (const name of projects) await expect(main.getByRole("link", { name, exact: true })).toBeVisible();
});

test("contact opens the mail app and the existing form, and does not submit a lead", async ({ page }) => {
  await page.goto("/contact/");
  const main = page.getByRole("main");
  await expect(main.locator('a[href^="mailto:hello@crosscomm.com"]')).toBeVisible();
  await expect(main.locator('a[href="tel:+19196953241"]')).toBeVisible();
  const existing = main.locator('a[href*="crosscomm.com/contact"]');
  await expect(existing).toBeVisible();
  expect(crosscommPath(await existing.first().getAttribute("href"))).toBe("/contact");
  await expect(main).toContainText(/Nothing is sent until you send it there/i);
  await expect(main).not.toContainText(/message sent|form submitted|we'll be in touch|issue created/i);

  await main.getByRole("textbox", { name: "Name" }).fill("Ada Lovelace");
  await main.getByRole("textbox", { name: "Brief" }).fill("A short internal tool for the lab.");
  await main.getByRole("button", { name: "Copy brief" }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("Name: Ada Lovelace");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("A short internal tool for the lab.");
  await expect(main.getByRole("status")).toHaveText(
    "Brief copied, complete. Paste it into an email to hello@crosscomm.com. Nothing was sent.",
  );

  await main.getByRole("textbox", { name: "Brief" }).fill("detail ".repeat(400));
  await main.getByRole("button", { name: "Open in your email app" }).click();
  await expect(main.getByRole("status")).toHaveText(
    "This brief is too long for an email link. Copy brief keeps the full text. Paste it into an email to hello@crosscomm.com. Nothing was sent.",
  );
  await expect(page).toHaveURL(/\/contact\/$/);
  await main.getByRole("button", { name: "Copy brief" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("detail ".repeat(400).trim());
  expect(copied).toContain("Name: Ada Lovelace");
  await expect(main.getByRole("status")).toHaveText(
    "Brief copied, complete. Paste it into an email to hello@crosscomm.com. Nothing was sent.",
  );
});

test("feedback can be read, copied, downloaded, and drafted, and is not sent", async ({ page }) => {
  await page.goto("/contact/?utm=should-not-appear#private");
  const launcher = page.getByRole("button", { name: /report a problem/i });
  await launcher.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator(":focus")).toBeAttached();
  const focusedInside = await page.locator(":focus").evaluate((element) => Boolean(element.closest("dialog, [role=dialog]")));
  expect(focusedInside).toBe(true);

  await dialog.getByRole("textbox", { name: /description/i }).fill("The contact phone is hard to find.");
  await dialog.getByRole("textbox", { name: /expected/i }).fill("Show the phone beside the email address.");
  await expect(dialog.locator("pre")).toContainText("The contact phone is hard to find.");
  await expect(dialog).toContainText(/submit/i);
  await expect(dialog).not.toContainText("should-not-appear");

  await dialog.getByRole("button", { name: /copy/i }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("The contact phone is hard to find.");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dialog.getByRole("button", { name: /download/i }).click(),
  ]);
  const reportPath = await download.path();
  if (!reportPath) throw new Error("The browser did not keep the downloaded report.");
  const text = fs.readFileSync(reportPath, "utf8");
  expect(text).toContain("The contact phone is hard to find.");
  expect(text).not.toContain("should-not-appear");
  expect(text.toLowerCase()).toContain("submit");
  await expect(dialog).toContainText("Download requested. Nothing was filed. If the file did not save, copy the report.");

  const draft = dialog.getByRole("link", { name: "Open issue draft in GitHub" });
  const href = await draft.getAttribute("href");
  expect(href).toMatch(/^https:\/\/github\.com\/mrhinkle\/crosscomm-website\/issues\/new\?/);
  expect(decodeURIComponent(href ?? "")).not.toContain("should-not-appear");
  expect(decodeURIComponent(href ?? "")).toContain("/contact");
  await expect(dialog).not.toContainText(/been sent|issue created|successfully submitted/i);
  let requested = "";
  await page.context().route("https://github.com/**", async (route) => {
    requested = route.request().url();
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>Draft fixture</title><p>GitHub draft fixture. Not submitted.</p>",
    });
  });
  const popupPromise = page.waitForEvent("popup");
  await draft.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/github\.com\/mrhinkle\/crosscomm-website\/issues\/new/);
  expect(popup.url()).not.toMatch(/\/issues\/\d+/);
  const decoded = decodeURIComponent(requested || popup.url());
  expect(decoded).toContain("The contact phone is hard to find.");
  expect(decoded).not.toContain("should-not-appear");
  expect(decoded).toContain("/contact");
  await expect(popup.getByText("Not submitted.")).toBeVisible();
  await popup.close();
  await expect(dialog).toContainText(/Nothing was filed/i);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(launcher).toBeFocused();

  await openReport(page);
  await page.getByRole("button", { name: /cancel|close/i }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("a too-long draft stays closed and explains the other ways to file it", async ({ page }) => {
  await page.goto("/");
  const dialog = await openReport(page);
  await dialog.getByRole("textbox", { name: /description/i }).fill("😀".repeat(600));
  const draft = dialog.getByRole("link", { name: "Open issue draft in GitHub" }).or(dialog.getByRole("button", { name: "Open issue draft in GitHub" }));
  await expect(draft).toBeDisabled();
  await expect(dialog).toContainText(/copy|download/i);
  await expect(dialog).not.toContainText(/been sent|issue created/i);
});

test("an unknown address is a real 404", async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: { text: string; url: string }[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    consoleErrors.push({ text: message.text(), url: message.location().url });
  });
  const response = await page.goto("/review-smoke-unknown-path/");
  expect(response?.status()).toBe(404);
  expect(new URL(page.url()).pathname).toBe("/review-smoke-unknown-path/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("main")).not.toContainText("Make the next thing");
  expect(pageErrors, pageErrors.join("\n")).toEqual([]);
  for (const message of consoleErrors) {
    expect(message.text, message.text).toMatch(/404|failed to load resource/i);
    expect(message.url, `${message.text} @ ${message.url}`).toMatch(/\/review-smoke-unknown-path\/?/);
  }
});

test("desktop first screen shows the lead and the two main actions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The first-screen check is the 1440px layout.");
  await page.goto("/");
  const lead = page.getByText("AI strategy, custom apps, and human-centered product development for ambitious teams.");
  const servicesLink = page.getByRole("link", { name: "See the services" });
  const workLink = page.getByRole("link", { name: "See the work" });
  await expect(lead).toBeVisible();
  for (const locator of [lead, servicesLink, workLink]) {
    const box = await locator.boundingBox();
    expect(box, (await locator.textContent()) ?? "missing box").toBeTruthy();
    expect((box?.y ?? 9999) + (box?.height ?? 0)).toBeLessThanOrEqual(900);
  }
});

test("client navigation replaces the route metadata instead of stacking it", async ({ page }) => {
  await page.goto("/services/app-development/");
  await expect(page).toHaveTitle(/App development/);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /\/services\/app-development\/$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);

  async function graphs(): Promise<string[]> {
    return page.locator("script[data-crosscomm-ld]").evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ""));
  }

  const before = await graphs();
  expect(before.length).toBeGreaterThan(0);
  expect(before.join("\n")).toContain("App development");
  expect(before.filter((entry) => entry.includes('"@type":"Service"') || entry.includes('"@type": "Service"')).length).toBe(1);

  await openNav(page);
  await page.getByRole("banner").getByRole("link", { name: "Services", exact: true }).click();
  await expect(page).toHaveURL(/\/services\/$/);
  await settle(page);
  await serviceRow(page, "/services/healthcare-app-development/").click();
  await expect(page).toHaveURL(/\/services\/healthcare-app-development\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Healthcare app development" })).toBeVisible();
  await expect(page).toHaveTitle(/Healthcare app development/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/services\/healthcare-app-development\/$/);
  await expect.poll(async () => (await graphs()).join("\n")).toContain("Healthcare app development");
  const after = await graphs();
  expect(after.filter((entry) => entry.includes("App development")).length).toBe(0);
  expect(after.filter((entry) => entry.includes('"@type":"Service"') || entry.includes('"@type": "Service"')).length).toBe(1);
  const unmarked = await page.locator('script[type="application/ld+json"]:not([data-crosscomm-ld])').count();
  expect(unmarked).toBe(0);
});

test("review screenshots", async ({ page }, testInfo) => {
  if (testInfo.project.name === "desktop") {
    await page.goto("/");
    await shoot(page, "home-desktop");
    await page.goto("/services/app-development/");
    await shoot(page, "service-desktop");
    await page.goto("/portfolio/acs-cares/");
    await shoot(page, "case-desktop");
    await page.goto("/contact/");
    await shoot(page, "contact-desktop");
    await openReport(page);
    await shoot(page, "feedback-dialog-desktop");
    return;
  }
  await page.goto("/");
  await shoot(page, "home-mobile");
});

async function seriousAxe(page: Page, include?: string) {
  // Measure contrast at rest: let entrance and reveal transitions finish. Looping animations are skipped.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
  const builder = new AxeBuilder({ page });
  const result = await (include ? builder.include(include) : builder).analyze();
  return result.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
}

test("homepage, a service, and contact have no serious axe violations", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Full-page axe runs on desktop; both viewports check the dialog.");
  test.slow();
  for (const target of ["/", "/services/app-development/", "/contact/"]) {
    await page.goto(target);
    const serious = await seriousAxe(page);
    expect(serious, JSON.stringify(serious.map((violation) => violation.id))).toEqual([]);
  }
});

test("an open and a filled report dialog have no serious axe violations", async ({ page }) => {
  test.slow();
  await page.goto("/contact/");
  const dialog = await openReport(page);
  const opened = await seriousAxe(page, "[role=dialog], dialog");
  expect(opened, JSON.stringify(opened.map((violation) => violation.id))).toEqual([]);
  await dialog.getByRole("textbox", { name: /description/i }).fill("The phone number is easy to miss.");
  await expect(dialog.locator("pre")).toContainText("The phone number is easy to miss.");
  const filled = await seriousAxe(page, "[role=dialog], dialog");
  expect(filled, JSON.stringify(filled.map((violation) => violation.id))).toEqual([]);
});
