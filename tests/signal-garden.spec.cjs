const { test, expect } = require('@playwright/test');

test('solves the garden, undoes the final move, and resets', async ({ page }) => {
  const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8117/';
  await page.goto(new URL('signal-garden/', base.endsWith('/') ? base : base + '/').href);
  const status = page.getByRole('status');
  const initial = await status.textContent();
  expect(initial).toMatch(/Moves 0$/);
  for (const index of [1, 7, 14]) {
    await page.getByRole('button',{name:'Tile ' + index,exact:true}).click();
  }
  await expect(status).toHaveText('Garden lit in 3 moves!');
  await page.getByRole('button',{name:'Undo'}).click();
  await expect(status).toHaveText(/Moves 2$/);
  await page.getByRole('button',{name:'Restart puzzle'}).click();
  await expect(status).toHaveText(initial);
});
