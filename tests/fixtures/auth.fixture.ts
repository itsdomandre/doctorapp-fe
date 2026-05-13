import { test as base, expect } from "@playwright/test";

const USERS = {
  user:  { email: "andre@example.com",  password: "Password123!", role: "USER"  },
  admin: { email: "deise@example.com", password: "Password123!", role: "ADMIN" },
};

type AuthFixtures = {
  asUser:  void;
  asAdmin: void;
};

export const test = base.extend<AuthFixtures>({
  asUser: async ({ page }, use) => {
    await loginAs(page, USERS.user);
    await use();
  },
  asAdmin: async ({ page }, use) => {
    await loginAs(page, USERS.admin);
    await use();
  },
});

async function loginAs(
  page: import("@playwright/test").Page,
  credentials: { email: string; password: string }
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Senha").fill(credentials.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  // Aguarda redirecionamento — sinal que o login foi bem sucedido
  await page.waitForURL(/\/(app|admin)/);
}

export { expect };