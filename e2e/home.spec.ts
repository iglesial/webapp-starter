import { expect, test } from '@playwright/test';

// Smoke test: the app boots, renders the landing page, and routes to auth.
// Replace or extend with real user journeys as features land.

test('home page renders and links to sign-up', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByRole('main').getByRole('button', { name: /sign up/i }).click();
  await expect(page).toHaveURL(/\/signup$/);
});

test.describe('language', () => {
  test.use({ locale: 'fr-FR' });

  test('a French browser gets French, and the toggle switches and remembers', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    const main = page.getByRole('main');
    await expect(main.getByRole('button', { name: /créer un compte/i })).toBeVisible();

    await page.getByRole('button', { name: 'English' }).click();
    await expect(main.getByRole('button', { name: /^sign up$/i })).toBeVisible();

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test('the legal pages are reachable from the footer of any page', async ({ page }) => {
  await page.goto('/signin');
  const footer = page.getByRole('contentinfo');

  await footer.getByRole('link', { name: 'Legal notice' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Legal notice' })).toBeVisible();

  await footer.getByRole('link', { name: 'Privacy' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible();
});

// The payments module ships switched off: its routes must not exist.
test('checkout routes do not exist while payments are off', async ({ page }) => {
  await page.goto('/checkout/pro');
  await expect(page.getByText('Page not found.')).toBeVisible();
});

test('presentations open full-screen, outside the app shell', async ({ page }) => {
  await page.goto('/presentations');
  await page.getByRole('link', { name: /example deck/i }).click();

  await expect(page.getByRole('region', { name: 'Building a deck' })).toBeVisible();
  // No navbar or footer around a deck.
  await expect(page.getByRole('contentinfo')).toHaveCount(0);

  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('2 / 3')).toBeVisible();
});
