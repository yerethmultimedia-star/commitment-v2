# Ubiquitous Language Glossary (Lenguaje Ubicuo)

Version: 1.2.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-24

---

This document represents the official and single source of truth for terms and definitions used across Bounded Contexts.

**Governance note (AR-005, D-005.1):** every term below is backed by a verifiable class in code (an `AggregateRoot`, a real `enum`, a concept confirmed absent from all of `packages/domain`/`apps/backend`/`apps/mobile`) — not by editorial judgment. See `docs/ARCHITECTURE_REMEDIATION/AR-005/ANALISIS.md` for the evidence behind each correction.

---

## 🔑 Core Domain Terms

### 1. Identity (Identidad)

- **Definition:** The business representation of the user, capturing identity details (emails, preferred language, preferred timezone). Completely decoupled from authentication or authorizations.
- **Aggregates:** `Identity` (Aggregate Root).
- **Identifier:** `IdentityId`.
- **Prohibited Synonyms:** User, Account, UserProfile.

### 2. Commitment (Compromiso)

- **Definition:** A solemn promise of personal transformation bound to the user's core identity and values. It is the root entity of the Commitment Lifecycle context.
- **Aggregates:** `Commitment` (Aggregate Root).
- **Identifier:** `CommitmentId`.
- **States:** see "Commitment States" below.
- **Prohibited Synonyms:** Task, Todo, Project, Habit Tracker, Goal (when used as synonym).

### 3. Task (Tarea)

- **Definition:** A concrete, actionable unit of execution, optionally linked to a `Commitment` and/or a `Goal`, carrying its own priority, estimated/actual duration, and lifecycle status (including block/unblock, manual or dependency-driven).
- **Aggregates:** `Task` (Aggregate Root).
- **Identifier:** `TaskId`.
- **Prohibited Synonyms:** Microaction, Subtask, To-Do item (as a separate concept — `Task` is the shipped replacement for both).

### 4. Habit (Hábito)

- **Definition:** A recurring action tied to a recurrence pattern (e.g. daily, weekly, biweekly), optionally linked to a `Goal`, tracked via completion streaks and postponement.
- **Aggregates:** `Habit` (Aggregate Root).
- **Identifier:** `HabitId`.
- **States:** `Active`, `Disabled`, `Archived` (`HabitState`).
- **Prohibited Synonyms:** Task, Recurring To-Do.

### 5. Goal (Objetivo)

- **Definition:** A tactical, measurable checkpoint that breaks down a commitment into achievable execution phases. `Task` and `Habit` may link to a `Goal` directly — Planning & Execution (Goal/Commitment/Task/Habit) is one bounded context/shared kernel, not a strict layered hierarchy (ADR-025).
- **Aggregates:** `Goal` (Aggregate Root — confirmed shipped, no longer a candidate).
- **Identifier:** `GoalId`.
- **Prohibited Synonyms:** Task, Milestone.

### 6. Credential (Credencial)

- **Definition:** Authentication bounded context's record of a valid secret tied to an identity — deliberately independent of the `Identity` aggregate; carries no profile data (AR-043, D-043.1).
- **Aggregates:** `Credential` (Aggregate Root).
- **Identifier:** `string` (no dedicated Value Object).
- **Prohibited Synonyms:** Identity, User, Account.

### 7. Session (Sesión)

- **Definition:** A persisted, authoritative record of an active login, one per device — never fused with `Credential` (a `Credential` can have N concurrent Sessions; fusing would make unrelated logins from different devices contend on the same aggregate's optimistic-concurrency version). The token is never the source of truth; the `Session` aggregate is (AR-043, D-043.1).
- **Aggregates:** `Session` (Aggregate Root).
- **Identifier:** `string` (no dedicated Value Object).
- **Prohibited Synonyms:** Token, Credential.

### 8. Reminder (Recordatorio)

- **Definition:** A scheduled notification delivery record for a source entity (e.g. a `Task` or `Habit`), tracking its own lifecycle (scheduled, queued, processing, suspended, cancelled, completed, failed) independently of the source's own lifecycle.
- **Aggregates:** `Reminder` (Aggregate Root).
- **Identifier:** `string` (no dedicated Value Object).
- **Prohibited Synonyms:** Notification (as a synonym for the aggregate itself), Rescue.

### 9. Device (Dispositivo)

- **Definition:** A registered client device (platform, push token, app version) tied to an identity, used to route push notifications.
- **Aggregates:** `Device` (Aggregate Root).
- **Identifier:** `string` (no dedicated Value Object).
- **Prohibited Synonyms:** Session.

### 10. Appearance (Apariencia)

- **Definition:** A user's visual/theme settings (per-user, not per-device).
- **Aggregates:** `Appearance` (Aggregate Root).
- **Identifier:** `string` (`userId`, no dedicated Value Object — out of scope to introduce one, see AR-023/D-023.1).

### 11. BCP-47 Locale

- **Definition:** BCP-47 standard for language and country tags (e.g. `en-US`, `es-CR`, `pt-BR`) used for regional localization.

---

## 🗄️ Superseded Terms (kept for historical traceability, not part of the vigent model)

The following terms have zero representation anywhere in `packages/domain`, `apps/backend`, or `apps/mobile` today — verified by exhaustive grep, not by absence of memory. They are marked here rather than silently deleted, so past references to this document's earlier versions remain traceable.

- **Microaction (Microacción)** — superseded by `Task`. Previously documented as "the daily, atomic unit of execution (duration < 30 minutes)"; the shipped domain replaced this concept entirely with the richer `Task` aggregate.
- **Identity Anchor (Ancla de Identidad)** — no code representation (no `IdentityAnchor` Value Object exists). Previously documented as "the deep-seated motivation... associated with a specific commitment."
- **Rescue (Rescate Resiliente)** — no code representation. Depended on a "friction" state (see Commitment States below) that was never implemented.
- **Recovery (Recuperación)** — no code representation, for the same reason as Rescue.
- **Victory of Return (Victoria de Regreso)** — no code representation, for the same reason as Rescue.
- **Active Plan (Plan Activo)** — no code representation anywhere.

---

## 🔄 Commitment States (Finite State Machine)

Verified directly against `CommitmentState` (`packages/domain/src/commitment/aggregate/commitment.ts`):

- **Draft:** Initial status before activation.
- **Active:** Standard execution state where daily actions are scheduled.
- **Paused:** Conscientious pause declared by the user, without penalty.
- **Completed:** Reached when all goals and milestones are completed.
- **Cancelled:** Terminal state (previously undocumented).

**Removed from this section, not real today:** `InFriction`, `Recovering`, `Archived` — none exist in `CommitmentState`; no "48 hours of inactivity" trigger, no friction-recovery transition, and no archival state are implemented for `Commitment`.

---

## 📜 Change History

- **v1.2.0 (2026-07-24):** AR-005 — restored full correspondence with the vigent domain model, not only the terms an earlier audit had cited. Added `Task`, `Habit`, `Credential`, `Session`, `Reminder`, `Device`, `Appearance` (7 real aggregates that were entirely undocumented). Promoted `Goal` from "Aggregate Candidate" to confirmed Aggregate Root. Corrected the `Commitment` FSM to match `CommitmentState` (removed `InFriction`/`Recovering`/`Archived`, added `Cancelled`). Moved `Microaction`, `Identity Anchor`, `Rescue`, `Recovery`, `Victory of Return` to a new "Superseded Terms" section — none has any code representation today.
- **v1.1.0 (2026-07-04):** Integrated FSM state definitions and English domain terms.
- **v1.0.0 (2026-07-04):** Initial Ubiquitous Language glossary definition.
