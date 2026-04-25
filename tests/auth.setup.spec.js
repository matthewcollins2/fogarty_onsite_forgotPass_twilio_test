import { test as setup, expect } from '@playwright/test';
import fs from 'fs';

setup('create test user', async ({ page }) => {
  // 1. Generate the unique email
  const testEmail = `matthew-${Date.now()}@test.com`;

  // 2. Perform registration
  await page.goto('http://localhost:5173/UserRegistration');

  await page.getByRole('textbox', { name: 'First Name' }).fill('Matthew');
  await page.getByRole('textbox', { name: 'Last Name' }).fill('Collins');
  await page.getByRole('textbox', { name: 'User ID' }).fill(`matthew-${Date.now()}`);
  await page.getByRole('textbox', { name: 'Email' }).fill(testEmail);
  await page.getByPlaceholder('Phone Number').fill('6155550100');
  await page.getByRole('textbox', { name: 'Password' }).fill('TempPass123!!');

  await page.getByRole('textbox', { name: 'Street' }).fill('123 Main St');
  await page.getByRole('textbox', { name: 'City' }).fill('Sacramento');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'CA' }).click();
  await page.getByRole('textbox', { name: 'ZIP Code' }).fill('95814');

  await page.locator('div').filter({ hasText: /^Create User$/ }).click();

  // 3. Verify success
  await expect(page.getByText('Account created successfully')).toBeVisible();

  // 4. Save the email to a shared file for the next test to use
  fs.writeFileSync('./tests/test-email.json', JSON.stringify({ email: testEmail }));
});