import { test, expect } from "@playwright/test";

test.describe("CommunityCircle Smoke Tests", () => {
  test("landing page loads and shows hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CommunityCircle/);
    await expect(page.locator("text=Your Neighborhood")).toBeVisible();
  });

  test("landing page shows navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/guidelines"]')).toBeVisible();
    await expect(page.locator('a[href="/auth/sign-in"]').first()).toBeVisible();
    await expect(page.locator('a[href="/auth/sign-up"]').first()).toBeVisible();
  });

  test("guidelines page loads", async ({ page }) => {
    await page.goto("/guidelines");
    await expect(page.locator("text=Community Guidelines")).toBeVisible();
    await expect(page.locator("text=Family-Friendly Always")).toBeVisible();
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("text=Privacy Policy")).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.locator("text=Terms of Service")).toBeVisible();
  });

  test("help page loads with FAQ", async ({ page }) => {
    await page.goto("/help");
    await expect(page.locator("text=Help & FAQ")).toBeVisible();
    await expect(page.locator("text=What is CommunityCircle")).toBeVisible();
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page.locator("text=Welcome back")).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("sign-up page loads", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await expect(page.locator("text=Create your account")).toBeVisible();
  });

  test("unauthenticated user is redirected from app", async ({ page }) => {
    await page.goto("/app");
    await page.waitForURL(/\/auth\/sign-in/);
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });

  test("sign in flow works with seeded admin", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await page.fill('input[name="email"]', "admin@communitycircle.local");
    await page.fill('input[name="password"]', "password123!");
    await page.click('button[type="submit"]');

    // Should redirect to app
    await page.waitForURL(/\/app/, { timeout: 10000 });
    await expect(page.locator("text=Feed")).toBeVisible();
  });
});
