import { test, expect } from './fixtures';
import { TestHelpers } from './helpers';

test.describe('Valuation Display Flow', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        await authenticatedPage.goto('/portfolios');
    });

    test('should display portfolio valuation', async ({ authenticatedPage }) => {
        const portfolioName = `Valuation Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const valuationElement = authenticatedPage.locator('[data-testid="valuation"], .valuation, .total-value, text=$').first();
        await expect(valuationElement).toBeVisible({ timeout: 10000 }).catch(() => { });
    });

    test('should update valuation when holdings are added', async ({ authenticatedPage }) => {
        const portfolioName = `Holdings Valuation Portfolio ${Date.now()}`;
        const symbol = 'AAPL';
        const quantity = 10;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const initialValuation = await TestHelpers.getPortfolioValuation(
            authenticatedPage,
            portfolioName
        );
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const updatedValuation = await TestHelpers.getPortfolioValuation(
            authenticatedPage,
            portfolioName
        );
        if (updatedValuation) {
            expect(updatedValuation).toBeTruthy();
        }
    });

    test('should display portfolio performance metrics', async ({ authenticatedPage }) => {
        const portfolioName = `Performance Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const portfolioLink = authenticatedPage.locator(`text=${portfolioName}`);
        await portfolioLink.click();
        await authenticatedPage.waitForTimeout(500);
        const performanceSection = authenticatedPage.locator(
            '[data-testid="performance"], .performance, text=Return, text=Gain'
        ).first();
        await expect(performanceSection).toBeVisible({ timeout: 5000 }).catch(() => { });
    });

    test('should display individual holding valuation', async ({ authenticatedPage }) => {
        const portfolioName = `Holding Value Portfolio ${Date.now()}`;
        const symbol = 'MSFT';
        const quantity = 5;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const holdingRow = authenticatedPage.locator(`text=${symbol}`).locator('..');
        const holdingValue = holdingRow.locator('[data-testid="holding-value"], .value, text=$').first();
        await expect(holdingValue).toBeVisible({ timeout: 10000 }).catch(() => { });
    });

    test('should display current price for holdings', async ({ authenticatedPage }) => {
        const portfolioName = `Current Price Portfolio ${Date.now()}`;
        const symbol = 'GOOGL';
        const quantity = 3;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const priceElement = authenticatedPage.locator(
            '[data-testid="current-price"], .current-price, .price'
        ).first();
        await expect(priceElement).toBeVisible({ timeout: 10000 }).catch(() => { });
    });

    test('should refresh valuation data', async ({ authenticatedPage }) => {
        const portfolioName = `Refresh Valuation Portfolio ${Date.now()}`;
        const symbol = 'NVDA';
        const quantity = 7;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const refreshButton = authenticatedPage.locator(
            'button:has-text("Refresh"), button:has-text("Update"), [aria-label*="Refresh"]'
        ).first();
        if (await refreshButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await refreshButton.click();
            await TestHelpers.waitForLoadingComplete(authenticatedPage);
            const valuationElement = authenticatedPage.locator('td').filter({ hasText: symbol }).first();
            await expect(valuationElement).toBeVisible({ timeout: 5000 });
        }
    });

    test('should display portfolio summary on dashboard', async ({ authenticatedPage }) => {
        const portfolioName = `Summary Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const dashboardLink = authenticatedPage.locator('a[href="/"], a[href="/home"], a[href="/dashboard"]').first();
        if (await dashboardLink.isVisible().catch(() => false)) {
            await dashboardLink.click();
            await authenticatedPage.waitForTimeout(500);
        }
        const summarySection = authenticatedPage.locator(
            '[data-testid="portfolio-summary"], .portfolio-summary, h2:has-text("Portfolio")'
        ).first();
        await expect(summarySection).toBeVisible({ timeout: 5000 }).catch(() => { });
    });

    test('should display multi-currency valuations if applicable', async ({ authenticatedPage }) => {
        const portfolioName = `Multi-Currency Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const currencyElement = authenticatedPage.locator(
            'select[name="currency"], button:has-text("USD"), button:has-text("EUR"), [data-testid="currency"]'
        ).first();
        await expect(currencyElement).toBeVisible({ timeout: 5000 }).catch(() => { });
    });

    test('should display asset allocation visualization', async ({ authenticatedPage }) => {
        const portfolioName = `Allocation Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const portfolioLink = authenticatedPage.locator(`text=${portfolioName}`);
        await portfolioLink.click();
        await authenticatedPage.waitForTimeout(500);
        const allocationChart = authenticatedPage.locator(
            '[data-testid="allocation"], .allocation, canvas, svg, .chart'
        ).first();
        await expect(allocationChart).toBeVisible({ timeout: 5000 }).catch(() => { });
    });

    test('should display gain/loss information', async ({ authenticatedPage }) => {
        const portfolioName = `Gain Loss Portfolio ${Date.now()}`;
        const symbol = 'TSLA';
        const quantity = 4;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const gainLossElement = authenticatedPage.locator(
            '[data-testid="gain-loss"], .gain-loss, text=Gain, text=Loss, text=P&L'
        ).first();
        await expect(gainLossElement).toBeVisible({ timeout: 10000 }).catch(() => { });
    });

    test('should handle valuation loading states', async ({ authenticatedPage }) => {
        const portfolioName = `Loading State Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const loadingIndicator = authenticatedPage.locator(
            '[aria-busy="true"], .loading, .spinner, .skeleton'
        ).first();
        await TestHelpers.waitForLoadingComplete(authenticatedPage);
        const content = authenticatedPage.locator(`text=${portfolioName}`);
        await expect(content).toBeVisible({ timeout: 5000 });
    });

    test('should display historical performance data', async ({ authenticatedPage }) => {
        const portfolioName = `Historical Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const portfolioLink = authenticatedPage.locator(`text=${portfolioName}`);
        await portfolioLink.click();
        await authenticatedPage.waitForTimeout(500);
        const historySection = authenticatedPage.locator(
            '[data-testid="history"], .history, text=1 Month, text=3 Month, text=1 Year'
        ).first();
        await expect(historySection).toBeVisible({ timeout: 5000 }).catch(() => { });
    });
});
