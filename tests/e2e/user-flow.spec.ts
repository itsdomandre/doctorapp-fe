import { test, expect } from "../fixtures/auth.fixture";

test.describe("Área do utilizador", () => {

  test.use({ asUser: true } as any);

  test("dashboard carrega após login", async ({ page }) => {
    await expect(page).toHaveURL("/app");
    await expect(
      page.getByRole("heading", { name: "Meus Agendamentos" })
    ).toBeVisible();
  });

});