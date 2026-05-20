import { test, expect, type Page } from "@playwright/test";
import { USER_MOCK, ADMIN_MOCK, EMPTY_PAGE } from "../fixtures/mocks";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function fillLoginForm(page: Page, email: string, password: string) {
  await page.locator('[name="email"]').fill(email);
  await page.locator('[name="password"]').fill(password);
}

const VALID_REGISTER = {
  firstName: "Ana",
  lastName: "Silva",
  email: "ana@exemplo.com",
  phoneNumber: "+351 912 345 678",
  birthdate: "1990-01-01",
  password: "Senha@123",
  confirmPassword: "Senha@123",
};

async function fillRegisterForm(page: Page, overrides: Partial<typeof VALID_REGISTER> = {}) {
  const data = { ...VALID_REGISTER, ...overrides };
  await page.locator('[name="firstName"]').fill(data.firstName);
  await page.locator('[name="lastName"]').fill(data.lastName);
  await page.locator('[name="email"]').fill(data.email);
  await page.locator('[name="phoneNumber"]').fill(data.phoneNumber);
  await page.locator('[name="birthdate"]').fill(data.birthdate);
  await page.locator('[name="password"]').fill(data.password);
  await page.locator('[name="confirmPassword"]').fill(data.confirmPassword);
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

test.describe("Login - validação de formulário", () => {
  test.beforeEach(async ({ page }) => {
    // Simula estado não autenticado: initialize() recebe 401 e define user=null
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ status: 401 })
    );
    await page.goto("/login");
  });

  test("mostra erros de validação ao submeter formulário vazio", async ({ page }) => {
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Email inválido")).toBeVisible();
    await expect(page.getByText("Informe a senha")).toBeVisible();
  });

  test("mostra erro de validação para email com formato inválido", async ({ page }) => {
    await page.locator('[name="email"]').fill("nao-e-um-email");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Email inválido")).toBeVisible();
  });

  test("mostra erro para credenciais inválidas (401)", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({ status: 401 })
    );

    await fillLoginForm(page, "user@test.com", "senhaerrada");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Credenciais inválidas")).toBeVisible();
  });

  test("mostra erro e link de reactivação para conta não activada (403)", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({ status: 403 })
    );

    await fillLoginForm(page, "user@test.com", "Senha@123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText("Conta não activada")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Reenviar email de activação" })
    ).toBeVisible();
  });

  test("exibe banner de sucesso quando senha foi redefinida (?reset=success)", async ({ page }) => {
    await page.goto("/login?reset=success");

    await expect(page.getByText("Senha redefinida com sucesso")).toBeVisible();
  });
});

test.describe("Login - redirecionamento após autenticação", () => {
  // Configura o mock de sessão de forma incremental:
  // 1ª chamada a /api/auth/me (app init) → 401 (utilizador não autenticado)
  // 2ª chamada a /api/auth/me (handler de login) → objeto user
  async function setupLoginMocks(
    page: Page,
    user: typeof USER_MOCK | typeof ADMIN_MOCK
  ) {
    // Catch-all para silenciar chamadas das páginas pós-login (menor prioridade LIFO)
    await page.route("**/api/**", (route) =>
      route.fulfill({ json: EMPTY_PAGE })
    );

    await page.route("**/api/auth/login", (route) =>
      route.fulfill({ status: 200 })
    );

    let callCount = 0;
    await page.route("**/api/auth/me", (route) => {
      callCount++;
      route.fulfill(callCount === 1 ? { status: 401 } : { json: user });
    });
  }

  test("redireciona utilizador (USER) para /app após login bem-sucedido", async ({ page }) => {
    await setupLoginMocks(page, USER_MOCK);

    await page.goto("/login");
    await fillLoginForm(page, USER_MOCK.email, "Senha@123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/app");
  });

  test("redireciona administrador (ADMIN) para /admin após login bem-sucedido", async ({ page }) => {
    await setupLoginMocks(page, ADMIN_MOCK);

    await page.goto("/login");
    await fillLoginForm(page, ADMIN_MOCK.email, "Senha@123");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL("/admin");
  });
});

// ─── REGISTER ────────────────────────────────────────────────────────────────

test.describe("Register - validação de formulário", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ status: 401 })
    );
    await page.goto("/register");
  });

  test("mostra erros de campos obrigatórios ao submeter formulário vazio", async ({ page }) => {
    await page.getByRole("button", { name: "Criar conta" }).click();

    // Zod valida todos os campos — verifica que pelo menos os erros base aparecem
    await expect(page.getByText("Obrigatório").first()).toBeVisible();
    await expect(page.getByText("Email inválido")).toBeVisible();
    await expect(page.getByText("Mínimo 8 caracteres")).toBeVisible();
  });

  test("mostra erro para email com formato inválido", async ({ page }) => {
    await page.locator('[name="email"]').fill("nao-e-email");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Email inválido")).toBeVisible();
  });

  test("mostra erro para senha com menos de 8 caracteres", async ({ page }) => {
    await page.locator('[name="password"]').fill("abc");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Mínimo 8 caracteres")).toBeVisible();
  });

  test("mostra erro para senha sem letra maiúscula", async ({ page }) => {
    await page.locator('[name="password"]').fill("senha@123");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Deve conter pelo menos uma maiúscula")).toBeVisible();
  });

  test("mostra erro para senha sem carácter especial", async ({ page }) => {
    await page.locator('[name="password"]').fill("SenhaForte123");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Deve conter pelo menos um carácter especial")).toBeVisible();
  });

  test("mostra erro quando as senhas não coincidem", async ({ page }) => {
    await page.locator('[name="password"]').fill("Senha@123");
    await page.locator('[name="confirmPassword"]').fill("Senha@456");
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("As senhas não coincidem")).toBeVisible();
  });
});

test.describe("Register - submissão de formulário", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({ status: 401 })
    );
    await page.goto("/register");
  });

  test("exibe ecrã de verificação de email após registo bem-sucedido (201)", async ({ page }) => {
    await page.route("**/api/auth/register", (route) =>
      route.fulfill({ status: 201 })
    );

    await fillRegisterForm(page);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Verifique o seu email")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ir para o login" })
    ).toBeVisible();
  });

  test("mostra erro de conflito para email já registado (409)", async ({ page }) => {
    await page.route("**/api/auth/register", (route) =>
      route.fulfill({ status: 409 })
    );

    await fillRegisterForm(page);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Este email já está registado.")).toBeVisible();
  });

  test("mostra erro genérico para falha no servidor (500)", async ({ page }) => {
    await page.route("**/api/auth/register", (route) =>
      route.fulfill({ status: 500 })
    );

    await fillRegisterForm(page);
    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page.getByText("Erro ao criar conta. Tente novamente.")).toBeVisible();
  });
});
