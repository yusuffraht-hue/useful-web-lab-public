const { test, expect } = require('@playwright/test');

test('covers a batch, crops, undoes, exports, and reopens the edited PNG', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8117/');
  await page.getByRole('button', {name:'Try sample batch'}).click();
  await page.locator('#batch').check();
  const canvas = page.locator('#canvas');
  const drag = async (x1, y1, x2, y2) => {
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    await page.mouse.move(box.x+box.width*x1, box.y+box.height*y1);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width*x2, box.y+box.height*y2, {steps:4});
    await page.mouse.up();
  };
  await drag(.1,.3,.47,.57);
  await expect(page.getByRole('status')).toHaveText('Cover applied to 3 of 3 screenshots.');
  await page.locator('#picker').selectOption('2');
  const color = () => canvas.evaluate(node => [...node.getContext('2d').getImageData(200,200,1,1).data]);
  expect(await color()).toEqual([23,26,34,255]);
  await page.getByRole('button',{name:'Crop',exact:true}).click();
  await drag(.15,.15,.75,.8);
  expect(await canvas.evaluate(node => node.width)).toBeLessThan(800);
  await page.getByRole('button',{name:'Undo'}).click();
  expect(await canvas.evaluate(node => node.width)).toBe(800);
  const download = async name => {
    const [file] = await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name}).click()]);
    return file;
  };
  const zip = await download('Download batch ZIP');
  expect(zip.suggestedFilename()).toBe('cleaned-screenshots.zip');
  const png = await download('Download selected PNG');
  const path = testInfo.outputPath('export.png');
  await png.saveAs(path);
  await page.locator('#files').setInputFiles(path);
  await expect(page.getByRole('status')).toHaveText('1 opened.');
  expect(await color()).toEqual([23,26,34,255]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  expect(errors).toEqual([]);
});
