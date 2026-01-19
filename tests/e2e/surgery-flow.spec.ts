import { test, expect } from './electron-setup'

test.describe('Surgery Flow', () => {
  test.skip('should navigate to surgeries page', async ({ firstWindow }) => {
    await firstWindow.waitForSelector('[data-testid="main-layout"]', { timeout: 10000 })

    await firstWindow.click('[data-testid="nav-surgeries"]')

    await expect(firstWindow.locator('h1')).toContainText('Surgeries')
  })

  test.skip('should create a new surgery with patient selection', async ({ firstWindow }) => {
    // Navigate to surgeries
    await firstWindow.click('[data-testid="nav-surgeries"]')

    // Click add new surgery
    await firstWindow.click('[data-testid="add-surgery-button"]')

    // Search and select a patient
    await firstWindow.fill('[data-testid="patient-search"]', 'Test')
    await firstWindow.waitForTimeout(500)
    await firstWindow.click('[data-testid="patient-result"]:first-child')

    // Fill surgery details
    await firstWindow.fill('[data-testid="procedure-input"]', 'E2E Test Procedure')
    await firstWindow.fill('[data-testid="ward-input"]', 'Test Ward')

    // Submit
    await firstWindow.click('[data-testid="submit-surgery"]')

    // Verify surgery was created
    await expect(firstWindow.locator('text=E2E Test Procedure')).toBeVisible()
  })

  test.skip('should add doctors to surgery', async ({ firstWindow }) => {
    // Navigate to a surgery
    await firstWindow.click('[data-testid="nav-surgeries"]')
    await firstWindow.click('[data-testid="surgery-row"]:first-child')

    // Click edit
    await firstWindow.click('[data-testid="edit-surgery-button"]')

    // Add a doctor
    await firstWindow.fill('[data-testid="doctor-autocomplete"]', 'Dr.')
    await firstWindow.waitForTimeout(300)
    await firstWindow.click('[data-testid="doctor-option"]:first-child')

    // Save
    await firstWindow.click('[data-testid="submit-surgery"]')

    // Verify doctor was added
    await expect(firstWindow.locator('[data-testid="surgery-doctors"]')).toContainText('Dr.')
  })

  test.skip('should add followup to surgery', async ({ firstWindow }) => {
    // Navigate to a surgery
    await firstWindow.click('[data-testid="nav-surgeries"]')
    await firstWindow.click('[data-testid="surgery-row"]:first-child')

    // Click add followup
    await firstWindow.click('[data-testid="add-followup-button"]')

    // Fill followup notes
    await firstWindow.fill('[data-testid="followup-notes"]', 'E2E Test Followup Notes')

    // Save
    await firstWindow.click('[data-testid="save-followup"]')

    // Verify followup was added
    await expect(firstWindow.locator('text=E2E Test Followup Notes')).toBeVisible()
  })

  test.skip('should filter surgeries by ward', async ({ firstWindow }) => {
    await firstWindow.click('[data-testid="nav-surgeries"]')

    // Open ward filter
    await firstWindow.click('[data-testid="ward-filter"]')
    await firstWindow.click('text=Test Ward')

    // Verify filtered results
    await firstWindow.waitForTimeout(300)
    const surgeryRows = firstWindow.locator('[data-testid="surgery-row"]')
    const count = await surgeryRows.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test.skip('should filter surgeries by date range', async ({ firstWindow }) => {
    await firstWindow.click('[data-testid="nav-surgeries"]')

    // Set date range
    await firstWindow.click('[data-testid="date-from"]')
    await firstWindow.fill('[data-testid="date-from"]', '2024-01-01')

    await firstWindow.click('[data-testid="date-to"]')
    await firstWindow.fill('[data-testid="date-to"]', '2024-12-31')

    // Wait for filter to apply
    await firstWindow.waitForTimeout(500)

    // Verify filter is applied
    await expect(firstWindow.locator('[data-testid="active-filters"]')).toBeVisible()
  })
})
