import { test, expect } from "@playwright/test";

test.describe("Autenticação", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("página de login carrega corretamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Senha")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("login com credenciais inválidas mostra erro", async ({ page }) => {
    await page.getByLabel("Email").fill("errado@test.com");
    await page.getByLabel("Senha").fill("senhaerrada");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Credenciais inválidas")).toBeVisible();
    await expect(page).toHaveURL("/login"); // não saiu da página
  });

  test("login como USER redireciona para /app", async ({ page }) => {
    await page.getByLabel("Email").fill("user@test.com");
    await page.getByLabel("Senha").fill("password123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/app");
  });

  test("login como ADMIN redireciona para /admin", async ({ page }) => {
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Senha").fill("password123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/admin");
  });

  test("utilizador não autenticado é redirecionado para login", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL("/login");
  });

  test("utilizador não autenticado não acede /admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/login");
  });

  test("USER autenticado não acede /admin e vê 403", async ({ page }) => {
    // Faz login como USER
    await page.getByLabel("Email").fill("user@test.com");
    await page.getByLabel("Senha").fill("password123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("/app");

    // Tenta aceder à área de admin vai rolar um 403 seguro!
    await page.goto("/admin");
    await expect(page).toHaveURL("/403");
  });

});