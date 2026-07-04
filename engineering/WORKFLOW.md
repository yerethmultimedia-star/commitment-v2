# Engineering Workflow & Lifecycle

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## Overview

All engineering activities in the Commitment project must follow the structured lifecycle defined below to preserve domain purity, maintain architectural standards, and avoid documentation drift.

```text
Specification
      ↓
Engineering Task
      ↓
Implementation
      ↓
Architecture Review
      ↓
Corrections
      ↓
    Merge
      ↓
Documentation Update
      ↓
Sprint Closure
```

---

## The Engineering Lifecycle

### 1. Specification

- **Description:** A detailed product or technical specification is drafted. It details the user goals, functional requirements, design philosophy, and UX wireframes or flows.
- **Location:** Saved under `engineering/specifications/` or `docs/`.

### 2. Engineering Task

- **Description:** The specification is broken down into structured, component-level tasks with explicit boundaries, checklist items, and constraints.
- **Location:** Placed in `engineering/tasks/` (e.g., `TASK-001-core-domain-foundation.md`).

### 3. Implementation

- **Description:** Code is implemented in accordance with the task specification. Business logic goes strictly into `packages/domain/`, infrastructure and frameworks go in `apps/` or infra layers. Tests (unit/integration) must be written/updated.
- **Rules:** The developer (human or AI) must respect the mandatory reading order and architecture freeze before starting.

### 4. Architecture Review

- **Description:** The implementation undergoes a rigorous review against the engineering principles and the Architecture Checklist.
- **Location:** The review findings are recorded in `engineering/reviews/`.

### 5. Corrections

- **Description:** Any defects, architectural violations, missing tests, or documentation gaps identified during review are resolved.

### 6. Merge

- **Description:** Once approved, the branch is merged into `main`.

### 7. Documentation Update

- **Description:** Project status, decision logs, tech debt registers, and relevant markdown documents are updated to reflect the new state of the repository.

### 8. Sprint Closure

- **Description:** The sprint is closed out, backlog updated, and next goals are aligned.

---

## Roles and Responsibilities

### Founder

- **Responsibilities:**
  - Defines the core vision, North Star, and business objectives of the product.
  - Establishes behavioral principles and desaturated color systems (calm design).
  - Performs high-level validation of deliverables to ensure product-market fit and alignment with principles.

### Architecture Review Board

- **Responsibilities:**
  - Preserves long-term maintainability, clean architecture, and framework-independence of the Domain.
  - Authorizes additions or modifications to the technology stack via formal ADR approval.
  - Performs structural code reviews and signs off on implementations before merge.

### Implementation Engineer

- **Responsibilities:**
  - Implements robust, type-safe, and self-documenting code.
  - Ensures test coverage for business rules (unit tests) and infrastructure integration.
  - Strictly follows DDD boundaries and prevents framework leakages.

### AI Assistants

- **Responsibilities:**
  - Operate as autonomous, highly disciplined Implementation Engineers under the constraint of `engineering/system-prompt.md`.
  - Treat the repository as the single source of truth; **never guess** or rely on conversational memory outside the codebase.
  - If any documentation is missing or ambiguous, **STOP** and report the issue immediately.
  - Must not alter architecture, introduce libraries, or violate stack freeze without explicit board instruction.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial draft of the Engineering Workflow and Roles.
