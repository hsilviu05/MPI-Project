import type { Page, Locator } from '@playwright/test';

export class TestHelpers {
    static async registerUser(
        page: Page,
        email: string,
        password: string,
        fullName: string
    ) {
        await page.goto('/register');
        await page.fill('input[name="fullName"]', fullName);
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/login|dashboard|home/, { timeout: 10000 });
    }

    static async loginUser(page: Page, email: string, password: string) {
        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/dashboard|portfolios|home/, { timeout: 10000 });
    }

    static async createPortfolio(
        page: Page,
        portfolioName: string,
        description?: string
    ) {
        await page.goto('/portfolios');

        const createButton = page.locator('button:has-text("Create"), button:has-text("New"), button:has-text("Add")').first();
        if (await createButton.isVisible()) {
            await createButton.click();
        }

        await page.fill('input[name="name"], input[placeholder*="Portfolio"], input[placeholder*="Name"]', portfolioName);

        if (description) {
            const descField = page.locator('textarea[name="description"], input[placeholder*="Description"]').first();
            if (await descField.isVisible()) {
                await descField.fill(description);
            }
        }

        const submitButton = page.locator('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Add")').first();
        await submitButton.click();

        await page.waitForTimeout(1000);
    }

    static async addHolding(
        page: Page,
        portfolioName: string,
        symbol: string,
        quantity: number
    ) {
        const portfolioLink = page.locator(`a:has-text("${portfolioName}"), button:has-text("${portfolioName}")`).first();
        if (await portfolioLink.isVisible()) {
            await portfolioLink.click();
            await page.waitForTimeout(500);
        }

        const addHoldingButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Holdings")').first();
        if (await addHoldingButton.isVisible()) {
            await addHoldingButton.click();
        }

        const symbolField = page.locator('input[name="symbol"], input[placeholder*="Symbol"], input[placeholder*="symbol"]').first();
        if (await symbolField.isVisible()) {
            await symbolField.fill(symbol);
        }

        const quantityField = page.locator('input[name="quantity"], input[placeholder*="Quantity"], input[type="number"]').first();
        if (await quantityField.isVisible()) {
            await quantityField.fill(String(quantity));
        }

        const submitButton = page.locator('button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")').first();
        if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(1000);
        }
    }

    static async expectElementWithText(
        page: Page,
        text: string,
        selector?: string
    ): Promise<Locator> {
        const locator = selector
            ? page.locator(selector)
            : page.locator('body');

        await locator.locator(`text=${text}`).waitFor({ timeout: 5000 });
        return locator.locator(`text=${text}`);
    }

    static async waitForLoadingComplete(page: Page) {
        const loadingIndicators = page.locator('[aria-busy="true"], .loading, .spinner').first();
        await loadingIndicators.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
        await page.waitForTimeout(500);
    }

    static async getPortfolioNames(page: Page): Promise<string[]> {
        const portfolioElements = page.locator('[data-testid="portfolio-item"], li:has(a[href*="portfolio"]), .portfolio-card').all();
        const names: string[] = [];

        for (const element of await portfolioElements) {
            const text = await element.textContent();
            if (text) {
                names.push(text.trim());
            }
        }

        return names;
    }

    static async getPortfolioValuation(page: Page, portfolioName: string): Promise<string | null> {
        const portfolioCard = page.locator(`text=${portfolioName}`).locator('..').first();
        const valuation = portfolioCard.locator('[data-testid="valuation"], .valuation, .total-value').first();

        if (await valuation.isVisible().catch(() => false)) {
            return await valuation.textContent();
        }

        return null;
    }
}
