import { test, expect } from './electron-setup'

test.describe('Onboarding', () => {
  // Note: These tests require a fresh database without onboarding_completed flag
  // They are marked as skipped by default

  test.skip('should show onboarding wizard on first launch', async ({ firstWindow }) => {
    // Wait for app to load
    await firstWindow.waitForLoadState('domcontentloaded')

    // Check if onboarding wizard is visible
    await expect(firstWindow.locator('[data-testid="onboarding-wizard"]')).toBeVisible({
      timeout: 10000
    })
  })

  test.skip('should complete onboarding steps', async ({ firstWindow }) => {
    await firstWindow.waitForSelector('[data-testid="onboarding-wizard"]', { timeout: 10000 })

    // Step 1: Welcome
    await expect(firstWindow.locator('[data-testid="onboarding-step-welcome"]')).toBeVisible()
    await firstWindow.click('[data-testid="onboarding-next"]')

    // Step 2: Hospital Information
    await expect(firstWindow.locator('[data-testid="onboarding-step-hospital"]')).toBeVisible()
    await firstWindow.fill('[data-testid="hospital-name"]', 'Test Hospital')
    await firstWindow.fill('[data-testid="unit-name"]', 'Surgery Unit')
    await firstWindow.click('[data-testid="onboarding-next"]')

    // Step 3: Theme Selection
    await expect(firstWindow.locator('[data-testid="onboarding-step-theme"]')).toBeVisible()
    await firstWindow.click('[data-testid="theme-aurora-light"]')
    await firstWindow.click('[data-testid="onboarding-next"]')

    // Step 4: Backup Configuration
    await expect(firstWindow.locator('[data-testid="onboarding-step-backup"]')).toBeVisible()
    await firstWindow.click('[data-testid="onboarding-finish"]')

    // Verify main layout is now visible
    await expect(firstWindow.locator('[data-testid="main-layout"]')).toBeVisible({ timeout: 5000 })
  })

  test.skip('should allow skipping onboarding', async ({ firstWindow }) => {
    await firstWindow.waitForSelector('[data-testid="onboarding-wizard"]', { timeout: 10000 })

    // Click skip button
    await firstWindow.click('[data-testid="onboarding-skip"]')

    // Verify main layout is visible
    await expect(firstWindow.locator('[data-testid="main-layout"]')).toBeVisible({ timeout: 5000 })
  })

  test.skip('should rerun onboarding from settings', async ({ firstWindow }) => {
    // First complete initial onboarding or skip
    await firstWindow.waitForLoadState('domcontentloaded')

    // Navigate to settings
    await firstWindow.click('[data-testid="nav-settings"]')

    // Find and click "Run Setup Wizard" button
    await firstWindow.click('[data-testid="run-setup-wizard"]')

    // Verify onboarding wizard appears
    await expect(firstWindow.locator('[data-testid="onboarding-wizard"]')).toBeVisible()
  })
})
