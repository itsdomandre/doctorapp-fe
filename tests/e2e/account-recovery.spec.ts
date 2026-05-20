import { test, expect } from "@playwright/test";

test.describe("Recuperação de senha", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forgot-password");
  });

  test("página carrega corretamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Recuperar senha" })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Enviar link de recuperação" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Voltar ao login" })).toBeVisible();
  });

  test("email inválido mostra erro de validação", async ({ page }) => {
    await page.locator("form").evaluate((f) => f.setAttribute("novalidate", ""));
    await page.locator('input[name="email"]').fill("invalido");
    await page.getByRole("button", { name: "Enviar link de recuperação" }).click();
    await expect(page.getByText("Email inválido")).toBeVisible();
    await expect(page).toHaveURL("/forgot-password");
  });

  test("submeter email válido mostra mensagem de sucesso", async ({ page }) => {
    await page.locator('input[name="email"]').fill("qualquer@example.com");
    await page.getByRole("button", { name: "Enviar link de recuperação" }).click();
    await expect(
      page.getByText("Se o email existir na nossa plataforma, receberá um link em breve.")
    ).toBeVisible();
  });

  test("resposta é igual para email existente e inexistente (segurança)", async ({ page }) => {
    // Existing email
    await page.locator('input[name="email"]').fill("andre@example.com");
    await page.getByRole("button", { name: "Enviar link de recuperação" }).click();
    await expect(
      page.getByText("Se o email existir na nossa plataforma, receberá um link em breve.")
    ).toBeVisible();

    // Unknown email — same message expected
    await page.goto("/forgot-password");
    await page.locator('input[name="email"]').fill("naoexiste@example.com");
    await page.getByRole("button", { name: "Enviar link de recuperação" }).click();
    await expect(
      page.getByText("Se o email existir na nossa plataforma, receberá um link em breve.")
    ).toBeVisible();
  });

  test("link 'Voltar ao login' navega para /login", async ({ page }) => {
    await page.getByRole("link", { name: "Voltar ao login" }).click();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Reenvio de activação", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/resend-activation");
  });

  test("página carrega corretamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Reenviar activação" })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Reenviar email de activação" })).toBeVisible();
  });

  test("email inválido mostra erro de validação", async ({ page }) => {
    await page.locator("form").evaluate((f) => f.setAttribute("novalidate", ""));
    await page.locator('input[name="email"]').fill("invalido");
    await page.getByRole("button", { name: "Reenviar email de activação" }).click();
    await expect(page.getByText("Email inválido")).toBeVisible();
  });

  test("submeter email válido mostra mensagem de sucesso", async ({ page }) => {
    await page.locator('input[name="email"]').fill("andre@example.com");
    await page.getByRole("button", { name: "Reenviar email de activação" }).click();
    await expect(
      page.getByText("Se a conta existir e estiver pendente de activação, receberá um novo email em breve.")
    ).toBeVisible();
  });

  test("link 'Voltar ao login' navega para /login", async ({ page }) => {
    await page.getByRole("link", { name: "Voltar ao login" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("link de reenvio na página de login após erro de conta não activada", async ({ page }) => {
    // Register fresh UNVERIFIED user
    const email = `resend.${Date.now()}@example.com`;
    await page.goto("/register");
    await page.locator('input[name="firstName"]').fill("Resend");
    await page.locator('input[name="lastName"]').fill("Test");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="phoneNumber"]').fill("+351 911 222 333");
    await page.locator('input[name="birthdate"]').fill("1988-08-08");
    await page.locator('input[name="password"]').fill("Password123!");
    await page.locator('input[name="confirmPassword"]').fill("Password123!");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Verifique o seu email")).toBeVisible();

    // Try login → error → click resend link → resend-activation page
    await page.goto("/login");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill("Password123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("Conta não activada")).toBeVisible();

    await page.getByRole("link", { name: "Reenviar email de activação" }).click();
    await expect(page).toHaveURL("/resend-activation");
  });
});
