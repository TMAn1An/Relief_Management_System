import { expect, test } from "@playwright/test";
import { login, loginAsAdmin } from "./helpers";

test.describe.configure({ mode: "serial" });

test("admin area and photos require a session", async ({ page, request }) => {
  await page.goto("/admin/recipients");
  await expect(page).toHaveURL(/\/login/);
  expect((await request.get("/api/photos/anything")).status()).toBe(401);
  expect((await request.get("/api/health")).status()).toBe(200);
});

test("admin manages staff; staff are restricted and deactivation is immediate", async ({ page, browser }) => {
  await loginAsAdmin(page);
  await expect(page.getByText(/temporary password/)).toBeVisible(); // seeded admin must pick their own

  await page.goto("/admin/users");
  await page.getByLabel("Full name").fill("Karim Uddin");
  await page.getByLabel("Email").fill("karim@example.com");
  await page.getByLabel("Temporary password").fill("temp-pass-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("Account created")).toBeVisible();

  const staff = await (await browser.newContext()).newPage();
  await login(staff, "karim@example.com", "temp-pass-123");
  await expect(staff).toHaveURL(/\/admin$/);
  await staff.goto("/admin/users");
  await expect(staff).toHaveURL(/denied=1/);

  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Deactivate" }).click();
  await expect(page.getByText("Deactivated", { exact: true })).toBeVisible();
  await staff.goto("/admin");
  await expect(staff).toHaveURL(/\/login/);
});

test("users can change their own password", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/account");
  await page.getByLabel("Current password").fill("wrong-password");
  await page.getByLabel("New password", { exact: true }).fill("a-brand-new-pass-1");
  await page.getByLabel("Confirm new password").fill("a-brand-new-pass-1");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByText("current password is incorrect")).toBeVisible();

  await page.getByLabel("Current password").fill("admin12345");
  await page.getByLabel("New password", { exact: true }).fill("a-brand-new-pass-1");
  await page.getByLabel("Confirm new password").fill("a-brand-new-pass-1");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByText("Your password has been updated")).toBeVisible();
});

test("repeated failed sign-ins are rate limited", async ({ page }) => {
  for (let i = 1; i <= 8; i++) {
    await login(page, "victim@example.com", `wrong-${i}`);
    await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  }
  await login(page, "victim@example.com", "wrong-9");
  await expect(page.getByText(/Too many attempts/)).toBeVisible();
});

test("the UI switches to Bangla and keeps the choice", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "বাংলা" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ত্রাণ");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
});
