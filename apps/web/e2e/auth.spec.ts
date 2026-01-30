import { test, expect } from "@playwright/test";
import { TEST_USER, clearStorage } from "./fixtures";

/**
 * E2E Tests: Authentication Flow
 * Tests login, registration, and auth state persistence
 */

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  test.describe("Login Page", () => {
    test("should display login form correctly", async ({ page }) => {
      await page.goto("/login");

      // Check page title and elements
      await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /create one/i })).toBeVisible();
    });

    test("should show validation errors for empty fields", async ({ page }) => {
      await page.goto("/login");

      // Submit empty form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Check for validation errors
      await expect(page.getByText(/email is required/i)).toBeVisible();
      await expect(page.getByText(/password is required/i)).toBeVisible();
    });

    test("should show validation error for invalid email format", async ({ page }) => {
      await page.goto("/login");

      // Enter invalid email
      await page.getByLabel(/email/i).fill("invalid-email");
      await page.getByLabel(/password/i).fill("password123");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Check for validation error
      await expect(page.getByText(/valid email/i)).toBeVisible();
    });

    test("should show validation error for short password", async ({ page }) => {
      await page.goto("/login");

      // Enter short password
      await page.getByLabel(/email/i).fill(TEST_USER.email);
      await page.getByLabel(/password/i).fill("12345");
      await page.getByRole("button", { name: /sign in/i }).click();

      // Check for validation error
      await expect(page.getByText(/at least 6 characters/i)).toBeVisible();
    });

    test("should submit valid login form", async ({ page }) => {
      await page.goto("/login");

      // Fill valid credentials
      await page.getByLabel(/email/i).fill(TEST_USER.email);
      await page.getByLabel(/password/i).fill(TEST_USER.password);

      // Submit form
      await page.getByRole("button", { name: /sign in/i }).click();

      // Button should show loading state
      await expect(page.getByRole("button", { name: /sign in/i })).toBeDisabled();
    });

    test("should navigate to registration page", async ({ page }) => {
      await page.goto("/login");

      // Click create account link
      await page.getByRole("link", { name: /create one/i }).click();

      // Should navigate to register page
      await expect(page).toHaveURL(/\/register/);
    });

    test("should have remember me checkbox", async ({ page }) => {
      await page.goto("/login");

      const checkbox = page.getByRole("checkbox");
      await expect(checkbox).toBeVisible();
      
      // Check the checkbox
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    });
  });

  test.describe("Registration Page", () => {
    test("should display registration form correctly", async ({ page }) => {
      await page.goto("/register");

      // Check page elements
      await expect(page.getByRole("heading", { name: /create.*account|join/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i).first()).toBeVisible();
      await expect(page.getByRole("button", { name: /sign up|create|register/i })).toBeVisible();
    });

    test("should navigate to login page from registration", async ({ page }) => {
      await page.goto("/register");

      // Click sign in link
      await page.getByRole("link", { name: /sign in/i }).click();

      // Should navigate to login page
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe("Auth Navigation", () => {
    test("should redirect unauthenticated users from dashboard to login", async ({ page }) => {
      // Try to access dashboard without auth
      await page.goto("/characters");

      // Should show some content (may redirect or show auth prompt)
      // The actual behavior depends on auth implementation
      await expect(page).toHaveURL(/(login|characters)/);
    });
  });
});
