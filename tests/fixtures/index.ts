import { test as base, type Page } from "@playwright/test";
import { USER_MOCK, ADMIN_MOCK } from "./mocks";

/**
 * Fixtures que pré-configuram /api/auth/me para simular uma sessão activa.
 * Usados em specs de páginas protegidas (não em auth.spec.ts).
 *
 * userPage  → sessão com role USER
 * adminPage → sessão com role ADMIN
 */
type Fixtures = {
  userPage: Page;
  adminPage: Page;
};

export const test = base.extend<Fixtures>({
  userPage: async ({ page }, use) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ json: USER_MOCK })
    );
    await use(page);
  },

  adminPage: async ({ page }, use) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ json: ADMIN_MOCK })
    );
    await use(page);
  },
});

export { expect } from "@playwright/test";
