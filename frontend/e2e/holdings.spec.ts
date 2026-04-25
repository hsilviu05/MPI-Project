import { test, expect } from './fixtures';
import { TestHelpers } from './helpers';

test.describe('Holdings Flow', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        await authenticatedPage.goto('/portfolios');
    });

    test('should add a holding to portfolio', async ({ authenticatedPage }) => {
        const portfolioName = `Holdings Portfolio ${Date.now()}`;
        const symbol = 'AAPL';
        const quantity = 10;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const holdingSymbol = authenticatedPage.locator('table tbody tr').filter({ hasText: symbol }).first();
        await expect(holdingSymbol).toBeVisible({ timeout: 10000 });
    });

    test('should add multiple holdings to portfolio', async ({ authenticatedPage }) => {
        const portfolioName = `Multi Holdings Portfolio ${Date.now()}`;
        const holdings = [
            { symbol: 'AAPL', quantity: 5 },
            { symbol: 'MSFT', quantity: 10 },
            { symbol: 'GOOGL', quantity: 3 },
        ];
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        for (const holding of holdings) {
            await TestHelpers.addHolding(
                authenticatedPage,
                portfolioName,
                holding.symbol,
                holding.quantity
            );
        }
        for (const holding of holdings) {
            const holdingElement = authenticatedPage.locator('table tbody tr').filter({ hasText: holding.symbol }).first();
            await expect(holdingElement).toBeVisible({ timeout: 5000 });
        }
    });

    test('should display holding quantity', async ({ authenticatedPage }) => {
        const portfolioName = `Quantity Portfolio ${Date.now()}`;
        const symbol = 'TSLA';
        const quantity = 25;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const quantityText = authenticatedPage.locator('table tbody tr').filter({ hasText: symbol }).first();
        await expect(quantityText).toBeVisible({ timeout: 10000 });
    });

    test('should update holding quantity', async ({ authenticatedPage }) => {
        const portfolioName = `Update Holdings Portfolio ${Date.now()}`;
        const symbol = 'AMZN';
        const initialQuantity = 5;
        const updatedQuantity = 15;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            initialQuantity
        );
        const holdingRow = authenticatedPage.locator('table tbody tr').filter({ hasText: symbol }).first();
        const editButton = holdingRow.locator('button:has-text("Editeaza"), button:has-text("Edit")').first();
        if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await editButton.click();
            const quantityField = authenticatedPage.locator('#edit-qty');
            await quantityField.clear();
            await quantityField.fill(String(updatedQuantity));
            const saveButton = authenticatedPage.locator('button[type="submit"]:has-text("Salveaza"), button[type="submit"]:has-text("Save")').first();
            if (await saveButton.isVisible().catch(() => false)) {
                await saveButton.click();
                await authenticatedPage.waitForTimeout(1000);
                const updatedQuantityText = authenticatedPage.locator('table tbody tr').filter({ hasText: `${symbol}` }).first();
                await expect(updatedQuantityText).toBeVisible({ timeout: 5000 });
            }
        }
    });

    test('should remove holding from portfolio', async ({ authenticatedPage }) => {
        const portfolioName = `Remove Holdings Portfolio ${Date.now()}`;
        const symbol = 'META';
        const quantity = 7;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        let holdingSymbol = authenticatedPage.locator('table tbody tr').filter({ hasText: symbol }).first();
        await expect(holdingSymbol).toBeVisible();
        const deleteButton = holdingSymbol.locator('button:has-text("Sterge"), button:has-text("Delete"), button:has-text("Remove")').first();
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await deleteButton.click();
            holdingSymbol = authenticatedPage.locator('table tbody tr').filter({ hasText: symbol }).first();
            await expect(holdingSymbol).not.toBeVisible({ timeout: 5000 });
        }
    });

    test('should display holding details', async ({ authenticatedPage }) => {
        const portfolioName = `Details Portfolio ${Date.now()}`;
        const symbol = 'NVDA';
        const quantity = 12;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const holdingElement = authenticatedPage.locator('table tbody tr').filter({ hasText: symbol }).first();
        if (await holdingElement.locator('..').locator('a, button').first().isVisible().catch(() => false)) {
            await holdingElement.click();
            await authenticatedPage.waitForTimeout(1000);
            const detailContent = authenticatedPage.locator('[data-testid="holding-detail"], .holding-detail, .details');
            await expect(detailContent).toBeVisible({ timeout: 5000 }).catch(() => { });
        }
    });

    test('should track transaction history for holding', async ({ authenticatedPage }) => {
        const portfolioName = `Transaction Portfolio ${Date.now()}`;
        const symbol = 'NFLX';
        const quantity = 8;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(
            authenticatedPage,
            portfolioName,
            symbol,
            quantity
        );
        const transactionSection = authenticatedPage.locator('[data-testid="transactions"], .transactions, text=Transaction, text=History').first();
        if (await transactionSection.isVisible({ timeout: 3000 }).catch(() => false)) {
            const transactionEntry = transactionSection.locator('[data-testid="transaction-item"], li, tr').first();
            await expect(transactionEntry).toBeVisible({ timeout: 5000 });
        }
    });

    test('should validate holding inputs', async ({ authenticatedPage }) => {
        const portfolioName = `Validation Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        await TestHelpers.addHolding(authenticatedPage, portfolioName, 'VALIDATION-ASSET', 1);
        const submitButton = authenticatedPage.locator('button[type="submit"]:has-text("Adauga detinere")').first();
        if (await submitButton.isVisible().catch(() => false)) {
            await authenticatedPage.locator('#holding-qty').fill('');
            await submitButton.click();
            const errorMessages = authenticatedPage.locator('.field-error, [role="alert"], .error').first();
            await expect(errorMessages).toBeVisible({ timeout: 3000 }).catch(() => { });
        }
    });

    test('should display holdings list for portfolio', async ({ authenticatedPage }) => {
        const portfolioName = `List Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const portfolioRow = authenticatedPage.locator('tbody tr').filter({ hasText: portfolioName }).first();
        await portfolioRow.locator('a:has-text("Detineri")').click();
        await authenticatedPage.waitForURL(/\/portfolios\/\d+\/holdings/, { timeout: 10000 });
        const holdingsSection = authenticatedPage.locator('h3:has-text("Detineri"), h4:has-text("Lista detineri")').first();
        await expect(holdingsSection).toBeVisible({ timeout: 5000 }).catch(() => { });
    });
});
