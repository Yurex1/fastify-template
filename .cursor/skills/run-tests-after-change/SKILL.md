---
name: run-tests-after-change
description: After code edits, run the smallest relevant test/lint/build commands for the affected app(s) (apps/server and/or apps/client) and report a concise result.
---

# Run tests after change

## When to use

Use after the AI edits code, especially:

- `apps/server/**` (backend behavior, schemas, auth, DB)
- `apps/client/**` (UI, API calls, state)

Skip only if the change is docs-only.

## How to run (minimal relevant checks)

Determine which app(s) changed and run only the relevant checks:

### If backend changed (`apps/server/**`)

- `pnpm -C apps/server lint`
- `pnpm -C apps/server test`

If the change is purely type-level or build-related, also run:

- `pnpm -C apps/server build`

### If client changed (`apps/client/**`)

- `pnpm -C apps/client lint`
- `pnpm -C apps/client build`

### If both changed

Run the backend checks first, then client checks.

## Output format

Return:

- **Commands run** (in order)
- **Result**: PASS / FAIL
- **If FAIL**: include the first actionable error lines and the file(s) implicated

