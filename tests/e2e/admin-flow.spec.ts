import { test, expect } from "../fixtures/auth.fixture";

test.describe("Área de administração", () => {

  test("admin dashboard carrega", async ({ page, asAdmin }) => {
    await expect(page).toHaveURL("/admin");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("admin consegue aceder /app também", async ({ page, asAdmin }) => {
    await page.goto("/app");
    await expect(page).not.toHaveURL("/login");
    await expect(page).not.toHaveURL("/403");
  });

});