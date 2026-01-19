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

## Releasing

Use the release script to bump versions, create tags, and push:

```bash
./scripts/release.sh <bump-type> [channel]
```

**Bump types:**
- `major` - Bump major version (1.0.0 → 2.0.0)
- `minor` - Bump minor version (1.0.0 → 1.1.0)
- `patch` - Bump patch version (1.0.0 → 1.0.1)

**Channels (optional):**
- `alpha` - Add `-alpha` suffix (pre-release)
- `beta` - Add `-beta` suffix (pre-release)
- `stable` - No suffix (default if omitted)

**Examples:**
```bash
./scripts/release.sh minor alpha    # 1.0.0 → 1.1.0-alpha
./scripts/release.sh patch beta     # 1.1.0-alpha → 1.1.1-beta
./scripts/release.sh major          # 1.1.1-beta → 2.0.0 (stable)
./scripts/release.sh patch stable   # 1.0.0-alpha → 1.0.1 (removes suffix)
```

The script will:
1. Validate there are no uncommitted changes
2. Calculate the new version
3. Prompt for confirmation
4. Update `package.json`
5. Commit, tag, and push

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

### Default Print Templates

Default templates for surgery and followup notes are stored in `default_print_templates` table.

- **Source of truth**: `src/main/db/default-templates.ts` contains canonical template definitions
- **Templates**: `defaultSurgeryTemplate`, `defaultFollowupTemplate`, `defaultPageSettings`

**When updating default templates:**
1. Edit `src/main/db/default-templates.ts` (single place to modify)
2. Create a new migration that imports and applies the templates:
   ```typescript
   import { defaultSurgeryTemplate, defaultFollowupTemplate } from '../default-templates'

   export async function up(db: Kysely<any>): Promise<void> {
     await db.updateTable('default_print_templates')
       .set({ structure: JSON.stringify(defaultSurgeryTemplate) })
       .where('key', '=', 'surgery-standard')
       .execute()
   }
   ```
3. Register the migration in `src/main/db/migrations.ts`

This approach ensures all users get template updates when they run the new migration.

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
- Tailwind CSS 4 + Radix UI + Shadcn components
- TipTap for rich text editing
- React Query for data fetching

## Frontend Design System

**See [DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md) for comprehensive UI/UX documentation.**

### Quick Reference

**Layout Components** (`src/renderer/src/components/layouts/`):
- `PageLayout` - Base container with header for custom layouts
- `DetailLayout` - Sidebar (3-col) + main content (9-col) for view pages
- `FormLayout` - Form (2-col) + optional tips sidebar (1-col) for add/edit pages
- `PageHeader` - Universal header with back button, icon, title, actions
- `IconBox` - Colored icon container (sizes: sm/md/lg/xl)
- `InfoItem` - Label + value display for info cards

**Color Mapping**:
- Patients → `emerald`
- Doctors → `violet`
- Surgeries → `emerald`
- Tips/warnings → `amber`
- Identifiers (PHN, BHT) → `blue`

**Page Pattern Example**:
```tsx
<DetailLayout
  header={
    <PageHeader
      icon={User}
      iconColor="emerald"
      title="Patient Name"
      subtitle="PHN-12345"
      showBackButton
      actions={<Button variant="gradient">Edit</Button>}
    />
  }
  sidebar={<SidebarContent />}
>
  <MainContent />
</DetailLayout>
```

**Animation**: Use `animate-fade-in-up` for page entrance, stagger with `animationDelay`

**Themes**: 12 themes defined in `src/renderer/src/styles/themes.css`, applied via `data-theme` attribute
