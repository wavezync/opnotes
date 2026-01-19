import { test, expect } from './electron-setup'

test.describe('Settings', () => {
  test.skip('should navigate to settings page', async ({ firstWindow }) => {
    await firstWindow.waitForSelector('[data-testid="main-layout"]', { timeout: 10000 })

    await firstWindow.click('[data-testid="nav-settings"]')

    await expect(firstWindow.locator('h1')).toContainText('Settings')
  })

  test.skip('should update hospital name', async ({ firstWindow }) => {
    await firstWindow.click('[data-testid="nav-settings"]')

    // Find and update hospital name
    await firstWindow.fill('[data-testid="hospital-name-input"]', 'E2E Test Hospital')

    // Save settings
    await firstWindow.click('[data-testid="save-settings"]')

    // Verify toast or success message
    await expect(firstWindow.locator('text=Settings saved')).toBeVisible({ timeout: 5000 })
  })

  test.skip('should switch theme', async ({ firstWindow }) => {
    await firstWindow.click('[data-testid="nav-settings"]')

    // Click theme selector
    await firstWindow.click('[data-testid="theme-selector"]')

    // Select a dark theme
    await firstWindow.click('[data-testid="theme-ocean-dark"]')

    // Verify theme was applied (check data-theme attribute)
    await expect(firstWindow.locator('html')).toHaveAttribute('data-theme', /dark/)
  })

  test.skip('should configure backup settings', async ({ firstWindow }) => {
    await firstWindow.click('[data-testid="nav-settings"]')

    // Navigate to backup tab
    await firstWindow.click('[data-testid="tab-backup"]')

    // Enable automatic backups
    await firstWindow.click('[data-testid="backup-enabled-toggle"]')

    // Set backup frequency
    await firstWindow.click('[data-testid="backup-frequency"]')
    await firstWindow.click('text=Daily')

    // Save
    await firstWindow.click('[data-testid="save-backup-settings"]')

    // Verify settings saved
    await expect(firstWindow.locator('text=Backup settings saved')).toBeVisible({ timeout: 5000 })
  })

  test.skip('should trigger manual backup', async ({ firstWindow }) => {
    await firstWindow.click('[data-testid="nav-settings"]')
    await firstWindow.click('[data-testid="tab-backup"]')

    // Click manual backup button
    await firstWindow.click('[data-testid="manual-backup-button"]')

    // Wait for backup to complete
    await expect(firstWindow.locator('text=Backup created')).toBeVisible({ timeout: 10000 })
  })
})
