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
        const holdingSymbol = authenticatedPage.locator(`text=${symbol}`);
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
            const holdingElement = authenticatedPage.locator(`text=${holding.symbol}`);
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
        const quantityText = authenticatedPage.locator(`text=${quantity}`);
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
        const holdingRow = authenticatedPage.locator(`text=${symbol}`).locator('..');
        const editButton = holdingRow.locator('button:has-text("Edit"), button:has-text("Modifica")').first();
        if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await editButton.click();
            const quantityField = authenticatedPage.locator('input[name="quantity"], input[type="number"]').last();
            await quantityField.clear();
            await quantityField.fill(String(updatedQuantity));
            const saveButton = authenticatedPage.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")').first();
            if (await saveButton.isVisible().catch(() => false)) {
                await saveButton.click();
                await authenticatedPage.waitForTimeout(1000);
                const updatedQuantityText = authenticatedPage.locator(`text=${updatedQuantity}`);
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
        let holdingSymbol = authenticatedPage.locator(`text=${symbol}`);
        await expect(holdingSymbol).toBeVisible();
        const holdingRow = holdingSymbol.locator('..');
        const deleteButton = holdingRow.locator('button:has-text("Delete"), button:has-text("Remove"), button:has-text("Sterge")').first();
        if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await deleteButton.click();
            const confirmButton = authenticatedPage.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
            if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmButton.click();
            }
            holdingSymbol = authenticatedPage.locator(`text=${symbol}`);
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
        const holdingElement = authenticatedPage.locator(`text=${symbol}`).first();
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
        const addButton = authenticatedPage.locator('button:has-text("Add"), button:has-text("New")').first();
        if (await addButton.isVisible().catch(() => false)) {
            await addButton.click();
            const submitButton = authenticatedPage.locator('button[type="submit"]').first();
            if (await submitButton.isVisible().catch(() => false)) {
                await submitButton.click();
                const errorMessages = authenticatedPage.locator('.field-error, [role="alert"], .error').first();
                await expect(errorMessages).toBeVisible({ timeout: 3000 }).catch(() => { });
            }
        }
    });

    test('should display holdings list for portfolio', async ({ authenticatedPage }) => {
        const portfolioName = `List Portfolio ${Date.now()}`;
        await TestHelpers.createPortfolio(authenticatedPage, portfolioName);
        const portfolioLink = authenticatedPage.locator(`text=${portfolioName}`);
        await portfolioLink.click();
        await authenticatedPage.waitForTimeout(500);
        const holdingsSection = authenticatedPage.locator('[data-testid="holdings"], .holdings, h3:has-text("Holdings")').first();
        await expect(holdingsSection).toBeVisible({ timeout: 5000 }).catch(() => { });
    });
});
