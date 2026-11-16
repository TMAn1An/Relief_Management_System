import { defineConfig } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  workers: 1, // the tests share one database and walk a single story
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
    launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined },
  },
  webServer: {
    // Fresh SQLite file + migrations + seeded admin, then serve the production build (run `npm run build` first).
    command: `rm -f prisma/e2e.db prisma/e2e.db-journal && npx prisma migrate deploy && npx tsx prisma/seed.ts && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: "file:./e2e.db",
      TURSO_DATABASE_URL: "",
      SESSION_SECRET: "e2e-only-secret-e2e-only-secret-0123456789",
      SEED_ADMIN_EMAIL: "admin@example.com",
      SEED_ADMIN_PASSWORD: "admin12345",
    },
  },
});
