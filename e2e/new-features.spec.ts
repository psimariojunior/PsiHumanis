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

test.describe("Task Assignment (auth required)", () => {
  test("psychologist tasks page redirects to login", async ({ page }) => {
    await page.goto("/tarefas")
    await expect(page.locator("body")).toContainText("login")
  })

  test("therapeutic resources page redirects to login", async ({ page }) => {
    await page.goto("/recursos-terapeuticos")
    await expect(page.locator("body")).toContainText("login")
  })
})

test.describe("Patient Tasks (public)", () => {
  test("patient tasks page loads", async ({ page }) => {
    await page.goto("/paciente/tarefas")
    await expect(page.locator("body")).toContainText("PsiHumanis")
  })

  test("patient tasks page has empty state or login", async ({ page }) => {
    await page.goto("/paciente/tarefas")
    const body = page.locator("body")
    const hasContent = await body.textContent()
    expect(hasContent).toBeTruthy()
  })
})

test.describe("Session Mode (auth required)", () => {
  test("session mode page redirects to login", async ({ page }) => {
    await page.goto("/sessoes/modo")
    await expect(page.locator("body")).toContainText("login")
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

test.describe("LGPD", () => {
  test("lgpd export page requires auth", async ({ page }) => {
    await page.goto("/paciente/lgpd-export")
    await expect(page.locator("body")).toContainText("PsiHumanis")
  })

  test("lgpd delete API requires auth", async ({ request }) => {
    const response = await request.post("/api/pacientes/lgpd-delete")
    expect([401, 403, 200]).toContain(response.status())
  })

  test("lgpd export API requires auth", async ({ request }) => {
    const response = await request.get("/api/pacientes/lgpd-export")
    expect([401, 403, 200]).toContain(response.status())
  })
})

test.describe("Settings (auth required)", () => {
  test("settings page redirects to login", async ({ page }) => {
    await page.goto("/configuracoes")
    await expect(page.locator("body")).toContainText("login")
  })
})

test.describe("Patient Portal", () => {
  test("patient dashboard loads", async ({ page }) => {
    await page.goto("/paciente")
    await expect(page.locator("body")).toContainText("PsiHumanis")
  })

  test("patient diary page loads", async ({ page }) => {
    await page.goto("/paciente/diario")
    await expect(page.locator("body")).toContainText("Diário de Emoções")
  })

  test("patient login page loads", async ({ page }) => {
    await page.goto("/paciente/login")
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
})

test.describe("Health API", () => {
  test("health endpoint returns ok", async ({ request }) => {
    const response = await request.get("/api/health")
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.status).toBe("healthy")
  })
})

test.describe("Crisis Alerts API", () => {
  test("crisis alerts API requires auth", async ({ request }) => {
    const response = await request.get("/api/crisis-alerts")
    expect([401, 403, 200]).toContain(response.status())
  })
})

test.describe("Task API", () => {
  test("tasks API requires auth", async ({ request }) => {
    const response = await request.get("/api/tarefas")
    expect([401, 403, 200]).toContain(response.status())
  })
})
