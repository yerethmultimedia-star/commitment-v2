# Commitment Aggregate Reference Handbook

Version: 1.1.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 🏛️ 1. Conceptual Design

The `Commitment` aggregate root manages the lifecycle state transitions and protects invariants of a user's promise of personal transformation.

### Aggregate Boundary & Responsibilities

- **Encapsulates:** Commitment identity references, title, description, and state state-machine status.
- **Key Responsibilities:**
  - Ensures valid construction constraints (title lengths, mandatory owning Identity reference).
  - Protects state FSM invariants.
  - Emits domain events for all state changes.

---

## 🔄 2. State Machine & Transitions

The aggregate models state transitions using the `CommitmentState` enum:

- `Draft` (default registered state)
- `Active` (active state once scheduling is set)
- `Paused` (conscientious pause state)
- `Completed` (successfully finished meta-plan)
- `Cancelled` (consciously cancelled meta-plan)

### FSM State Transition Matrix

The table below defines the full transition matrix of this Bounded Context:

| From State  | Behavior (Command) | Target State | Allowed | Invariants / Guard Conditions              |
| :---------- | :----------------- | :----------- | :------ | :----------------------------------------- |
| `Draft`     | `activate`         | `Active`     | ✅      | Title must be valid.                       |
| `Draft`     | `cancel`           | `Cancelled`  | ✅      | None.                                      |
| `Draft`     | `pause`            | -            | ❌      | Throws `CommitmentCannotBePausedError`.    |
| `Draft`     | `complete`         | -            | ❌      | Throws `CommitmentCannotBeCompletedError`. |
| `Active`    | `pause`            | `Paused`     | ✅      | None.                                      |
| `Active`    | `complete`         | `Completed`  | ✅      | None.                                      |
| `Active`    | `cancel`           | `Cancelled`  | ✅      | None.                                      |
| `Paused`    | `resume`           | `Active`     | ✅      | None.                                      |
| `Paused`    | `cancel`           | `Cancelled`  | ✅      | None.                                      |
| `Paused`    | `complete`         | -            | ❌      | Throws `CommitmentCannotBeCompletedError`. |
| `Completed` | _Any Behavior_     | -            | ❌      | Throws `CommitmentAlreadyCompletedError`.  |
| `Cancelled` | _Any Behavior_     | -            | ❌      | Throws `CommitmentAlreadyCancelledError`.  |

---

## 🔒 3. Business Invariants (Inmutables)

- **Identity association:** A commitment cannot exist without a valid, non-null `IdentityId`.
- **Non-empty Title:** `CommitmentTitle` must be between 1 and `CommitmentConstraints.MAX_TITLE_LENGTH` (150) characters.
- **Description Limits:** `CommitmentDescription` length must not exceed `CommitmentConstraints.MAX_DESCRIPTION_LENGTH` (1000) characters.
- **Double Activation Guard:** Trying to transition to `Active` when already in `Active` throws a `CommitmentAlreadyActiveError`.
- **Completed / Cancelled Immutability:** Any aggregate modifications or state transitions are forbidden on Completed/Cancelled states, throwing `CommitmentAlreadyCompletedError` or `CommitmentAlreadyCancelledError`.
- **Rule #77 — No Meaningless Events:** No events are generated or recorded if renaming or updating description to the exact same value.

---

## 🔌 4. Public API Reference

```typescript
export class Commitment extends AggregateRoot<CommitmentId> {
  // Getters (Read-only properties)
  public get identityId(): IdentityId;
  public get title(): CommitmentTitle;
  public get description(): CommitmentDescription | null;
  public get state(): CommitmentState;

  // Behavior Actions
  public static register(
    id: CommitmentId,
    identityId: IdentityId,
    title: CommitmentTitle,
    description: CommitmentDescription | null,
  ): Commitment;

  public activate(): void;
  public pause(): void;
  public resume(): void;
  public complete(): void;
  public cancel(): void;
  public rename(newTitle: CommitmentTitle): void;
  public updateDescription(newDescription: CommitmentDescription | null): void;
}
```

---

## ✉️ 5. Domain Events (Rule #70 & #76 Compliant)

All state changes are driven by raising exactly one primary event, applied internally by `applyEvent`:

1.  **`CommitmentRegisteredEvent` (`commitment.registered`):** Raised on registration.
2.  **`CommitmentActivatedEvent` (`commitment.activated`):** Raised on `.activate()`.
3.  **`CommitmentPausedEvent` (`commitment.paused`):** Raised on `.pause()`.
4.  **`CommitmentResumedEvent` (`commitment.resumed`):** Raised on `.resume()`.
5.  **`CommitmentCancelledEvent` (`commitment.cancelled`):** Raised on `.cancel()`.
6.  **`CommitmentCompletedEvent` (`commitment.completed`):** Raised on `.complete()`.
7.  **`CommitmentRenamedEvent` (`commitment.renamed`):** Raised on `.rename()`.
8.  **`CommitmentDescriptionUpdatedEvent` (`commitment.description_updated`):** Raised on `.updateDescription()`.

---

## 📦 6. Repository Contract

```typescript
export interface CommitmentRepository extends Repository<Commitment> {
  save(commitment: Commitment): Promise<void>;
  findById(id: CommitmentId): Promise<Commitment | null>;
}
```

---

## 💡 7. Usage Examples

### Registration, Activation, and Pausing

```typescript
const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
const identityId = new IdentityId('018f6b5c-42e1-7000-8000-111111111111');
const title = new CommitmentTitle('Learn Domain Driven Design');
const description = new CommitmentDescription('Read blue book and model aggregates');

// 1. Register a Draft Commitment
const commitment = Commitment.register(commitmentId, identityId, title, description);

// 2. Activate
commitment.activate();

// 3. Pause
commitment.pause();

// 4. Resume
commitment.resume();

// 5. Complete
commitment.complete();
```
