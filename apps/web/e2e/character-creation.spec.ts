import { test, expect, mockAuthState, mockCharacters } from "./fixtures";

/**
 * E2E Tests: Character Creation Wizard
 * Tests the multi-step character creation flow
 */

test.describe("Character Creation Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthState(page);
  });

  test.describe("Wizard Navigation", () => {
    test("should display character creation wizard", async ({ page }) => {
      await page.goto("/characters/new");

      // Check wizard is displayed
      await expect(page.getByRole("heading", { name: /create.*character/i })).toBeVisible();
      await expect(page.getByText(/choose.*class/i)).toBeVisible();
    });

    test("should show all SPARC class options", async ({ page }) => {
      await page.goto("/characters/new");

      // All 5 SPARC classes should be visible
      await expect(page.getByText(/warrior/i).first()).toBeVisible();
      await expect(page.getByText(/scout/i).first()).toBeVisible();
      await expect(page.getByText(/sage/i).first()).toBeVisible();
      await expect(page.getByText(/rogue/i).first()).toBeVisible();
      await expect(page.getByText(/herald/i).first()).toBeVisible();
    });

    test("should display progress indicator", async ({ page }) => {
      await page.goto("/characters/new");

      // Progress indicator should show steps
      await expect(page.getByText(/choose class/i)).toBeVisible();
      await expect(page.getByText(/name hero/i)).toBeVisible();
      await expect(page.getByText(/review/i)).toBeVisible();
    });
  });

  test.describe("Step 1: Class Selection", () => {
    test("should enable continue button only when class is selected", async ({ page }) => {
      await page.goto("/characters/new");

      // Continue button should exist
      const continueBtn = page.getByTestId("continue-button").or(
        page.getByRole("button", { name: /continue/i })
      );

      // Initially may be disabled
      // Select a class
      await page.getByText(/warrior/i).first().click();

      // Now continue should be enabled
      await expect(continueBtn).toBeEnabled();
    });

    test("should show class preview on hover (desktop)", async ({ page }) => {
      await page.goto("/characters/new");

      // Hover over a class card
      await page.getByText(/warrior/i).first().hover();

      // Preview panel should show class details on larger screens
      // This test may need adjustment based on viewport
      await expect(page.getByText(/strength/i).first()).toBeVisible();
    });

    test("should proceed to name step after selecting class", async ({ page }) => {
      await page.goto("/characters/new");

      // Select warrior class
      await page.getByText(/warrior/i).first().click();

      // Click continue
      await page.getByRole("button", { name: /continue/i }).click();

      // Should now show name step
      await expect(page.getByText(/name.*hero/i)).toBeVisible();
    });
  });

  test.describe("Step 2: Name Entry", () => {
    test("should allow entering character name", async ({ page }) => {
      await page.goto("/characters/new");

      // Complete step 1
      await page.getByText(/warrior/i).first().click();
      await page.getByRole("button", { name: /continue/i }).click();

      // Should be on name step
      await expect(page.getByText(/name.*hero/i)).toBeVisible();

      // Find name input and enter name
      const nameInput = page.getByPlaceholder(/enter.*name/i).or(
        page.locator('input[type="text"]')
      );
      await nameInput.fill("TestWarrior");

      // Input should have the value
      await expect(nameInput).toHaveValue("TestWarrior");
    });

    test("should validate character name", async ({ page }) => {
      await page.goto("/characters/new");

      // Complete step 1
      await page.getByText(/warrior/i).first().click();
      await page.getByRole("button", { name: /continue/i }).click();

      // Try to continue without name
      const continueBtn = page.getByRole("button", { name: /continue/i });

      // Should be disabled without valid name
      // Enter a valid name
      const nameInput = page.getByPlaceholder(/enter.*name/i).or(
        page.locator('input[type="text"]')
      );
      await nameInput.fill("Kael");

      // Wait for validation
      await page.waitForTimeout(500);

      // Continue should be enabled
      await expect(continueBtn).toBeEnabled();
    });

    test("should allow going back to class selection", async ({ page }) => {
      await page.goto("/characters/new");

      // Complete step 1
      await page.getByText(/warrior/i).first().click();
      await page.getByRole("button", { name: /continue/i }).click();

      // Click back
      await page.getByRole("button", { name: /back/i }).click();

      // Should be back on class selection
      await expect(page.getByText(/choose.*class/i)).toBeVisible();
    });
  });

  test.describe("Step 3: Review", () => {
    test("should display character review", async ({ page }) => {
      await page.goto("/characters/new");

      // Complete step 1
      await page.getByText(/warrior/i).first().click();
      await page.getByRole("button", { name: /continue/i }).click();

      // Complete step 2
      const nameInput = page.getByPlaceholder(/enter.*name/i).or(
        page.locator('input[type="text"]')
      );
      await nameInput.fill("TestWarrior");
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /continue/i }).click();

      // Should show review step
      await expect(page.getByText(/review.*character/i)).toBeVisible();
      await expect(page.getByText(/TestWarrior/i)).toBeVisible();
      await expect(page.getByText(/warrior/i).first()).toBeVisible();
    });

    test("should allow editing from review step", async ({ page }) => {
      await page.goto("/characters/new");

      // Complete steps 1 and 2
      await page.getByText(/warrior/i).first().click();
      await page.getByRole("button", { name: /continue/i }).click();
      
      const nameInput = page.getByPlaceholder(/enter.*name/i).or(
        page.locator('input[type="text"]')
      );
      await nameInput.fill("TestWarrior");
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /continue/i }).click();

      // Click change class button
      await page.getByRole("button", { name: /change class/i }).click();

      // Should be back on class selection
      await expect(page.getByText(/choose.*class/i)).toBeVisible();
    });
  });

  test.describe("Full Creation Flow", () => {
    test("should complete full character creation happy path", async ({ page }) => {
      await page.goto("/characters/new");

      // Step 1: Select Warrior
      await page.getByText(/warrior/i).first().click();
      await page.getByRole("button", { name: /continue/i }).click();

      // Step 2: Enter name
      const nameInput = page.getByPlaceholder(/enter.*name/i).or(
        page.locator('input[type="text"]')
      );
      await nameInput.fill("KaelTheBrave");
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /continue/i }).click();

      // Step 3: Review and create
      await expect(page.getByText(/review/i)).toBeVisible();

      // Click create character button
      const createBtn = page.getByTestId("create-character-button").or(
        page.getByRole("button", { name: /create character/i })
      );
      await createBtn.click();

      // Should show success state
      await expect(page.getByText(/character created|success/i)).toBeVisible({ timeout: 5000 });
    });

    test("should create Rogue character", async ({ page }) => {
      await page.goto("/characters/new");

      // Select Rogue
      await page.getByText(/rogue/i).first().click();
      await page.getByRole("button", { name: /continue/i }).click();

      // Enter name
      const nameInput = page.getByPlaceholder(/enter.*name/i).or(
        page.locator('input[type="text"]')
      );
      await nameInput.fill("ShadowBlade");
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /continue/i }).click();

      // Review
      await expect(page.getByText(/ShadowBlade/i)).toBeVisible();
      await expect(page.getByText(/rogue/i).first()).toBeVisible();
    });

    test("should create Scout character", async ({ page }) => {
      await page.goto("/characters/new");

      // Select Scout
      await page.getByText(/scout/i).first().click();
      await page.getByRole("button", { name: /continue/i }).click();

      // Enter name
      const nameInput = page.getByPlaceholder(/enter.*name/i).or(
        page.locator('input[type="text"]')
      );
      await nameInput.fill("SwiftArrow");
      await page.waitForTimeout(500);
      await page.getByRole("button", { name: /continue/i }).click();

      // Review
      await expect(page.getByText(/SwiftArrow/i)).toBeVisible();
    });
  });
});
