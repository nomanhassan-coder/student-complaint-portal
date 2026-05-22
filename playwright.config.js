// basic Playwright config for local static site
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 5000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ]
};
