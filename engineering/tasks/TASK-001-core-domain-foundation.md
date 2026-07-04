---
id: TASK-001
title: Core Domain Foundation
status: Draft
owner: Architecture Review Board
created: 2026-07-04
updated: 2026-07-04
version: 1.0.0
related_docs:
  - docs/02-domain/bounded_contexts.md
related_adrs: []
description: Set up pure domain models, aggregates, commands, and events for Bounded Contexts.
---

# ENGINEERING TASK: TASK-001 - Core Domain Foundation

Epic: EPIC-001 Core Domain Foundation
Priority: Critical
Status: Draft
Version: 1.0

---

## 🎯 Objective

Implement the pure domain models, aggregates, commands, and events for the `Identity & Profile` and `Commitment Lifecycle & Execution` Bounded Contexts under `packages/domain/src/`. This step creates the core business rules and aggregates of the Commitment engine, completely decoupled from any presentation framework or persistence databases.

## 🛠️ Context & Design

- **Why it's needed:** The business logic (invariants and state transitions) must be defined and tested in pure TypeScript before any backend API or mobile application logic is written.
- **DDD Boundaries:**
  - `Identity & Profile Context` manages the `User` aggregate root and their core values/anchor profile.
  - `Commitment Lifecycle & Execution Context` manages the `Commitment` aggregate root, including invariants (e.g., max 3 active pending microactions, no archive without metacognitive reflection).
- **Core Abstractions:** Aggregates will extend the base `AggregateRoot` class defined in `packages/domain/src/core/aggregate-root.base.ts`.

## 📋 Requirements & Modifications

### Pure Domain Package (`@commitment/domain`)

#### [NEW] [user.aggregate.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/identity/user.aggregate.ts)

- Implement the `User` aggregate root class.
- Manage user registration, core value system mapping, and identity anchor profile.
- Hydrate and apply events: `UserRegisteredEvent`, `ValueSystemUpdatedEvent`, `IdentityAnchorAlignedEvent`.

#### [NEW] [commitment.aggregate.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/execution/commitment.aggregate.ts)

- Implement the `Commitment` aggregate root class.
- Support core fields: `anchor`, `goal`, `microActions`, `stateMachine`.
- Enforce business invariant 1: Maximum of 3 pending microactions allowed active at any time.
- Enforce business invariant 2: Commitment transition to `Archived` requires `ReflectionRegisteredEvent` or metadata.
- Hydrate and apply events: `CompromisoConcebidoEvent`, `PactoActivadoEvent`, `MicroaccionEjecutadaEvent`, `ReflectionRegisteredEvent`, `CompromisoCompletadoEvent`.

#### [NEW] [identity-events.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/identity/identity.events.ts)

- Define standard domain event payload interfaces for `Identity & Profile` context.

#### [NEW] [execution-events.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/execution/execution.events.ts)

- Define standard domain event payload interfaces for `Commitment Lifecycle & Execution` context.

#### [NEW] [commands.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/execution/commands.ts)

- Define command payloads: `ConceiveCommitmentCommand`, `ActivatePactCommand`, `ExecuteMicroActionCommand`.

#### [MODIFY] [index.ts](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/src/index.ts)

- Export the newly created aggregates, events, and commands from the `@commitment/domain` package.

## 🔒 Constraints

- **Framework Independence:** Zero dependencies on NestJS, Flutter, Drift, or any HTTP/database library.
- **Strong Typing:** Absolutely no use of the `any` keyword. All event structures and aggregate payloads must use clean interfaces.
- **Immutability:** Event payloads must be readonly data-only objects.
- **No Side Effects:** Aggregate method calls must only validate state and accumulate events; they should not invoke external APIs or perform async requests.

## 🧪 Verification Plan

### Automated Verification

- Run `npx pnpm test` in the domain package.
- Write unit tests for:
  - `User` aggregate creation and updating of core value system.
  - `Commitment` aggregate state machine transitions, validating invariants (preventing >3 active pending microactions).
- Ensure linter runs successfully: `npx pnpm run lint`.

### Manual Verification

- None required (this is a pure logic domain package, fully verified by automated unit tests).

## ✅ Success Criteria

- [ ] `@commitment/domain` builds successfully with zero TypeScript compilation errors.
- [ ] 100% unit test coverage for the new business rules on `User` and `Commitment` aggregate roots.
- [ ] No framework or database references exist in the domain package.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial TASK-001 specification draft.
