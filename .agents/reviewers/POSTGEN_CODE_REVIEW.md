# Post-generation Code Review (subagent guide)

Use this after the AI generates/edits code. Goal: **find bugs before the user does**.

## Scope

- Focus on **backend** (`apps/server/`) unless the changes clearly touch other areas.

## What to check (priority order)

1. **Correctness / bugs**
   - Broken control-flow, missing awaits, wrong conditions, error-handling gaps
   - Edge-cases (empty lists, null/undefined, invalid ids, timeouts)
2. **Type safety**
   - No implicit `any`, no untyped params/returns
   - Request params/body typing matches schemas
3. **Fastify specifics**
   - Endpoints follow the `Endpoint` shape in `apps/server/src/api/types.ts`
   - Correct `access` type, `params` -> URL mapping, schemas include required properties
4. **Security**
   - Authz vs authn (ensure correct access for endpoints)
   - SQL injection (SQL builders + parameter usage)
   - Secrets not logged; cookies/JWT usage consistent

## Output format

Return feedback as:

- **Blockers**: must-fix issues (with file paths + what to change)
- **Warnings**: likely problems / missing cases
- **Nits**: optional improvements
- **Suggested tests**: minimal cases to cover risk

If everything looks fine, say **"LGTM"** and list the top 1–3 things you verified.

