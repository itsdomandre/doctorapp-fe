import { test, expect } from "@playwright/test";

async function loginAsUser(page: any) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill("andre@example.com");
  await page.locator('input[name="password"]').fill("Password123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("/app");
}

function nextSaturday(): string {
  const d = new Date();
  const daysUntilSat = ((6 - d.getDay()) + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSat);
  return d.toISOString().slice(0, 10);
}

function nextBusinessDay(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 6) d.setDate(d.getDate() + 1); // skip Saturday
  return d.toISOString().slice(0, 10);
}

async function bookAppointment(page: any, procedure: string): Promise<void> {
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
}

test.describe("Agendamentos do utilizador", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/app/appointments");
  });

  test("página de agendamentos carrega corretamente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Meus Agendamentos" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Novo Agendamento" })).toBeVisible();
  });

  test("filtro de estado está visível e tem opções", async ({ page }) => {
    const select = page.locator("select").first();
    await expect(select).toBeVisible();
    await expect(select.locator("option", { hasText: "Todos" })).toBeAttached();
    await expect(select.locator("option", { hasText: "Pendentes" })).toBeAttached();
    await expect(select.locator("option", { hasText: "Aprovados" })).toBeAttached();
  });

  test("formulário de novo agendamento renderiza todos os campos", async ({ page }) => {
    await page.getByRole("link", { name: "Novo Agendamento" }).click();
    await expect(page).toHaveURL("/app/appointments/new");
    await expect(page.getByRole("heading", { name: "Novo Agendamento" })).toBeVisible();
    await expect(page.locator('input[name="date"]')).toBeVisible();
    await expect(page.locator('select[name="procedure"]')).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
    await expect(page.getByRole("button", { name: "Solicitar agendamento" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cancelar" })).toBeVisible();
  });

  test("submeter formulário vazio mostra erros de validação", async ({ page }) => {
    await page.goto("/app/appointments/new");
    await page.getByRole("button", { name: "Solicitar agendamento" }).click();
    await expect(page.getByText("Selecione a data")).toBeVisible();
    await expect(page.getByText("Selecione um procedimento")).toBeVisible();
  });

  test("data de sábado mostra mensagem sem horários disponíveis", async ({ page }) => {
    await page.goto("/app/appointments/new");
    const sat = nextSaturday();
    await page.locator('input[name="date"]').fill(sat);
    await page.locator('input[name="date"]').dispatchEvent("change");
    await expect(
      page.getByText("Sem horários disponíveis para esta data.")
    ).toBeVisible({ timeout: 10000 });
  });

  test("cancelar no formulário regressa à lista de agendamentos", async ({ page }) => {
    await page.goto("/app/appointments/new");
    await page.getByRole("link", { name: "Cancelar" }).click();
    await expect(page).toHaveURL("/app/appointments");
  });

  test("criar agendamento com sucesso redireciona para a lista", async ({ page }) => {
    await bookAppointment(page, "BOTOX");
    await expect(page).toHaveURL("/app/appointments");
  });

  test("cancelar agendamento REQUESTED actualiza a lista", async ({ page }) => {
    await bookAppointment(page, "FILLER");

    // Filter for REQUESTED so the newly created appointment is visible
    await page.locator("select").first().selectOption("REQUESTED");
    const cancelBtn = page.getByRole("button", { name: "Cancelar" }).first();
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });

    const [cancelRes] = await Promise.all([
      page.waitForResponse(
        (r: any) => r.url().includes("/api/appointment") && r.request().method() === "PUT"
      ),
      cancelBtn.click(),
    ]);
    expect(cancelRes.status(), `Cancel failed: ${cancelRes.status()}`).toBe(200);
  });
});
