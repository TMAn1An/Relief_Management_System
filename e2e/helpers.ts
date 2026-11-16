import { expect, type Page } from "@playwright/test";

// 1x1 PNG
export const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

export const photo = { name: "photo.png", mimeType: "image/png", buffer: PNG };

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/^email$/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

export async function loginAsAdmin(page: Page) {
  await login(page, "admin@example.com", "admin12345");
  await expect(page).toHaveURL(/\/admin$/);
}
