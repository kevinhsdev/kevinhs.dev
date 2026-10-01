import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // The dev machine has little free RAM; CI uses the default.
  workers: isCI ? undefined : 2,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // Locally, reuse the installed Edge instead of downloading Chromium.
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], channel: isCI ? undefined : "msedge" },
    },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: isCI ? undefined : "msedge" } },
  ],
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
