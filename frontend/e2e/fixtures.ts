import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

interface AuthTestFixture {
    authenticatedPage: Page;
    testUser: {
        email: string;
        password: string;
        fullName: string;
    };
}

export const test = base.extend<AuthTestFixture>({
    testUser: {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123',
        fullName: 'Test User',
    },

    authenticatedPage: async ({ page, testUser }, use) => {
        await page.goto('/register');

        await page.fill('input[name="fullName"]', testUser.fullName);
        await page.fill('input[name="email"]', testUser.email);
        await page.fill('input[name="password"]', testUser.password);
        await page.click('button[type="submit"]');

        await page.waitForURL(/login|dashboard/);

        if (page.url().includes('login')) {
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', testUser.password);
            await page.click('button[type="submit"]');
        }

        await page.waitForURL(/dashboard|portfolios|home/, { timeout: 10000 });

        await use(page);
    },
});

export { expect };
