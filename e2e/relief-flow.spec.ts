import { expect, test } from "@playwright/test";
import { loginAsAdmin, photo } from "./helpers";

const NID = "1234567890";
const PHONE = "01712345678";

test.describe.configure({ mode: "serial" });

test("an applicant is validated, approved, receives items and requests monthly relief", async ({ page, browser }) => {
  // --- apply, with validation feedback that keeps the user's input ---
  await page.goto("/apply");
  await page.getByLabel("Full name").fill("Rahima Begum");
  await page.getByLabel("NID number").fill(NID);
  await page.getByLabel("Mobile number").fill(PHONE);
  await page.getByLabel("Age").fill("45");
  await page.getByLabel("Category").selectOption("ELDERLY");
  await page.getByLabel("Photo").setInputFiles(photo);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Elderly recipients must be 60 or older")).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Rahima Begum");

  await page.getByLabel("Age").fill("65");
  await page.getByLabel("Photo").setInputFiles(photo);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Application received")).toBeVisible();

  // --- the same NID can't apply twice ---
  await page.goto("/apply");
  await page.getByLabel("Full name").fill("Someone Else");
  await page.getByLabel("NID number").fill(NID);
  await page.getByLabel("Mobile number").fill("01800000000");
  await page.getByLabel("Age").fill("70");
  await page.getByLabel("Category").selectOption("WIDOW");
  await page.getByLabel("Photo").setInputFiles(photo);
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("already exists")).toBeVisible();

  // --- status check needs NID + matching phone; pending applicants can't request yet ---
  await page.goto("/status");
  await page.getByLabel("NID number").fill(NID);
  await page.getByLabel("Mobile number").fill("01999999999");
  await page.getByRole("button", { name: "Check status" }).click();
  await expect(page.getByText(/couldn't find a recipient/)).toBeVisible();
  await page.getByLabel("Mobile number").fill(PHONE);
  await page.getByRole("button", { name: "Check status" }).click();
  await expect(page.getByText("being reviewed")).toBeVisible();

  await page.goto("/request");
  await page.getByLabel("NID number").fill(NID);
  await page.getByLabel("Mobile number").fill(PHONE);
  await page.getByRole("button", { name: "Submit monthly request" }).click();
  await expect(page.getByText(/must be approved/)).toBeVisible();

  // --- staff approves; a relief card is issued ---
  await loginAsAdmin(page);
  await page.goto("/admin/approvals");
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("All caught up")).toBeVisible();
  await page.goto("/admin/recipients");
  await page.getByRole("link", { name: "Rahima Begum" }).click();
  await expect(page.getByText("000001")).toBeVisible();
  await page.getByRole("link", { name: "Print card" }).first().click();
  await expect(page.getByRole("heading", { name: "Relief card" })).toBeVisible();

  // --- distributions: the same item (any case/spacing) only once a month ---
  await page.goto("/admin/distributions");
  const record = async (item: string) => {
    await page.getByLabel("Recipient NID").fill(NID);
    await page.getByLabel("Item", { exact: true }).fill(item);
    await page.getByLabel("Quantity").fill("5");
    await page.getByRole("button", { name: "Record distribution" }).click();
  };
  await record("Rice (kg)");
  await expect(page.getByText("Recorded Rice (kg)")).toBeVisible();
  await record("  rice (KG) ");
  await expect(page.getByText(/already received/)).toBeVisible();

  // --- monthly request works once, then is blocked until next month ---
  const applicant = await (await browser.newContext()).newPage();
  const submit = async () => {
    await applicant.goto("/request");
    await applicant.getByLabel("NID number").fill(NID);
    await applicant.getByLabel("Mobile number").fill(PHONE);
    await applicant.getByRole("button", { name: "Submit monthly request" }).click();
  };
  await submit();
  await expect(applicant.getByText("Your request has been submitted")).toBeVisible();
  await submit();
  await expect(applicant.getByText("already submitted a request this month")).toBeVisible();
  await expect(applicant.getByRole("timer")).toBeVisible();
});
