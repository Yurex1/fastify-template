---
name: postgen-code-review
description: Review code after AI generation/edits to find bugs, type issues, Fastify/schema mistakes, and security problems. Use immediately after the agent changes files, before continuing implementation.
---

# Post-generation code review

## When to use

Use after the AI edits code (especially `apps/server/`) before doing more work.

## How to run

Launch a subagent (Task) described as "post-generation code review" and ask it to:

- Review the full diff/changed files.
- Prioritize: correctness → type safety → Fastify specifics → security.
- Produce a short list of **Blockers/Warns/Nits** with file paths.

## Checklist (backend)

- Verify changes respect the layering: `api -> services -> data -> infra`
- Ensure endpoints conform to `apps/server/src/api/types.ts`:
  - `method`, `access`, optional `params`, `schema`, `handler`
- Confirm `params` matches URL params behavior in `apps/server/src/server/http.ts`
- Check schema/typing alignment for request params/body and response shapes
- Ensure no implicit `any`, no untyped function params/returns
- Check security: access levels, JWT/cookies usage, SQL is parameterized

## Reference

- Reviewer guide: `.agents/reviewers/POSTGEN_CODE_REVIEW.md`

