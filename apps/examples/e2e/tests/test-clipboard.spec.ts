import { expect } from '@playwright/test'
import { Editor, sleep } from 'tldraw'
import { clickMenu, setup } from '../shared-e2e'
import test from './fixtures/fixtures'

declare const editor: Editor

test.describe('clipboard tests', () => {
	test.beforeEach(setup)

	test.beforeEach(async ({ page }) => {
		await page.keyboard.press('r')
		await page.mouse.move(100, 100)
		await page.mouse.down()
		await page.mouse.up()

		await expect.poll(() => page.evaluate(() => editor.getCurrentPageShapes().length)).toBe(1)
		await expect.poll(() => page.evaluate(() => editor.getSelectedShapes().length)).toBe(1)
	})

	test('copy and paste from keyboard shortcut', async ({ page, isMac }) => {
		const modifier = isMac ? 'Meta' : 'Control'

		await page.keyboard.down(modifier)
		await page.keyboard.press('KeyC')
		await sleep(100)
		await page.keyboard.press('KeyV')
		await page.keyboard.up(modifier)

		await expect.poll(() => page.evaluate(() => editor.getCurrentPageShapes().length)).toBe(2)
		await expect.poll(() => page.evaluate(() => editor.getSelectedShapes().length)).toBe(1)
	})

	test('copy and paste from main menu', async ({ page }) => {
		await clickMenu(page, 'main-menu.edit.copy')
		await sleep(100)
		await clickMenu(page, 'main-menu.edit.paste')

		await expect.poll(() => page.evaluate(() => editor.getCurrentPageShapes().length)).toBe(2)
		await expect.poll(() => page.evaluate(() => editor.getSelectedShapes().length)).toBe(1)
	})

	test('copy and paste from context menu', async ({ page }) => {
		await page.mouse.click(100, 100, { button: 'right' })
		await clickMenu(page, 'context-menu.copy')
		await sleep(100)
		await page.mouse.move(200, 200)
		await page.mouse.click(100, 100, { button: 'right' })
		await clickMenu(page, 'context-menu.paste')

		await expect.poll(() => page.evaluate(() => editor.getCurrentPageShapes().length)).toBe(2)
		await expect.poll(() => page.evaluate(() => editor.getSelectedShapes().length)).toBe(1)
	})

	test('copy and paste png from context menu', async ({ page }) => {
		await page.mouse.click(100, 100, { button: 'right' })
		await clickMenu(page, 'context-menu.copy-as.copy-as-png')
		await sleep(100)

		await page.mouse.move(400, 400)
		await page.mouse.click(100, 100, { button: 'right' })
		await clickMenu(page, 'context-menu.paste')
		await sleep(100)

		await expect.poll(() => page.evaluate(() => editor.getCurrentPageShapes().length)).toBe(2)
		await expect.poll(() => page.evaluate(() => editor.getOnlySelectedShape())).toMatchObject({
			type: 'image',
			props: { w: 264, h: 264 },
		})
		const imageWidth = await page
			.locator('.tl-image')
			.evaluate((img) => (img as HTMLImageElement).naturalWidth)
		expect(imageWidth).toBe(528)
	})

	test('copy png with context menu, paste with keyboard', async ({ page, isMac }) => {
		const modifier = isMac ? 'Meta' : 'Control'

		await page.mouse.click(100, 100, { button: 'right' })
		await clickMenu(page, 'context-menu.copy-as.copy-as-png')
		await sleep(100)

		await page.keyboard.down(modifier)
		await page.keyboard.press('KeyV')
		await sleep(100)
		await page.keyboard.up(modifier)
		await sleep(100)

		await expect.poll(() => page.evaluate(() => editor.getCurrentPageShapes().length)).toBe(2)

		// image should come in at the same size (200x200 + padding)
		await expect.poll(() => page.evaluate(() => editor.getOnlySelectedShape())).toMatchObject({
			type: 'image',
			props: { w: 264, h: 264 },
		})

		// but the actual image should be 2x that for retina displays
		const imageWidth = await page
			.locator('.tl-image')
			.evaluate((img) => (img as HTMLImageElement).naturalWidth)
		expect(imageWidth).toBe(528)
	})
})
