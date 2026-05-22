const { test, expect } = require('@playwright/test');

// These tests assume a static server is running in the `portal` folder on port 8000
// Start with: python3 -m http.server 8000

const BASE = 'http://localhost:8000';

test('register, login, submit complaint (student flow)', async ({ page }) => {
  await page.goto(`${BASE}/register.html`);
  await page.waitForSelector('#registerForm');

  const timestamp = Date.now();
  const studentEmail = `e2e.user+${timestamp}@test.local`;
  const studentId = `S${timestamp.toString().slice(-6)}`;

  await page.fill('#name', 'E2E Tester');
  await page.fill('#email', studentEmail);
  await page.fill('#studentId', studentId);
  await page.fill('#password', 'password123');
  await page.fill('#confirmPassword', 'password123');
  await page.click('#registerForm button[type=submit]');

  // Wait until the registered student appears in localStorage, then open login
  await page.waitForFunction((email) => {
    const s = JSON.parse(localStorage.getItem('students_data') || '[]');
    return s.some(u => u.email === email);
  }, studentEmail, { timeout: 5000 });
  await page.goto(`${BASE}/login.html`);

  // Student login
  await page.click('.tab-btn'); // ensure student tab
  await page.fill('#email', studentEmail);
  await page.fill('#password', 'password123');
  // Click login and wait for redirect to the student dashboard
  await Promise.all([
    page.waitForURL('**/student-dashboard.html', { timeout: 5000 }),
    page.click('#loginForm button[type=submit]')
  ]);
  expect(page.url()).toContain('student-dashboard.html');

  // Submit a complaint
  await page.goto(`${BASE}/submit-complaint.html`);
  await page.fill('#title', 'E2E Test Complaint');
  await page.fill('#description', 'This complaint was submitted by an automated E2E test.');
  await page.selectOption('#category', 'Other');
  await page.click('#complaintForm button[type=submit]');

  await page.waitForTimeout(400);
  await page.goto(`${BASE}/student-dashboard.html`);
  // check localStorage for complaints_data
  const complaints = await page.evaluate(() => JSON.parse(localStorage.getItem('complaints_data') || '[]'));
  expect(complaints.length).toBeGreaterThan(0);
  const found = complaints.find(c => c.title === 'E2E Test Complaint');
  expect(found).toBeTruthy();
});
