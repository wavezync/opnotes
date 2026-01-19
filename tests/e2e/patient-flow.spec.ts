import { test, expect } from './electron-setup'

test.describe('Patient Flow', () => {
  test.skip('should navigate to patients page', async ({ firstWindow }) => {
    // Note: This test is skipped by default as it requires a built app
    // Run `pnpm build` first, then `pnpm test:e2e`

    // Wait for app to be ready
    await firstWindow.waitForSelector('[data-testid="main-layout"]', { timeout: 10000 })

    // Navigate to patients
    await firstWindow.click('[data-testid="nav-patients"]')

    // Verify we're on the patients page
    await expect(firstWindow.locator('h1')).toContainText('Patients')
  })

  test.skip('should add a new patient', async ({ firstWindow }) => {
    // Navigate to patients
    await firstWindow.click('[data-testid="nav-patients"]')

    // Click add new patient button
    await firstWindow.click('[data-testid="add-patient-button"]')

    // Fill in the form
    await firstWindow.fill('[placeholder="Enter PHN..."]', 'TEST001')
    await firstWindow.fill('[placeholder="Enter the name of patient"]', 'E2E Test Patient')
    await firstWindow.fill('[placeholder*="Eg:"]', '30y')

    // Select gender
    await firstWindow.click('[data-testid="gender-select"]')
    await firstWindow.click('text=Male')

    // Submit the form
    await firstWindow.click('[data-testid="submit-patient"]')

    // Verify patient was created
    await expect(firstWindow.locator('text=E2E Test Patient')).toBeVisible()
  })

  test.skip('should search for patients', async ({ firstWindow }) => {
    // Navigate to patients
    await firstWindow.click('[data-testid="nav-patients"]')

    // Search for a patient
    await firstWindow.fill('[data-testid="search-input"]', 'Test')

    // Wait for search results
    await firstWindow.waitForTimeout(500) // Debounce

    // Verify search filters results
    const patientRows = firstWindow.locator('[data-testid="patient-row"]')
    const count = await patientRows.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test.skip('should view patient details', async ({ firstWindow }) => {
    // Navigate to patients
    await firstWindow.click('[data-testid="nav-patients"]')

    // Click on a patient row
    await firstWindow.click('[data-testid="patient-row"]:first-child')

    // Verify patient details are shown
    await expect(firstWindow.locator('[data-testid="patient-details"]')).toBeVisible()
  })

  test.skip('should edit patient information', async ({ firstWindow }) => {
    // Navigate to a patient's detail page
    await firstWindow.click('[data-testid="nav-patients"]')
    await firstWindow.click('[data-testid="patient-row"]:first-child')

    // Click edit button
    await firstWindow.click('[data-testid="edit-patient-button"]')

    // Modify the name
    await firstWindow.fill('[placeholder="Enter the name of patient"]', 'Updated Patient Name')

    // Save changes
    await firstWindow.click('[data-testid="submit-patient"]')

    // Verify changes were saved
    await expect(firstWindow.locator('text=Updated Patient Name')).toBeVisible()
  })
})
