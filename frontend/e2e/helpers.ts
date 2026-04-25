import type { Page } from '@playwright/test';

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
        await page.fill('input[name="confirmPassword"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/($|login|dashboard|portfolios|home)/, { timeout: 10000 });
    }

    static async loginUser(page: Page, email: string, password: string) {
        await page.goto('/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/($|dashboard|portfolios|home)/, { timeout: 10000 });
    }

    static async createPortfolio(
        page: Page,
        portfolioName: string,
        description?: string
    ) {
        await page.goto('/portfolios');

        await page.fill('#portfolio-new-name', portfolioName);

        if (description) {
            await page.fill('#portfolio-new-desc', description);
        }

        const submitButton = page.locator('button[type="submit"]:has-text("Adauga portofoliu")').first();
        await submitButton.click();

        await page.locator('tbody tr').filter({ hasText: portfolioName }).first().waitFor({ state: 'visible', timeout: 15000 });
    }

    static async addHolding(
        page: Page,
        portfolioName: string,
        symbol: string,
        quantity: number
    ) {
        await page.goto('/portfolios');
        const portfolioRow = page.locator('tbody tr').filter({ hasText: portfolioName }).first();
        await portfolioRow.waitFor({ state: 'visible', timeout: 15000 });
        await portfolioRow.locator('a:has-text("Detineri")').click();
        await page.waitForURL(/\/portfolios\/\d+\/holdings/, { timeout: 10000 });

        const holdingsUrl = page.url();
        await page.fill('#asset-filter', symbol);

        let assetOption = page.locator(`#holding-asset option:has-text("${symbol}")`).first();
        if (await assetOption.count() === 0) {
            await page.goto('/assets');
            await page.fill('#asset-symbol', symbol);
            await page.fill('#asset-name', symbol);
            await page.fill('#asset-type', 'stock');
            await page.fill('#asset-currency', 'USD');
            await page.locator('button[type="submit"]:has-text("Adauga activ")').click();
            await page.goto(holdingsUrl);
            await page.fill('#asset-filter', symbol);
            assetOption = page.locator(`#holding-asset option:has-text("${symbol}")`).first();
        }

        const assetId = await assetOption.getAttribute('value');
        if (assetId) {
            await page.selectOption('#holding-asset', assetId);
        }

        await page.fill('#holding-qty', String(quantity));
        await page.locator('button[type="submit"]:has-text("Adauga detinere")').click();
        await page.locator('table tbody tr').filter({ hasText: symbol }).first().waitFor({ state: 'visible', timeout: 15000 });
    }

    static async waitForLoadingComplete(page: Page) {
        const loadingIndicators = page.locator('[aria-busy="true"], .loading, .spinner').first();
        await loadingIndicators.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });
        await page.waitForTimeout(500);
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
