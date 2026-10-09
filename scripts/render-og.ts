import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const card = path.join(root, "scripts/og-card.html");
const out = path.join(root, "client/public/og.png");
const cardUrl = pathToFileURL(card).href;

if (!cardUrl.startsWith("file:")) {
  throw new Error(`OG card must load from a file URL, got ${cardUrl}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});

const externalFonts: string[] = [];
await page.route("**/*", async (route) => {
  const request = route.request();
  const url = request.url();
  const isFont = request.resourceType() === "font" || /\.woff2?(?:$|\?)/i.test(url);
  if (isFont && !url.startsWith("file:")) {
    externalFonts.push(url);
    await route.abort();
    return;
  }
  await route.continue();
});

await page.goto(cardUrl);
if (externalFonts.length > 0) {
  throw new Error(`Rejected external font request: ${externalFonts.join(", ")}`);
}

const font = await page.evaluate(async () => {
  await document.fonts.ready;
  const face = [...document.fonts].find((entry) => {
    const family = entry.family.replaceAll('"', "").replaceAll("'", "");
    return family === "Archivo Narrow" && entry.weight === "700" && entry.style === "normal";
  });
  if (!face) {
    throw new Error("Archivo Narrow weight 700 normal is not registered");
  }
  await face.load();
  const check = document.fonts.check("700 16px \"Archivo Narrow\"");
  return { status: face.status, check };
});

if (font.status !== "loaded" || !font.check) {
  throw new Error(`Archivo Narrow 700 did not load (status ${font.status}, check ${font.check})`);
}

await page.screenshot({ path: out, type: "png", clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
