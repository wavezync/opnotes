# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Op Notes is a surgical notes management desktop application for hospitals built with Electron, React, and SQLite. It manages patient records, surgery notes, doctor information, and follow-up records.

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Development mode with hot reload
pnpm build            # Full build with typecheck
pnpm lint             # ESLint with auto-fix
pnpm typecheck        # TypeScript compilation check
pnpm format           # Run prettier formatter
pnpm build:mac        # Build macOS app
pnpm build:win        # Build Windows installer
pnpm build:linux      # Build Linux packages
```

## Architecture

### Electron Process Structure

```
Main Process (src/main/)
├── index.ts          # Window creation, auto-update, IPC setup
├── api.ts            # Centralized IPC handler routing
├── db.ts             # Kysely + SQLite initialization
├── db/migrations/    # Database schema migrations
└── repository/       # Data access layer (patient.ts, doctor.ts, surgery.ts)

Preload (src/preload/)
└── index.ts          # Context bridge exposing window.api.invoke()

Renderer Process (src/renderer/src/)
├── main.tsx          # React root with router, QueryClient, providers
├── routes/           # Page components (patients/, doctors/, surgeries/, settings/)
├── components/       # UI components (ui/ for Radix/Shadcn, domain-specific folders)
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
└── lib/queries.ts    # React Query key factory
```

### IPC Communication Pattern

All renderer-to-main communication uses a single IPC channel:
```typescript
// Renderer calls:
window.api.invoke('methodName', ...args)

// Main process handles in api.ts:
ipcMain.handle('invokeApiCall', (event, method, ...args) => api[method](...args))
```

API methods return `{ result }` on success or `{ error }` on failure.

### Database

- **Engine**: SQLite with better-sqlite3, Kysely query builder
- **Location**: `~/.opnotes/data.db`
- **Tables**: patients, doctors, surgeries, surgery_followups, surgery_doctors_done_by, surgery_doctors_assisted_by, app_settings
- **FTS tables**: patients_fts, surgeries_fts, doctors_fts for full-text search
- **Migrations**: Code-based in `src/main/db/migrations/`. When adding a new migration:
  1. Create file `src/main/db/migrations/NNN_name.ts` with `up()` and `down()` functions
  2. **Register it** in `src/main/db/migrations.ts` (import and add to default export)

### Key Type Definitions

- Database schema types: `src/shared/types/db.d.ts`
- API filter types: `src/shared/types/api.d.ts`
- Preload API types: `src/preload/index.d.ts`

### State Management

- **Server state**: React Query with 10-second stale time
- **Forms**: React Hook Form with Zod validation
- **Global settings**: React Context (SettingsContext)
- **Routing**: React Router with hash-based routing

### Printing

Separate print window loads `src/renderer/print.html`. Data passed via IPC `printData` event. Templates use Handlebars in `resources/templates/`.

### Onboarding

- **Trigger**: `onboarding_completed` setting in app_settings table
- **Location**: `src/renderer/src/components/onboarding/`
- **Gate**: `OnboardingGate` component in `routes/root.tsx` controls wizard visibility
- **Flow**: SplashScreen → SettingsProvider loads → OnboardingGate checks flag → shows wizard or MainLayout
- **Re-run**: Users can re-run wizard from Settings > General via "Run Setup Wizard" button
- **Migration**: `006_onboarding_setting.ts` auto-detects existing configured users (hospital+unit set)

## Tech Stack

- Electron 28 + electron-vite
- React 18 + TypeScript 5.3
- Kysely (type-safe SQL) + better-sqlite3
- Tailwind CSS + Radix UI + Shadcn components
- TipTap for rich text editing
- React Query for data fetching
