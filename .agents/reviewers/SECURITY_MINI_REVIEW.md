# Security Mini Review (subagent guide)

Use this after the AI generates/edits code. Goal: **catch obvious security issues quickly**.

## Scope

- Prefer focusing on `apps/server/` (auth, sessions, DB, endpoints).
- Include `apps/client/` only for client-side token handling and unsafe request patterns.

## What to check (priority order)

1. **Authn/authz correctness**
   - Endpoint `access` is correct (`none` vs `access` vs `refresh`)
   - Ownership checks for user-scoped resources (not just “logged in”)
2. **Validation & parsing**
   - JSON Schema covers params/query/body
   - No unsafe parsing, no trusting client-sent IDs without checks
3. **Secrets & sensitive data**
   - No secrets/tokens in logs
   - No sensitive fields returned by endpoints unintentionally
4. **SQL injection**
   - Parameterized queries only; no string interpolation of user input
5. **Session/JWT/Cookies**
   - Refresh flow is safe; cookie flags (`HttpOnly`, `Secure`, `SameSite`) consistent with env
6. **Uploads / URLs / SSRF**
   - Validate file metadata; avoid fetching arbitrary URLs without restrictions

## Output format

Return feedback as:

- **Blockers**: must-fix issues (with file paths + what to change)
- **Warnings**: likely risks / missing checks
- **Nits**: optional hardening
- **Suggested tests**: minimal cases to cover risk

If everything looks fine, say **"No major security issues found"** and list the top 1–3 things you verified.

