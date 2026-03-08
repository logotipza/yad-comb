import { test, expect } from '@playwright/test';

test.describe('Customer Journey', () => {
    test('should complete the full flow from login to campaign generation', async ({ page }) => {
        // 1. Auth Page
        await page.goto('/');
        await expect(page.locator('h1')).toContainText('Добро пожаловать');

        // Click login (which links to /dashboard)
        await page.click('text=Войти через Яндекс');
        await expect(page).toHaveURL(/.*\/dashboard/);

        // 2. Dashboard - Idle State
        await expect(page.locator('text=Какой сайт будем продвигать?')).toBeVisible();
        await page.fill('input[type="url"]', 'https://example.com');
        await page.click('text=Сгенерировать');

        // 3. Dashboard - Analyzing Business -> Confirm Business
        // It takes ~3s to reach the confirm_business state
        await expect(page.locator('text=Вот как мы поняли ваш бизнес')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('textarea')).toBeVisible();

        // Proceed to Generation
        await page.click('text=Да, все верно. Создать семантику');

        // 4. Dashboard - Generating -> Results
        // It takes ~4 steps of 1.5s = ~6 seconds to reach results
        await expect(page.locator('text=Готовая кампания')).toBeVisible({ timeout: 10000 });

        // Check if DND list and Ad Previews are visible
        await expect(page.locator('text=Ключевые фразы')).toBeVisible();
        await expect(page.locator('text=Сгенерированные объявления')).toBeVisible();

        // Check if Toasts appeared
        await expect(page.locator('.toast-success')).toBeVisible();
    });

    test('should navigate through sidebar', async ({ page }) => {
        await page.goto('/dashboard');

        await page.click('text=Аудит');
        await expect(page).toHaveURL(/.*\/audit/);
        await expect(page.locator('text=Аудит кампаний')).toBeVisible();

        await page.click('text=Статистика');
        await expect(page).toHaveURL(/.*\/stats/);
        await expect(page.locator('text=Динамика показов')).toBeVisible();

        await page.click('text=Нейросети');
        await expect(page).toHaveURL(/.*\/settings/);
        await expect(page.locator('text=YandexGPT Pro 5.1')).toBeVisible();
    });
});
