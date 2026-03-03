import { test, expect } from '@playwright/test';

test('Login flow', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Expect title
    await expect(page).toHaveTitle(/Login/);

    // Fill form
    await page.fill('input[type="email"]', 'admin@operacao01.com');
    await page.fill('input[type="password"]', 'admin123');

    // Submit
    await page.click('button[type="submit"]');

    // Expect redirect to dashboard (or admin dashboard if Role is ADMIN, actually middleware redirects admin to /dashboard? No, middleware allows /dashboard for everyone authenticated, so it should go there first unless the page redirects.)
    // My login page redirects to /dashboard on success.
    await expect(page).toHaveURL('http://localhost:3000/admin/dashboard');

    // Verify dashboard content
    await expect(page.locator('h1')).not.toBeEmpty();
});
