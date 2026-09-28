import { expect, test } from '@playwright/test';

// Smoke test: the app boots, renders the landing page, and routes to auth.
// Replace or extend with real user journeys as features land.

test('home page renders and links to sign-up', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.getByRole('button', { name: /sign up/i }).click();
  await expect(page).toHaveURL(/\/signup$/);
});
