# Nightly Distribution Channel Implementation Plan

**Date:** 2026-01-19
**Status:** Approved for implementation

## Overview

Add a manually-triggered GitHub Actions workflow for nightly/experimental builds, separate from the existing tagged release workflow.

## Key Design Decisions

1. **Manual trigger only** - Uses `workflow_dispatch` with optional inputs
2. **Rolling `nightly-latest` tag** - Single pre-release that gets replaced on each build
3. **Version stamping** - Temporarily modifies `package.json` for build only (e.g., `0.0.11-nightly.20260119`)
4. **Pre-release flag** - Ensures auto-updater channel separation without code changes
5. **No changes to existing workflow** - Stable releases continue working as-is

## Files to Create

### `.github/workflows/nightly.yaml`

New workflow with:
- `workflow_dispatch` trigger with inputs:
  - `version_suffix` - Optional custom suffix (defaults to date-based)
  - `release_notes` - Notes for the release
  - `replace_existing` - Whether to delete existing nightly release (default: true)
- Prepare job: generates version, deletes existing nightly if needed
- Build jobs: matrix build for ubuntu/macos/windows (same as release.yaml)
- Release job: downloads artifacts, creates single pre-release

Key differences from `release.yaml`:
- Uses artifact upload/download pattern to consolidate all platform builds into one release
- Sets `prerelease: true` instead of `draft: true`
- Stamps version before build: `npm pkg set version="${NIGHTLY_VERSION}"`
- Fixed tag `nightly-latest` that gets replaced

## Workflow Structure

```yaml
name: Nightly Build

on:
  workflow_dispatch:
    inputs:
      version_suffix:
        description: 'Version suffix (empty = auto date-based)'
        required: false
        default: ''
      release_notes:
        description: 'Release notes'
        required: false
        default: 'Experimental nightly build for testing purposes.'
      replace_existing:
        description: 'Replace existing nightly-latest release'
        required: false
        type: boolean
        default: true

jobs:
  prepare:     # Generate version, delete existing release
  build:       # Matrix build (ubuntu, macos, windows) with artifact upload
  release:     # Download artifacts, create pre-release
```

## Version Format

- Default: `{base_version}-nightly.{YYYYMMDD}` → `0.0.11-nightly.20260119`
- Custom: `{base_version}-{suffix}` → `0.0.11-alpha.1` or `0.0.11-rc.1`

## Release Details

| Property | Value |
|----------|-------|
| Tag | `nightly-latest` |
| Name | `Nightly Build - 0.0.11-nightly.20260119` |
| Pre-release | Yes |
| Draft | No |

## How to Trigger

**GitHub UI:**
1. Go to Actions → Nightly Build → Run workflow
2. Optionally customize inputs
3. Click "Run workflow"

**CLI:**
```bash
gh workflow run nightly.yaml
```

## No Changes Required To

- `electron-builder.yml` - Version in artifact names handled automatically
- `package.json` - Base version remains unchanged in repo
- `src/main/updater.ts` - Pre-release flag handles channel separation
- Existing `release.yaml` - Stable workflow unchanged

## Future Enhancements (Optional)

If users need to opt into nightly auto-updates:
1. Add `update_channel` setting in app_settings
2. Modify `updater.ts` to set `allowPrerelease` based on setting
3. Add UI toggle in Settings

## Verification

1. Trigger workflow manually from GitHub Actions
2. Verify all three platform builds complete
3. Check GitHub Releases for new `nightly-latest` pre-release
4. Download and test installer from each platform
5. Verify auto-updater on stable installs does NOT offer nightly update
