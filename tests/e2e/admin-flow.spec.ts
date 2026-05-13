import { test, expect } from "../fixtures/auth.fixture";

test.describe("Área de administração", () => {

  test.use({ asAdmin: true } as any);

  test("admin dashboard carrega", async ({ page }) => {
    await expect(page).toHaveURL("/admin");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("admin consegue aceder /app também", async ({ page }) => {
    await page.goto("/app");
    await expect(page).not.toHaveURL("/login");
    await expect(page).not.toHaveURL("/403");
  });

});