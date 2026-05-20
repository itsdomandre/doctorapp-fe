import { test, expect } from "@playwright/test";

async function fillRegisterForm(
  page: any,
  overrides: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    birthdate: string;
    password: string;
    confirmPassword: string;
  }> = {}
) {
  const defaults = {
    firstName: "Novo",
    lastName: "Utilizador",
    email: `test.${Date.now()}@example.com`,
    phoneNumber: "+351 912 000 000",
    birthdate: "1995-06-15",
    password: "Password123!",
    confirmPassword: "Password123!",
  };
  const data = { ...defaults, ...overrides };
  await page.locator('input[name="firstName"]').fill(data.firstName);
  await page.locator('input[name="lastName"]').fill(data.lastName);
  await page.locator('input[name="email"]').fill(data.email);
  await page.locator('input[name="phoneNumber"]').fill(data.phoneNumber);
  await page.locator('input[name="birthdate"]').fill(data.birthdate);
  await page.locator('input[name="password"]').fill(data.password);
  await page.locator('input[name="confirmPassword"]').fill(data.confirmPassword);
  return data;
}

test.describe("Registo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("página de registo carrega com todos os campos", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Criar conta" })).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phoneNumber"]')).toBeVisible();
    await expect(page.locator('input[name="birthdate"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Criar conta" })).toBeVisible();
  });

  test("link para login está presente", async ({ page }) => {
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  });

  test("submeter formulário vazio mostra erros obrigatórios", async ({ page }) => {
    await page.getByRole("button", { name: "Criar conta" }).click();
    const errors = page.getByText("Obrigatório");
    await expect(errors.first()).toBeVisible();
    expect(await errors.count()).toBeGreaterThanOrEqual(3);
  });

  test("email inválido mostra erro de validação", async ({ page }) => {
    await page.locator("form").evaluate((f) => f.setAttribute("novalidate", ""));
    await page.locator('input[name="email"]').fill("not-an-email");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Email inválido")).toBeVisible();
  });

  test("senha sem maiúscula mostra erro", async ({ page }) => {
    await page.locator('input[name="password"]').fill("password1!");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Deve conter pelo menos uma maiúscula")).toBeVisible();
  });

  test("senha sem carácter especial mostra erro", async ({ page }) => {
    await page.locator('input[name="password"]').fill("Password1");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Deve conter pelo menos um carácter especial")).toBeVisible();
  });

  test("senha com menos de 8 caracteres mostra erro", async ({ page }) => {
    await page.locator('input[name="password"]').fill("Ab1!");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Mínimo 8 caracteres")).toBeVisible();
  });

  test("senhas diferentes mostram erro de confirmação", async ({ page }) => {
    await page.locator('input[name="password"]').fill("Password123!");
    await page.locator('input[name="confirmPassword"]').fill("Password456!");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("As senhas não coincidem")).toBeVisible();
  });

  test("email já registado mostra erro 409", async ({ page }) => {
    await fillRegisterForm(page, { email: "andre@example.com" });
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Este email já está registado.")).toBeVisible();
    await expect(page).toHaveURL("/register");
  });

  test("registo bem sucedido mostra ecrã de verificação de email", async ({ page }) => {
    await fillRegisterForm(page);
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByText("Verifique o seu email")).toBeVisible();
    await expect(page.getByText("Enviámos um link de activação")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ir para o login" })).toBeVisible();
  });

  test("após registo bem sucedido, link leva ao login", async ({ page }) => {
    await fillRegisterForm(page);
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByRole("link", { name: "Ir para o login" })).toBeVisible();
    await page.getByRole("link", { name: "Ir para o login" }).click();
    await expect(page).toHaveURL("/login");
  });
});
