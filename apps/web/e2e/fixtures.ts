import { test as base, expect, Page } from "@playwright/test";

/**
 * Custom test fixtures for SPARC RPG E2E tests
 */

// Test user credentials
export const TEST_USER = {
  email: "test@sparc.rpg",
  password: "TestPassword123!",
  displayName: "TestHero",
};

// Mock character data
export const TEST_CHARACTER = {
  name: "TestWarrior",
  class: "warrior",
};

// Helper functions
export async function mockAuthState(page: Page): Promise<void> {
  // Set up mock auth state in localStorage
  await page.addInitScript(() => {
    localStorage.setItem(
      "sparc-auth",
      JSON.stringify({
        user: {
          id: "test-user-id",
          email: "test@sparc.rpg",
          displayName: "TestHero",
        },
        isAuthenticated: true,
      })
    );
  });
}

export async function clearStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function mockCharacters(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const mockChars = [
      {
        id: "char-1",
        name: "Kael the Brave",
        class: "warrior",
        level: 1,
        hp: { current: 20, max: 20 },
        attributes: { strength: 3, perception: 1, agility: 1, resilience: 2, charisma: 1 },
        equipment: [],
        abilities: [],
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem("sparc-characters", JSON.stringify(mockChars));
  });
}

export async function mockAdventures(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const testAdventureId = "test-adventure-1";
    const mockAdventure = {
      id: testAdventureId,
      title: "Test Adventure",
      description: "A test adventure for E2E testing",
      startNodeId: "node-1",
      nodes: [
        {
          id: "node-1",
          adventureId: testAdventureId,
          type: "story",
          position: { x: 100, y: 200 },
          title: "Beginning",
          content: "Your adventure begins here...",
          imageVisibleToPlayers: true,
          isVictoryNode: false,
          isFailureNode: false,
          experienceReward: 0,
          itemRewards: [],
          data: { objectives: [] },
        },
      ],
      connections: [],
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`sparc-adventure-${testAdventureId}`, JSON.stringify(mockAdventure));
    
    // Also store in adventures list
    localStorage.setItem("sparc-adventures", JSON.stringify([mockAdventure]));
  });
}

// Custom test fixture with authenticated state
export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await mockAuthState(page);
    await mockCharacters(page);
    await mockAdventures(page);
    await use(page);
  },
});

export { expect };
