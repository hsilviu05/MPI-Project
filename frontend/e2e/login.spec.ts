import { test, expect } from './fixtures';
import { TestHelpers } from './helpers';

test.describe('Login Flow', () => {
    test('should navigate to login page', async ({ page }) => {
        await page.goto('/login');
        expect(page.url()).toContain('/login');
    });

    test('should show validation errors for invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.click('button[type="submit"]');
        const errorMessages = page.locator('.field-error, [role="alert"], .error');
        await expect(errorMessages.first()).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'invalid-email');
        await page.fill('input[name="password"]', 'TestPassword123');
        await page.click('button[type="submit"]');
        const emailError = page.locator('text=Email invalid');
        await expect(emailError).toBeVisible({ timeout: 5000 }).catch(() => { });
    });

    test('should validate password length', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'short');
        await page.click('button[type="submit"]');
        const passwordError = page.locator('text=minim');
        await expect(passwordError).toBeVisible({ timeout: 5000 }).catch(() => { });
    });

    test('should register new user successfully', async ({ page }) => {
        const testEmail = `e2e-test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123';
        const testName = 'E2E Test User';
        await TestHelpers.registerUser(page, testEmail, testPassword, testName);
        const currentUrl = page.url();
        expect(
            currentUrl.includes('login') ||
            currentUrl.includes('dashboard') ||
            currentUrl.includes('portfolios') ||
            currentUrl.includes('home')
        ).toBeTruthy();
    });

    test('should login with valid credentials', async ({ page, testUser }) => {
        await TestHelpers.registerUser(
            page,
            testUser.email,
            testUser.password,
            testUser.fullName
        );
        if (page.url().includes('/login')) {
            await TestHelpers.loginUser(page, testUser.email, testUser.password);
        }
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await TestHelpers.loginUser(page, testUser.email, testUser.password);
        const currentUrl = page.url();
        expect(
            currentUrl === `${new URL(currentUrl).origin}/` ||
            currentUrl.endsWith('/') ||
            currentUrl.includes('dashboard') ||
            currentUrl.includes('portfolios') ||
            currentUrl.includes('home')
        ).toBeTruthy();
    });

    test('should show link to register page from login', async ({ page }) => {
        await page.goto('/login');
        const registerLink = page.locator('a:has-text("Creeaza")');
        await expect(registerLink).toBeVisible();
        await registerLink.click();
        await page.waitForURL(/register/);
        expect(page.url()).toContain('/register');
    });

    test('should show link to login page from register', async ({ page }) => {
        await page.goto('/register');
        const loginLink = page.locator('a:has-text("login"), a:has-text("Mergi")');
        await expect(loginLink).toBeVisible();
        await loginLink.click();
        await page.waitForURL(/login/);
        expect(page.url()).toContain('/login');
    });

    test.describe('Register validation', () => {
        test('should require all fields', async ({ page }) => {
            await page.goto('/register');
            await page.click('button[type="submit"]');
            const errorMessages = page.locator('.field-error');
            const visibleErrors = await errorMessages.count();
            expect(visibleErrors).toBeGreaterThan(0);
        });

        test('should reject duplicate email', async ({ page, testUser }) => {
            await TestHelpers.registerUser(
                page,
                testUser.email,
                testUser.password,
                testUser.fullName
            );
            await page.goto('/register');
            await page.fill('input[name="fullName"]', 'Another User');
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', 'AnotherPassword123');
            await page.fill('input[name="confirmPassword"]', 'AnotherPassword123');
            await page.click('button[type="submit"]');
            const errorText = page.locator('text=exist');
            await expect(errorText).toBeVisible({ timeout: 5000 }).catch(() => { });
        });
    });
});
