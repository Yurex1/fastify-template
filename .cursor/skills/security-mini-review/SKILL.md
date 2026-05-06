---
name: security-mini-review
description: Perform a lightweight security review of AI-made changes (authz/authn, input validation, secrets, SQL injection, cookies/JWT) and report Blockers/Warns/Nits.
---

# Security mini review

## When to use

Use after the AI edits code that affects:

- Auth/session/JWT/cookies (`apps/server/src/utils/sessions/**`, `apps/server/src/api/auth/**`, etc.)
- Access control (`endpoint.access`, user-owned resources)
- Database queries / SQL builders (`apps/server/src/data/**`)
- File uploads / external services (`photo`, `s3`, `firebase`)
- Any new endpoint or schema

## How to run

Review the diff/changed files and check (priority order):

1. **Authorization**: correct `access` level; verify ownership checks (not just authentication)
2. **Input validation**: JSON schema covers params/query/body; no trusting client
3. **Secrets**: no logging secrets; env vars not committed; tokens not returned accidentally
4. **SQL injection**: parameterized queries only; no string concatenation of user input
5. **Cookie/JWT correctness**: secure flags, refresh flow, token expiration handling
6. **SSRF / unsafe URLs**: when fetching remote resources, validate/allowlist if needed

## Output format

Return:

- **Blockers**: must-fix security issues (file + exact risk + what to change)
- **Warnings**: likely risks / missing checks
- **Nits**: minor hardening
- **Suggested tests**: minimal cases to prevent regressions

If all good, say **"No major security issues found"** and list 2–3 key checks you verified.

## Reference

- Reviewer guide: `.agents/reviewers/SECURITY_MINI_REVIEW.md`

