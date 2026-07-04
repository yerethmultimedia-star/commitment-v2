# Playbook: Feature Development

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 🎯 Goal

Provide a clean step-by-step developer guideline for implementing a feature in Commitment, ensuring strict DDD boundaries and test coverage.

## 🔄 Step-by-Step Procedure

### 1. Context Synchronization

Before writing any code or configuration:

1. Fetch latest changes from remote.
2. Read the mandatory reading order entry points.
3. Open and review the target task file in `engineering/tasks/`.

### 2. Branching Policy

- Create a feature branch named `feat/TASK-ID-short-description` (e.g. `feat/TASK-001-domain-core`) from the latest `main` branch.

### 3. Specification & Tests First

1. If the technical contract is complex, write or review the specification under `engineering/specifications/`.
2. Write unit test definitions (e.g. in `src/core/__tests__/`) outlining the expected behaviors of aggregates and invariants.

### 4. Domain Logic Implementation

- Implement aggregates, value objects, and events inside `packages/domain/`.
- Ensure **zero** dependencies on external web or database frameworks.
- Verify that state transitions are triggered _only_ by applying domain events.

### 5. Infrastructure Adapters

- Implement database maps, NestJS services/controllers, or Flutter UI screens under `apps/backend/` and `apps/mobile/`.
- Use the anticorruption layer (ACL) mappings to translate input/output payloads into domain models.

### 6. Pipeline Verification

Ensure everything is green locally:

```bash
npx pnpm run build
npx pnpm run lint
npx pnpm test
```

### 7. Documentation & Review

- Update `walkthrough.md` in the root workspace.
- Create an architecture review draft under `engineering/reviews/` using `REVIEW_TEMPLATE.md`.
- Ask the Architecture Review Board or user for feedback.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial draft of the Feature Development playbook.
