import { test, expect } from "@playwright/test";

async function loginAsUser(page: any) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill("andre@example.com");
  await page.locator('input[name="password"]').fill("Password123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("/app");
}

async function loginAsAdmin(page: any) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill("deise@example.com");
  await page.locator('input[name="password"]').fill("Password123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("/admin");
}

function nextBusinessDay(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 6) d.setDate(d.getDate() + 1); // skip Saturday
  return d.toISOString().slice(0, 10);
}

async function createRequestedAppointment(page: any, procedure: string): Promise<void> {
  await loginAsUser(page);
  await page.goto("/app/appointments/new");

  const date = nextBusinessDay();
  await page.locator('input[name="date"]').fill(date);
  await page.locator('input[name="date"]').dispatchEvent("change");

  const slotSelect = page.locator('select[name="slot"]');
  await expect(slotSelect).toBeEnabled({ timeout: 10000 });
  const firstSlot = page.locator('select[name="slot"] option:not([value=""])').first();
  await expect(firstSlot).toBeAttached({ timeout: 5000 });
  const slotValue = await firstSlot.getAttribute("value");
  await slotSelect.selectOption(slotValue!);
  await page.locator('select[name="procedure"]').selectOption(procedure);

  const [res] = await Promise.all([
    page.waitForResponse(
      (r: any) => r.url().includes("/api/appointment") && r.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Solicitar agendamento" }).click(),
  ]);
  expect(res.status(), `Appointment creation failed: ${res.status()}`).toBe(200);
  await page.waitForURL("/app/appointments");

  // Logout user
  await page.getByRole("button", { name: "Sair" }).click();
  await page.waitForURL("/login");
}

test.describe("Agendamentos — painel admin", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin/appointments");
  });

  test("página de agendamentos carrega corretamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Agendamentos" })).toBeVisible();
    await expect(page.getByPlaceholder("Pesquisar por paciente…")).toBeVisible();
    await expect(page.locator("select").first()).toBeVisible();
  });

  test("tabela tem os cabeçalhos corretos", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Paciente" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Procedimento" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Estado" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Ações" })).toBeVisible();
  });

  test("filtrar por REQUESTED mostra botões de aprovação", async ({ page }) => {
    await createRequestedAppointment(page, "LASER_THERAPY");
    await loginAsAdmin(page);
    await page.goto("/admin/appointments");

    await page.locator("select").first().selectOption("REQUESTED");
    await page.waitForResponse((r: any) => r.url().includes("/api/appointment/search"));

    await expect(page.getByRole("button", { name: "Aprovar" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Rejeitar" }).first()).toBeVisible();
  });

  test("aprovar agendamento mostra painel de confirmação e confirma", async ({ page }) => {
    await createRequestedAppointment(page, "BOTOX");
    await loginAsAdmin(page);
    await page.goto("/admin/appointments");

    await page.locator("select").first().selectOption("REQUESTED");
    await page.waitForResponse((r: any) => r.url().includes("/api/appointment/search"));

    await page.getByRole("button", { name: "Aprovar" }).first().click();
    await expect(page.getByText("Confirmar aprovação")).toBeVisible();

    const [confirmRes] = await Promise.all([
      page.waitForResponse(
        (r: any) => r.url().includes("/api/appointment") && r.request().method() === "PUT"
      ),
      page.getByRole("button", { name: "Confirmar" }).click(),
    ]);
    expect(confirmRes.status(), `Approval failed: ${confirmRes.status()}`).toBe(200);
    await expect(page.getByText("Confirmar aprovação")).not.toBeVisible({ timeout: 5000 });
  });

  test("rejeitar agendamento com nota opcional confirma", async ({ page }) => {
    await createRequestedAppointment(page, "SKIN_CARE");
    await loginAsAdmin(page);
    await page.goto("/admin/appointments");

    await page.locator("select").first().selectOption("REQUESTED");
    await page.waitForResponse((r: any) => r.url().includes("/api/appointment/search"));

    await page.getByRole("button", { name: "Rejeitar" }).first().click();
    await expect(page.getByText("Confirmar rejeição")).toBeVisible();

    await page.locator("textarea").last().fill("Data não disponível para o médico.");

    const [confirmRes] = await Promise.all([
      page.waitForResponse(
        (r: any) => r.url().includes("/api/appointment") && r.request().method() === "PUT"
      ),
      page.getByRole("button", { name: "Confirmar" }).click(),
    ]);
    expect(confirmRes.status(), `Rejection failed: ${confirmRes.status()}`).toBe(200);
    await expect(page.getByText("Confirmar rejeição")).not.toBeVisible({ timeout: 5000 });
  });

  test("cancelar painel fecha sem submeter e botão Aprovar permanece", async ({ page }) => {
    await createRequestedAppointment(page, "MICRONEEDLING");
    await loginAsAdmin(page);
    await page.goto("/admin/appointments");

    await page.locator("select").first().selectOption("REQUESTED");
    await page.waitForResponse((r: any) => r.url().includes("/api/appointment/search"));

    await page.getByRole("button", { name: "Aprovar" }).first().click();
    await expect(page.getByText("Confirmar aprovação")).toBeVisible();

    await page.getByRole("button", { name: "Cancelar" }).last().click();
    await expect(page.getByText("Confirmar aprovação")).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Aprovar" }).first()).toBeVisible();
  });

  test("pesquisa por nome de paciente filtra resultados", async ({ page }) => {
    const input = page.getByPlaceholder("Pesquisar por paciente…");
    const [searchRes] = await Promise.all([
      page.waitForResponse((r: any) => r.url().includes("/api/appointment/search")),
      input.fill("Andre"),
    ]);
    expect(searchRes.status()).toBe(200);

    const rows = page.locator("tbody tr").filter({ hasNot: page.locator("td[colspan]") });
    const count = await rows.count();
    if (count > 0) {
      const firstPatientCell = rows.first().locator("td").first();
      await expect(firstPatientCell).toContainText("Andre", { ignoreCase: true });
    }
  });
});
