/**
 * Captures project screenshots from their live URLs into public/images/projects.
 *
 *   npm run capture
 *
 * Uses the locally installed Chrome (or Edge), so no browser download is needed.
 * Re-run whenever a project's website changes.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, devices, type Browser, type Page } from "playwright-core";
import { PROJECTS, SCREENSHOTS, projectScreenshot, type Shot } from "../src/content/site";

/** Browser identity used for phone shots, so sites serve their mobile layout. */
const PHONE = devices["iPhone 14"];

/** Time for intro animations and lazy images to settle after load. */
const SETTLE_MS = 3000;

/** "Reject" buttons of common cookie banners (Slovenian and English). */
const REJECT_COOKIES = /^\s*(zavrni( vse| izbirne)?|reject( all)?|decline)\s*$/i;

/** Dismisses a cookie banner, if any, by declining optional cookies. */
async function dismissCookieBanner(page: Page) {
  const button = page.getByRole("button", { name: REJECT_COOKIES }).first();
  if (await button.isVisible().catch(() => false)) {
    await button.click();
    await page.waitForTimeout(800);
  }
}

async function launchBrowser(): Promise<Browser> {
  for (const channel of ["chrome", "msedge"]) {
    try {
      return await chromium.launch({ channel });
    } catch {
      // Try the next installed browser.
    }
  }
  throw new Error("No Chrome or Edge installation found.");
}

async function capture(browser: Browser, url: string, shot: Shot, publicUrl: string) {
  const file = path.join("public", publicUrl);
  await mkdir(path.dirname(file), { recursive: true });

  const page = await browser.newPage({
    viewport: shot.viewport,
    deviceScaleFactor: shot.deviceScaleFactor,
    ...(shot.mobile && { userAgent: PHONE.userAgent, isMobile: true, hasTouch: true }),
  });
  try {
    await page.goto(url, { waitUntil: "load", timeout: 60_000 });
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);
    await dismissCookieBanner(page);
    await page.screenshot({ path: file });
    console.log(`✓ ${file}`);
  } finally {
    await page.close();
  }
}

async function main() {
  const browser = await launchBrowser();
  try {
    for (const project of PROJECTS) {
      await capture(browser, project.url, SCREENSHOTS[project.cardView], projectScreenshot(project.slug, "card"));
      await capture(browser, project.url, SCREENSHOTS.cover, projectScreenshot(project.slug, "cover"));
      await capture(browser, project.url, SCREENSHOTS.phone, projectScreenshot(project.slug, "phone"));
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
