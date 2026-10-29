import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  timeout: 45000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3001',
    locale: 'en-US',
  },
});
