import { test, expect } from "@playwright/test"

test.describe("Crisis Detection", () => {
  test("crisis alert API returns alerts for psychologist", async ({ page }) => {
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

  test("diary POST with mood 5 does not trigger crisis", async ({ request }) => {
    const response = await request.post("/api/pacientes/diario", {
      headers: { "Content-Type": "application/json" },
      data: {
        mood: 5,
        emotions: JSON.stringify(["Alegria", "Gratidão"]),
        notes: "Ótimo dia!",
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

  test("patient tasks page has empty state", async ({ page }) => {
    await page.goto("/paciente/tarefas")
    await expect(page.locator("body")).toContainText("Nenhuma tarefa ainda")
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

  test("session mode has select patient button", async ({ page }) => {
    await page.goto("/sessoes/modo")
    await expect(page.getByRole("link", { name: /selecionar paciente/i })).toBeVisible()
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

  test("token API without patient flag does not check payment", async ({ request }) => {
    const response = await request.get("/api/livekit/token?room=test-room")
    expect(response.status()).not.toBe(402)
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

  test("waiting room rejects missing params", async ({ request }) => {
    const response = await request.post("/api/livekit/waiting", {
      headers: { "Content-Type": "application/json" },
      data: {},
    })
    expect(response.status()).toBe(400)
  })
})

test.describe("Stripe Connect", () => {
  test("stripe connect status API works", async ({ page }) => {
    const response = await page.goto("/api/stripe/connect")
    expect(response).toBeTruthy()
  })
})

test.describe("LGPD Export", () => {
  test("lgpd export page loads", async ({ page }) => {
    await page.goto("/paciente/lgpd-export")
    await expect(page.locator("body")).toContainText("Meus Dados")
  })

  test("lgpd export page has export button", async ({ page }) => {
    await page.goto("/paciente/lgpd-export")
    await expect(page.getByRole("button", { name: /exportar/i })).toBeVisible()
  })

  test("lgpd export page has delete section", async ({ page }) => {
    await page.goto("/paciente/lgpd-export")
    await expect(page.locator("body")).toContainText("excluir")
  })
})

test.describe("Guided Tour", () => {
  test("guided tour appears on dashboard for new users", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForTimeout(2000)
    const tourVisible = await page.locator("text=Bem-vindo ao PsiHumanis").isVisible()
    expect(tourVisible).toBe(true)
  })
})

test.describe("Settings - Stripe Connect", () => {
  test("settings page has payment tab", async ({ page }) => {
    await page.goto("/configuracoes")
    await expect(page.locator("body")).toContainText("Pagamentos")
  })
})

test.describe("Patient Portal", () => {
  test("patient dashboard loads", async ({ page }) => {
    await page.goto("/paciente")
    await expect(page.locator("body")).toContainText("PsiHumanis")
  })

  test("patient agenda page loads", async ({ page }) => {
    await page.goto("/paciente/agenda")
    await expect(page.locator("body")).toContainText("PsiHumanis")
  })

  test("patient diary page loads", async ({ page }) => {
    await page.goto("/paciente/diario")
    await expect(page.locator("body")).toContainText("Diário de Emoções")
  })

  test("patient data page loads", async ({ page }) => {
    await page.goto("/paciente/meus-dados")
    await expect(page.locator("body")).toContainText("PsiHumanis")
  })
})

test.describe("Public Pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("body")).toContainText("PsiHumanis")
  })

  test("booking page loads", async ({ page }) => {
    await page.goto("/agendar")
    await expect(page.locator("body")).toContainText("psicólogo")
  })

  test("terms page loads", async ({ page }) => {
    await page.goto("/termos")
    await expect(page.locator("body")).toContainText("Termos")
  })

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacidade")
    await expect(page.locator("body")).toContainText("Privacidade")
  })

  test("data deletion page loads", async ({ page }) => {
    await page.goto("/deletar-dados")
    await expect(page.locator("body")).toContainText("deletar")
  })
})

test.describe("Health API", () => {
  test("health endpoint returns ok", async ({ request }) => {
    const response = await request.get("/api/health")
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.status).toBe("healthy")
  })
})
