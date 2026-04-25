import { test, expect } from '@playwright/test';
import { defineConfig } from "@playwright/test";
import fs from 'fs';

export default defineConfig({
    use: {
        launchOptions: {
            slowMo: 100,
        },
    },
});

// 1. Constants - Ensure ProjectID matches your firebase init
const projectId = 'seniorproject191-cb9b5';
const appBaseUrl = 'http://localhost:5173';
const emulatorHost = 'http://127.0.0.1:9099';

test.beforeEach(async ({ request }) => {
    const fileContent = fs.readFileSync('./tests/test-email.json', 'utf8');
    const { email } = JSON.parse(fileContent);

    // Ensure the test user exists in the emulator before running the reset test
    const createUserUrl = `${emulatorHost}/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`;
    await request.post(createUserUrl, {
        data: {
            email: email,
            password: 'TemporaryPassword123!',
            returnSecureToken: true
        }
    });
});

test('Password reset works and allows new login', async ({ page, request }) => {
    const newPassword = 'NewSecurePassword2026!';
    const fileContent = fs.readFileSync('./tests/test-email.json', 'utf8');
    const testEmail = JSON.parse(fileContent).email;

    // --- STEP 1: Request Reset ---
    await page.goto('/forgot-password');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    await page.waitForTimeout(2000);
    // Verify UI success message
    await expect(page.getByText(/check.*inbox/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole('link', { name: /back to login/i }).click();
    await expect(page).toHaveURL(/.*userlogin/);

    // --- STEP 2: Poll Emulator for the OOB Code ---
    const oobUrl = `${emulatorHost}/emulator/v1/projects/${projectId}/oobCodes`;
    let resetEntry;

    await expect.poll(async () => {
        const response = await request.get(oobUrl);
        if (!response.ok()) return false;

        const body = await response.json();
        const codes = body.oobCodes || [];

        // DEBUG: If this shows 0 links in your terminal, the frontend didn't hit the emulator
        console.log(`Polling Emulator: Found ${codes.length} total links. Target: ${testEmail}`);

        resetEntry = [...codes].reverse().find(c => c.email === testEmail);
        return !!resetEntry;
    }, {
        message: `Reset link not found in Emulator for ${testEmail}. Confirm connectAuthEmulator(auth, "http://127.0.0.1:9099") is active in your code.`,
        timeout: 20000,
    }).toBeTruthy();

    // --- STEP 3: Navigate to the Reset Page using the Emulator Link ---
    const urlParts = new URL(resetEntry.oobLink);
    // Construct the local URL: app_url + reset_route + search_params (?apiKey=...&oobCode=...)
    const finalResetLink = `${appBaseUrl}/forgot-password${urlParts.search}`;

    await page.goto(finalResetLink, { waitUntil: 'domcontentloaded' });

    // Fail early if the code is invalid (e.g., expired or project mismatch)
    const errorAlert = page.getByRole('alert').filter({ hasText: /error|invalid/i });
    if (await errorAlert.isVisible()) {
        const msg = await errorAlert.innerText();
        throw new Error(`Firebase rejected the link immediately: ${msg}`);
    }

    // --- STEP 4: Complete the Reset ---
    const resetPasswordInput = page.locator('input[type="password"]').first();
    await expect(resetPasswordInput).toBeEditable({ timeout: 20000 });
    await resetPasswordInput.fill(newPassword);

    await page.waitForTimeout(300); // Small buffer for MUI/React state
    await page.getByRole('button', { name: /update|save|reset/i }).click();

    // Verify Success
    await expect(async () => {
        const successMessage = page.getByText(/password changed|success/i);
        await expect(successMessage).toBeVisible();
    }).toPass({ timeout: 10000 });

    // --- STEP 5: Verify Login with NEW Password ---
    await page.goto('/userlogin');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.locator('input[type="password"]').last().fill(newPassword);
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Confirm dashboard access
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 10000 });
});