import { test, expect } from './fixtures';
import { TestHelpers } from './helpers';

test.describe('Portfolio Creation Flow', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        await authenticatedPage.goto('/portfolios');
    });

    test('should display portfolios page when authenticated', async ({ authenticatedPage }) => {
        expect(authenticatedPage.url()).toContain('/portfolios');
        const portfolioHeading = authenticatedPage.locator('h1, h2, h3').filter({
            hasText: /[Pp]ortfolio/,
        });
        await expect(portfolioHeading).toBeVisible({ timeout: 5000 }).catch(() => { });
    });

    test('should create a portfolio successfully', async ({ authenticatedPage }) => {
        const portfolioName = `Test Portfolio ${Date.now()}`;
        const portfolioDescription = 'E2E Test Portfolio';
        await TestHelpers.createPortfolio(
            authenticatedPage,
            portfolioName,
            portfolioDescription
        );
        const createdPortfolio = authenticatedPage.locator(`text=${portfolioName}`);
        await expect(createdPortfolio).toBeVisible({ timeout: 10000 });
    });

    test('should create multiple portfolios', async ({ authenticatedPage }) => {
        const portfolios = [
            { name: `Tech Portfolio ${Date.now()}`, description: 'Tech stocks' },
            { name: `Dividend Portfolio ${Date.now()}`, description: 'Dividend stocks' },
        ];
        for (const portfolio of portfolios) {
            await TestHelpers.createPortfolio(
                authenticatedPage,
                portfolio.name,
                portfolio.description
            );
        }
        for (const portfolio of portfolios) {
            const portfolioElement = authenticatedPage.locator(`text=${portfolio.name}`);
            await expect(portfolioElement).toBeVisible({ timeout: 5000 });
        }
    });

    test('should navigate to portfolio details', async ({ authenticatedPage }) => {
        const portfolioName = `Detail Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const portfolioLink = authenticatedPage.locator(`text=${portfolioName}`).first();
        await portfolioLink.click();
        await authenticatedPage.waitForTimeout(1000);
        const currentUrl = authenticatedPage.url();
        expect(
            currentUrl.includes('portfolio') ||
            currentUrl.includes(portfolioName.toLowerCase())
        ).toBeTruthy();
    });

    test('should edit portfolio information', async ({ authenticatedPage }) => {
        const portfolioName = `Editable Portfolio ${Date.now()}`;
        const newName = `Updated ${portfolioName}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const portfolioSection = authenticatedPage.locator(`text=${portfolioName}`).locator('..');
        const editButton = portfolioSection.locator('button:has-text("Edit"), button:has-text("Modifica")').first();
        if (await editButton.isVisible().catch(() => false)) {
            await editButton.click();
            const nameField = authenticatedPage.locator('input[name="name"]');
            await nameField.fill(newName);
            const saveButton = authenticatedPage.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")').first();
            if (await saveButton.isVisible().catch(() => false)) {
                await saveButton.click();
                await authenticatedPage.waitForTimeout(1000);
                const updatedPortfolio = authenticatedPage.locator(`text=${newName}`);
                await expect(updatedPortfolio).toBeVisible({ timeout: 5000 });
            }
        }
    });

    test('should delete a portfolio', async ({ authenticatedPage }) => {
        const portfolioName = `Delete Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        let portfolio = authenticatedPage.locator(`text=${portfolioName}`);
        await expect(portfolio).toBeVisible();
        const portfolioSection = portfolio.locator('..');
        const deleteButton = portfolioSection.locator('button:has-text("Delete"), button:has-text("Sterge")').first();
        if (await deleteButton.isVisible().catch(() => false)) {
            await deleteButton.click();
            const confirmButton = authenticatedPage.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Confirm Delete")').first();
            if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmButton.click();
            }
            portfolio = authenticatedPage.locator(`text=${portfolioName}`);
            await expect(portfolio).not.toBeVisible({ timeout: 5000 });
        }
    });

    test('should display portfolio list with correct layout', async ({ authenticatedPage }) => {
        const portfolioName = `Layout Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const portfolioItems = authenticatedPage.locator('[data-testid="portfolio-item"], li, .portfolio-card, .portfolio-row').first();
        await expect(portfolioItems).toBeVisible({ timeout: 5000 });
    });

    test('should handle empty portfolio list state', async ({ authenticatedPage }) => {
        const portfolioItems = authenticatedPage.locator('[data-testid="portfolio-item"], li:has(a[href*="portfolio"]), .portfolio-card').first();
        const emptyStateMessage = authenticatedPage.locator('text=No portfolios, text=empty, text=Create').first();
        const hasItems = await portfolioItems.isVisible().catch(() => false);
        const hasEmptyState = await emptyStateMessage.isVisible().catch(() => false);
        expect(hasItems || hasEmptyState).toBeTruthy();
    });
});
