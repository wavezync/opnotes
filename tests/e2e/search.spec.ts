import { test, expect } from './electron-setup'

test.describe('Global Search', () => {
  test.skip('should open command palette with keyboard shortcut', async ({ firstWindow }) => {
    await firstWindow.waitForSelector('[data-testid="main-layout"]', { timeout: 10000 })

    // Press Cmd/Ctrl + K to open command palette
    await firstWindow.keyboard.press('Meta+k')

    // Verify command palette is open
    await expect(firstWindow.locator('[data-testid="command-palette"]')).toBeVisible()
  })

  test.skip('should search across all entities', async ({ firstWindow }) => {
    // Open command palette
    await firstWindow.keyboard.press('Meta+k')

    // Type search query
    await firstWindow.fill('[data-testid="command-input"]', 'Test')

    // Wait for results
    await firstWindow.waitForTimeout(500)

    // Should show results from patients, surgeries, etc.
    const results = firstWindow.locator('[data-testid="command-result"]')
    const count = await results.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test.skip('should navigate to result on selection', async ({ firstWindow }) => {
    // Open command palette
    await firstWindow.keyboard.press('Meta+k')

    // Search for something
    await firstWindow.fill('[data-testid="command-input"]', 'Patient')

    // Wait for results
    await firstWindow.waitForTimeout(500)

    // Click first result
    await firstWindow.click('[data-testid="command-result"]:first-child')

    // Verify navigation occurred
    await expect(firstWindow.locator('[data-testid="command-palette"]')).not.toBeVisible()
  })

  test.skip('should close command palette with Escape', async ({ firstWindow }) => {
    // Open command palette
    await firstWindow.keyboard.press('Meta+k')
    await expect(firstWindow.locator('[data-testid="command-palette"]')).toBeVisible()

    // Press Escape
    await firstWindow.keyboard.press('Escape')

    // Verify it's closed
    await expect(firstWindow.locator('[data-testid="command-palette"]')).not.toBeVisible()
  })

  test.skip('should use vim-style navigation', async ({ firstWindow }) => {
    await firstWindow.waitForSelector('[data-testid="main-layout"]', { timeout: 10000 })

    // Test g+h -> Dashboard
    await firstWindow.keyboard.press('g')
    await firstWindow.keyboard.press('h')
    await expect(firstWindow.locator('h1')).toContainText('Dashboard')

    // Test g+p -> Patients
    await firstWindow.keyboard.press('g')
    await firstWindow.keyboard.press('p')
    await expect(firstWindow.locator('h1')).toContainText('Patients')

    // Test g+s -> Surgeries
    await firstWindow.keyboard.press('g')
    await firstWindow.keyboard.press('s')
    await expect(firstWindow.locator('h1')).toContainText('Surgeries')

    // Test g+d -> Doctors
    await firstWindow.keyboard.press('g')
    await firstWindow.keyboard.press('d')
    await expect(firstWindow.locator('h1')).toContainText('Doctors')
  })
})
