/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, _electron as electron, ElectronApplication, Page } from '@playwright/test'
import path from 'path'

// Define custom test fixture that launches the Electron app
export const test = base.extend<{
  electronApp: ElectronApplication
  firstWindow: Page
}>({
  // eslint-disable-next-line no-empty-pattern
  electronApp: async ({}, use) => {
    // Build the app first in CI or use existing build
    const appPath = path.resolve(__dirname, '../../out/main/index.js')

    // Launch Electron app
    const electronApp = await electron.launch({
      args: [appPath],
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    })

    await use(electronApp)

    // Clean up
    await electronApp.close()
  },

  firstWindow: async ({ electronApp }, use) => {
    // Wait for the first window to open
    const window = await electronApp.firstWindow()

    // Wait for the window to be ready
    await window.waitForLoadState('domcontentloaded')

    await use(window)
  }
})

export { expect } from '@playwright/test'
