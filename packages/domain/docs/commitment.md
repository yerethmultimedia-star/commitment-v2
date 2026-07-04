# Commitment Aggregate Reference HandBook

Version: 1.0.0
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

- `CommitmentState.Draft` (default registered state)
- `CommitmentState.Active` (active state once scheduling is set)

### Allowed State Transitions

- `Draft` ──► `Active` (Via `.activate()`)
- No other transitions are allowed in this version.

---

## 🔒 3. Business Invariants (Inmutables)

- **Identity association:** A commitment cannot exist without a valid, non-null `IdentityId`.
- **Non-empty Title:** `CommitmentTitle` must be between 1 and `CommitmentConstraints.MAX_TITLE_LENGTH` (150) characters.
- **Description Limits:** `CommitmentDescription` length must not exceed `CommitmentConstraints.MAX_DESCRIPTION_LENGTH` (1000) characters.
- **Double Activation Guard:** Trying to transition to `Active` when already in `Active` throws a `CommitmentAlreadyActiveError`.

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
    occurredAt: Date,
  ): Commitment;

  public activate(occurredAt: Date): void;
}
```

---

## ✉️ 5. Domain Events (Rule #70 Compliant)

All changes are driven by raising events, which are applied internally by `applyEvent`:

1.  **`CommitmentRegisteredEvent` (`commitment.registered`):**
    - Raised on static registration factory execution.
2.  **`CommitmentActivatedEvent` (`commitment.activated`):**
    - Raised on `.activate(...)` execution.

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

### Registration & Activation Flow

```typescript
const commitmentId = new CommitmentId('018f6b5c-42e1-7000-8000-999999999999');
const identityId = new IdentityId('018f6b5c-42e1-7000-8000-111111111111');
const title = new CommitmentTitle('Learn Domain Driven Design');
const description = new CommitmentDescription('Read blue book and model aggregates');

// 1. Register a Draft Commitment
const commitment = Commitment.register(commitmentId, identityId, title, description, new Date());

// 2. Activate the Commitment
commitment.activate(new Date());
```
