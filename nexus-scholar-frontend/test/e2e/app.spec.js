import { test, expect } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await expect(page.locator('text=NEXUS SCHOLAR')).toBeVisible()
})

test('discover tab loads scholarships', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('text=Discover')
  await expect(page.locator('text=Türkiye Bursları')).toBeVisible()
})

test('AI consultant tab renders', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('text=AI Consultant')
  await expect(page.locator('text=Salam Sayyad')).toBeVisible()
})
