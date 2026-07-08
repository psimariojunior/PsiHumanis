import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "https://psihumanis.com.br",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup-patient",
      testMatch: "auth.setup.ts",
    },
    {
      name: "chromium-noauth",
      testMatch: /basic\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-patient",
      testMatch: /questionarios\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], storageState: "test-results/.auth/patient.json" },
      dependencies: ["setup-patient"],
    },
    {
      name: "setup-psychologist",
      testMatch: /psychologist-auth\.setup\.ts$/,
    },
    {
      name: "chromium-psychologist",
      testMatch: /psychologist\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"], storageState: "test-results/.auth/psychologist.json" },
      dependencies: ["setup-psychologist"],
    },
    {
      name: "chromium-waiting-room",
      testMatch: /waiting-room\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-clinic-reception",
      testMatch: /clinic-reception\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-new-features",
      testMatch: /new-features\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
