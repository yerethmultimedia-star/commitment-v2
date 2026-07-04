# Commitment Domain Model Specification

Version: 1.1.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 📖 1. Conceptual Framework: What is a Commitment?

A **Commitment** is a solemn promise of personal transformation bound to the user's core identity and values. It is the living root entity of the execution domain.

### ❓ Core Business Questions

- **Why does it exist?**
  To channel human energy towards long-term values, systematically reducing friction, adapting dynamically to life burnout, and preventing identity-deficit failures.
- **Who owns it?**
  Exactly one **Identity** (identified by an `IdentityId`).
- **How is it created?**
  Registered in a `Draft` state via `RegisterCommitment` command, generating `CommitmentRegistered` event.
- **How is it completed?**
  When all goals and milestones of the active plan are successfully met, transitioning to `Completed` and eventually `Archived` after recording a learning reflection.
- **How is it cancelled?**
  Consciously desisted by the user using `CancelCommitment`, moving directly to `Archived` (recording a meta-cognition capsule).
- **Can it expire?**
  No. Commitments are value-aligned promises; they do not simply time out, though inactive periods trigger friction transitions.
- **Can it pause and resume?**
  Yes, using the `PauseCommitment` command to suspend notifications and daily actions without penalty, and `ResumeCommitment` to resume active status.
- **Can it fail?**
  No, the system is designed around recovery. When consecutive failures occur, it enters the `InFriction` and `InAdaptacion` (or adapted plan) states to scale down actions rather than declaring a hard failure.
- **Can it evolve, split, or merge?**
  It evolves via plan adjustments (`ApproveAdaptedPlan`). Splitting or merging commitments is excluded from this aggregate.
- **How is it archived?**
  Following completion or conscious cancellation, the user immortalizes their learning in a meta-cognitive learning capsule, locking the commitment from further updates.

### 🧠 Core Concepts Definition

- **Friction:** See the formal definition in [CONCEPTS.md](file:///Users/yereth/Desktop/Commitment-v2/docs/02-domain/CONCEPTS.md#2-friction-fricción). Friction is modeled as a primary domain phenomenon. In future iterations, **Friction** may branch off into its own Bounded Context (_Resilience & Inactivity Context_).
- **Identity Anchor:** (Deferred) While initially modeled as a value object, its inclusion as a hard invariant of the aggregate has been deferred to prevent early dependency coupling.

---

## 🔄 2. State Machine (Commitment FSM)

The Commitment FSM governs state transitions within the Aggregate:

```
                  [ Draft ]
                      │
                      │ (RegisterCommitment / CommitmentActivated)
                      ▼
                  [ Active ] ◄─────────────────────────┐
                   │  │  ▲                             │
 (RecordFriction)  │  │ (ResumeCommitment)             │
                   ▼  │  │                             │
           [ InFriction ] │                             │ (RecordMicroaction
             │     │     │                             │  after 3 days of consistency)
             │     │   [ Paused ]                      │
(Adapt)      │     │     ▲                             │
             │     │     │ (PauseCommitment)           │
             ▼     ▼     │                             │
    [ InAdaptation ] ──► [ Recovering ] ───────────────┘
             │                 │
             └────────┬────────┘
                      │ (CompleteCommitment)
                      ▼
                [ Completed ]
                      │ (RecordReflection)
                      ▼
                 [ Archived ]
```

### Transition Specifications

| Current State  | Command (Input)      | Preconditions                           | Emitted Event                  | Next State         |
| :------------- | :------------------- | :-------------------------------------- | :----------------------------- | :----------------- |
| `Draft`        | `RegisterCommitment` | Anchor input (optional/deferred check). | `CommitmentRegistered`         | `Draft` (Hydrated) |
| `Draft`        | `ActivateCommitment` | Initial action scheduled.               | `CommitmentActivated`          | `Active`           |
| `Active`       | `RecordFriction`     | System-triggered: >48h inactivity.      | `FrictionDetected`             | `InFriction`       |
| `Active`       | `PauseCommitment`    | User declares pause context.            | `ConsciousPauseDeclared`       | `Paused`           |
| `InFriction`   | `AdaptCommitment`    | Proposed adjustment plan is generated.  | `VelocityAdapted`              | `InAdaptation`     |
| `InFriction`   | `AcceptRescue`       | User completes atomic (60s) action.     | `VictoryOfReturnRecorded`      | `Recovering`       |
| `InAdaptation` | `ApproveAdaptedPlan` | Plan respects Interaction Budget.       | `AdaptedPlanApproved`          | `Active`           |
| `Paused`       | `ResumeCommitment`   | Pause duration ended or user resumes.   | `CommitmentResumed`            | `Active`           |
| `Recovering`   | `RecordMicroaction`  | 3 consecutive days of actions met.      | `ConsistencyRecovered`         | `Active`           |
| `Active`       | `CompleteCommitment` | All goals & milestones achieved.        | `CommitmentCompleted`          | `Completed`        |
| `Completed`    | `RecordReflection`   | Reflection questions completed.         | `LearningCapsuleImmortalized`  | `Archived`         |
| `Active`       | `CancelCommitment`   | Conscious decision to desist.           | `CommitmentCancelledConscious` | `Archived`         |

---

## 📥 3. Commands

Commands are classified into three strict operational types:

### A. Human Commands

- **`RegisterCommitment`:** Initializes the commitment details.
- **`ActivateCommitment`:** Transitions the commitment into active status.
- **`PauseCommitment`:** Pauses execution due to vacation or context shifts.
- **`ResumeCommitment`:** Restores active status.
- **`RecordMicroaction`:** Completes a daily action.
- **`RecordReflection`:** Submits meta-cognitive learning reflection.
- **`CancelCommitment`:** Desists from the commitment.

### B. System Commands

- **`RecordFriction`:** Automatically triggered by the system evaluator after 48 hours of inactivity.

### C. AI Proposals

- _Rule:_ **The AI never executes commands directly.** It generates proposals. If accepted by the user, it triggers `ApproveAdaptedPlan`.

---

## ✉️ 4. Domain Events (Rule #70 Compliant)

Domain events contain only business facts. Payload fields do not duplicate occurrence timestamps (`occurredAt` / `recordedAt` reside in the envelope).

- **`CommitmentRegistered`:** Emitted when draft is defined. Payload: `commitmentId`, `identityId`.
- **`CommitmentActivated`:** Emitted when aggregate transitions to `Active`. Payload: `commitmentId`, `initialMicroactionId`.
- **`FrictionDetected`:** Emitted when inactivity threshold is hit. Payload: `commitmentId`, `inactivityHours`.
- **`AdaptedPlanApproved`:** Emitted on plan recalculation. Payload: `commitmentId`, `newScheduleBudget`.
- **`VictoryOfReturnRecorded`:** Emitted when rescue action is executed. Payload: `commitmentId`, `rescueActionId`.
- **`CommitmentCompleted`:** Emitted when goals are met. Payload: `commitmentId`.
- **`LearningCapsuleImmortalized`:** Emitted upon final reflection registration. Payload: `commitmentId`, `capsuleSummary`.

---

## 🔒 5. Business Invariants (Inmutables)

1. **Identity Association:** A Commitment must always belong to exactly one valid `IdentityId`.
2. **Post-Completion Read-only:** An Archived/Completed Commitment cannot receive daily updates, executions, or pause activations.
3. **Pausa Bounds:** A conscious pause cannot exceed a maximum budget of 30 cumulative days per calendar year.

---

## 🧩 6. Candidate Value Objects & Entities

### Candidate Value Objects

- **`CommitmentTitle`:** Main heading representation (trimmed, length restricted).
- **`BCP47Locale`:** Locale helper (reused from Shared Kernel).

### Candidate Boundaries (Deferred Aggregate Choice)

- **`Goal`** & **`Microaction`:** These are cataloged as candidate models. We do **not** assume they are internal entities of `Commitment`. If transactional consistency boundaries permit, they may be implemented as independent Aggregates in subsequent phases.

---

## 🚧 7. Aggregate Boundary

- **Inside the Aggregate Boundary:** `Commitment` (Root).
- **Outside the Aggregate Boundary:** `Routine`, `Habit`, `Gamification`, `NotificationEngine` (Infrastructure), `Coach`.

---

## 📜 Change History

- **v1.1.0 (2026-07-04):** English translation, deferred IdentityAnchor, set Goal/MicroAction boundaries, and integrated Friction definition.
- **v1.0.0 (2026-07-04):** Initial Domain Modeling specification for Commitment Bounded Context.
