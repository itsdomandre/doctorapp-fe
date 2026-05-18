import { test, expect } from "../fixtures/auth.fixture";

test.describe("Área do utilizador", () => {

  test("dashboard carrega após login", async ({ page, asUser }) => {
    await expect(page).toHaveURL("/app");
    await expect(
      page.getByRole("heading", { name: "Meus Agendamentos" })
    ).toBeVisible();
  });

});