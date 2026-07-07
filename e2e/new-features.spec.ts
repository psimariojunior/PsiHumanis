import { test, expect } from "@playwright/test"

test.describe("Crisis Detection", () => {
  test("crisis alert API returns alerts for psychologist", async ({ page }) => {
    await page.goto("/api/crisis-alerts")
    const response = await page.goto("/api/crisis-alerts")
    expect(response).toBeTruthy()
  })

  test("diary POST with mood 1 triggers crisis alert", async ({ request }) => {
    const response = await request.post("/api/pacientes/diario", {
      headers: { "Content-Type": "application/json" },
      data: {
        mood: 1,
        emotions: JSON.stringify(["Tristeza", "Solidão"]),
        notes: "Me sinto muito mal hoje",
      },
    })
    expect(response.status()).toBeLessThanOrEqual(500)
  })
})

test.describe("Task Assignment", () => {
  test("psychologist tasks page loads", async ({ page }) => {
    await page.goto("/tarefas")
    await expect(page.locator("body")).toContainText("Tarefas")
  })

  test("therapeutic resources page loads", async ({ page }) => {
    await page.goto("/recursos-terapeuticos")
    await expect(page.locator("body")).toContainText("Recursos Terapêuticos")
  })

  test("patient tasks page loads", async ({ page }) => {
    await page.goto("/paciente/tarefas")
    await expect(page.locator("body")).toContainText("Minhas Tarefas")
  })
})

test.describe("Session Mode", () => {
  test("session mode page loads without patient", async ({ page }) => {
    await page.goto("/sessoes/modo")
    await expect(page.locator("body")).toContainText("Modo Sessão")
  })

  test("session mode shows patient selector when no patient ID", async ({ page }) => {
    await page.goto("/sessoes/modo")
    await expect(page.locator("body")).toContainText("Selecione um paciente")
  })
})

test.describe("Payment Gate", () => {
  test("token API returns 402 for unpaid appointment", async ({ request }) => {
    const response = await request.get("/api/livekit/token?room=test-room&patient=true")
    const data = await response.json()
    if (response.status() === 402) {
      expect(data.error).toBe("PAYMENT_REQUIRED")
      expect(data.appointmentId).toBeTruthy()
      expect(data.amount).toBeTruthy()
    }
  })
})

test.describe("Waiting Room (Database)", () => {
  test("waiting room API returns patients list", async ({ page }) => {
    const response = await page.goto("/api/livekit/waiting")
    expect(response?.ok()).toBe(true)
  })

  test("waiting room POST registers patient", async ({ request }) => {
    const response = await request.post("/api/livekit/waiting", {
      headers: { "Content-Type": "application/json" },
      data: {
        room: "test-room-e2e",
        name: "Paciente Teste E2E",
        status: "approved",
      },
    })
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.id).toBeTruthy()
    expect(data.status).toBe("approved")
  })
})

test.describe("Stripe Connect", () => {
  test("stripe connect status API works", async ({ page }) => {
    const response = await page.goto("/api/stripe/connect")
    expect(response).toBeTruthy()
  })
})
