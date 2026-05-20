import { test, expect } from "@playwright/test";

// Helpers — form inputs use react-hook-form's `name` attribute
const emailInput = (page: any) => page.locator('input[name="email"]');
const passwordInput = (page: any) => page.locator('input[name="password"]');

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("página de login carrega corretamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    await expect(emailInput(page)).toBeVisible();
    await expect(passwordInput(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("link para registo está presente", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Registar" })).toBeVisible();
  });

  test("link para recuperar senha está presente", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Esqueceu a senha?" })).toBeVisible();
  });

  test("email inválido mostra erro de validação", async ({ page }) => {
    // Disable browser HTML5 validation so Zod can run
    await page.locator("form").evaluate((f) => f.setAttribute("novalidate", ""));
    await emailInput(page).fill("not-an-email");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Email inválido")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("credenciais inválidas mostram erro", async ({ page }) => {
    await emailInput(page).fill("errado@test.com");
    await passwordInput(page).fill("senhaerrada");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Credenciais inválidas")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("conta não activada mostra erro e link de reenvio", async ({ page }) => {
    // Register a fresh user (will be UNVERIFIED) then immediately try to login
    const email = `unverified.${Date.now()}@example.com`;

    await page.goto("/register");
    await page.locator('input[name="firstName"]').fill("Test");
    await page.locator('input[name="lastName"]').fill("User");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="phoneNumber"]').fill("+351 900 000 000");
    await page.locator('input[name="birthdate"]').fill("1990-01-01");
    await page.locator('input[name="password"]').fill("Password123!");
    await page.locator('input[name="confirmPassword"]').fill("Password123!");
    const [registerResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/auth/register")),
      page.getByRole("button", { name: "Criar conta" }).click(),
    ]);
    expect(registerResponse.status(), `Registration failed: ${registerResponse.status()}`).toBe(200);
    await expect(page.getByText("Verifique o seu email")).toBeVisible();

    await page.goto("/login");
    await emailInput(page).fill(email);
    await passwordInput(page).fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Conta não activada")).toBeVisible();
    await expect(page.getByRole("link", { name: "Reenviar email de activação" })).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("login como USER redireciona para /app", async ({ page }) => {
    await emailInput(page).fill("andre@example.com");
    await passwordInput(page).fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/app");
  });

  test("login como ADMIN redireciona para /admin", async ({ page }) => {
    await emailInput(page).fill("deise@example.com");
    await passwordInput(page).fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/admin");
  });
});

test.describe("Protecção de rotas", () => {
  test("utilizador não autenticado é redirecionado para login ao aceder /app", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL("/login");
  });

  test("utilizador não autenticado é redirecionado para login ao aceder /admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/login");
  });

  test("USER autenticado acede /admin e vê página 403", async ({ page }) => {
    await page.goto("/login");
    await emailInput(page).fill("andre@example.com");
    await passwordInput(page).fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("/app");

    await page.goto("/admin");
    await expect(page).toHaveURL("/403");
  });

  test("sessão persiste após recarregar a página", async ({ page }) => {
    await page.goto("/login");
    await emailInput(page).fill("andre@example.com");
    await passwordInput(page).fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("/app");

    await page.reload();
    await expect(page).toHaveURL("/app");
  });
});

test.describe("Logout", () => {
  test("USER consegue fazer logout e é redirecionado para /login", async ({ page }) => {
    await page.goto("/login");
    await emailInput(page).fill("andre@example.com");
    await passwordInput(page).fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("/app");

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("ADMIN consegue fazer logout e é redirecionado para /login", async ({ page }) => {
    await page.goto("/login");
    await emailInput(page).fill("deise@example.com");
    await passwordInput(page).fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("/admin");

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("após logout, /app redireciona para /login", async ({ page }) => {
    await page.goto("/login");
    await emailInput(page).fill("andre@example.com");
    await passwordInput(page).fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await page.waitForURL("/app");

    await page.getByRole("button", { name: "Sair" }).click();
    await page.waitForURL("/login");

    await page.goto("/app");
    await expect(page).toHaveURL("/login");
  });
});
