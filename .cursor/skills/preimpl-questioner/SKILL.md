---
name: preimpl-questioner
description: Ask deep clarifying questions before implementation to reduce rework. Use when requirements are ambiguous, involve auth/data model/API changes, or touch multiple backend layers.
---

# Pre-implementation questioner

## When to use

Use before starting implementation when:

- Requirements are unclear or underspecified
- A change touches multiple layers (`data/services/api/server`)
- Security/auth, data model, or API contracts are involved

## How to run

Before coding, ask a focused set of questions. Prefer **5–10 high-signal** questions over many small ones.

## Question areas (backend)

- **Goal / user story**
  - What is the exact behavior? What is explicitly out of scope?
- **API contract**
  - Routes, params, request/response shapes, error codes/messages
  - Access: `none` vs `access` vs `refresh` for each endpoint
- **Data model**
  - Entities + required fields, relationships, indexes
  - Migration/DDL expectations (if any)
- **Business rules**
  - Validation rules, uniqueness, limits, pagination, ordering
- **Edge cases**
  - Not found handling, idempotency, concurrency, retries
- **Non-functional**
  - Performance constraints, logging, rate limits
- **Testing**
  - What minimal test cases prove correctness?

## Output format

Return:

1. **Questions** (grouped by topic)
2. **Assumptions if unanswered** (explicit)
3. **Proposed implementation slice** (smallest shippable step)

