# Commitment Event Storming Specification

Version: 1.1.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

This document represents the Domain Event Storming model for the **Commitment Bounded Context** timeline in English using Mermaid diagrams and workflow sequences.

---

## 🗺️ 1. Timeline & Aggregate Lifecycle Workflow

The sequence below tracks the lifecycle events, system evaluations, and user interactions from conception to archival.

```mermaid
sequenceDiagram
    actor User as Identity (User)
    participant C as Commitment Aggregate
    participant S as System Evaluator
    participant W as Wisdom Bounded Context

    %% Phase 1: Conception
    User->>C: Command: RegisterCommitment
    Note over C: Invariants Check:<br/>IdentityId must be valid
    C-->>User: Event: CommitmentRegistered (State: Draft)

    %% Phase 2: Activation
    User->>C: Command: ActivateCommitment
    Note over C: Invariants Check:<br/>Initial Microaction Scheduled
    C-->>User: Event: CommitmentActivated (State: Active)

    %% Phase 3: Friction Detection
    Note over S: Inactivity > 48 Hours
    S->>C: Command: RecordFriction
    C-->>User: Event: FrictionDetected (State: InFriction)

    %% Phase 4: Resilience Recovery
    alt Option A: Accept Rescue
        User->>C: Command: AcceptRescue
        C-->>User: Event: VictoryOfReturnRecorded (State: Recovering)
        User->>C: Command: RecordMicroaction (3 consecutive days)
        C-->>User: Event: ConsistencyRecovered (State: Active)
    else Option B: Adapt Plan
        User->>C: Command: AdaptCommitment
        C-->>User: Event: VelocityAdapted (State: InAdaptation)
        User->>C: Command: ApproveAdaptedPlan
        C-->>User: Event: AdaptedPlanApproved (State: Active)
    end

    %% Phase 5: Pausing
    User->>C: Command: PauseCommitment
    C-->>User: Event: ConsciousPauseDeclared (State: Paused)
    User->>C: Command: ResumeCommitment
    C-->>User: Event: CommitmentResumed (State: Active)

    %% Phase 6: Completion
    User->>C: Command: CompleteCommitment
    C-->>User: Event: CommitmentCompleted (State: Completed)

    %% Phase 7: Archiving
    User->>C: Command: RecordReflection
    C-->>User: Event: LearningCapsuleImmortalized (State: Archived)
    C->>W: Integration Event: LearningCapsuleImmortalized (Hydrates Life Library)
```

---

## 🗃️ 2. Read Models & Analytics Projections

Event streams project changes to the following UI read models:

1. **`CommitmentDashboardView` (Dashboard Projections):**
   - _Feeds on:_ `CommitmentRegistered`, `CommitmentActivated`, `CommitmentCompleted`, `CommitmentCancelledConscious`.
   - _Presents:_ List of active, draft, and completed commitments for the home page dashboard.
2. **`TodayView` (Today's Action List):**
   - _Feeds on:_ `CommitmentActivated`, `ConsistencyRecovered`, `ConsciousPauseDeclared`.
   - _Presents:_ Action list requiring immediate execution.
3. **`LifeLibraryView` (Wisdom Learning Repository):**
   - _Feeds on:_ `LearningCapsuleImmortalized`.
   - _Presents:_ Permanent archive of user reflections and learnings.

---

## 🛡️ 3. Policies & Automated Rules

- **Inactivity Policy:**
  - _Trigger:_ Inactivity timer detects that 48 hours have elapsed without any registered micro-actions.
  - _Effect:_ Emits a system command `RecordFriction` to transition state to `InFriction`.
- **Rescued Consistency Policy:**
  - _Trigger:_ Three consecutive days of successful actions are recorded on a recovering aggregate.
  - _Effect:_ Emits `ConsistencyRecovered` to return state from `Recovering` to `Active`.

---

## 📜 Change History

- **v1.1.0 (2026-07-04):** English translation of states, events, and commands.
- **v1.0.0 (2026-07-04):** Initial Event Storming model specification.
