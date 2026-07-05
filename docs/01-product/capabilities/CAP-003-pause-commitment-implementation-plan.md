# Implementation Plan – Pause Commitment (VS-003)

## Goal

Deliver the **Pause Commitment** capability while preserving:

1. Correctness
2. Domain Integrity (aggregate owns lifecycle)
3. Readability
4. Product Value

## User Review Required

None – all requirements have been approved.

## Open Questions

None.

## Proposed Changes

### Domain Layer

- **[MODIFY]** `src/commitment/domain/commitment.ts`
  - Add `pause()` method that:
    - Validates lifecycle (Active → Paused only).
    - Is idempotent – no state change if already Paused.
    - Emits **exactly one** `CommitmentPaused` event **only on a real transition**.
    - Does **not** modify version on idempotent calls.
    - Increments version **once** on a real transition.
- **[NEW]** `src/commitment/domain/events/commitment-paused.event.ts`
  ```ts
  export class CommitmentPaused {
    constructor(
      public readonly commitmentId: string,
      public readonly occurredAt: Date = new Date(),
    ) {}
  }
  ```

### Application Layer

- **[NEW]** `src/commitment/application/commands/pause-commitment.command.ts`
  - Immutable command with a single `commitmentId` property.
- **[NEW]** `src/commitment/application/commands/pause-commitment.result.ts`
  ```ts
  export class PauseCommitmentResult {
    constructor(
      public readonly commitmentId: string,
      public readonly state: string,
      public readonly version: number,
    ) {}
  }
  ```
  _Result is built directly from the aggregate after `pause()` – the handler does not reconstruct state itself._
- **[NEW]** `src/commitment/application/handlers/pause-commitment.handler.ts`
  ```ts
  export class PauseCommitmentHandler {
    constructor(
      private readonly repository: CommitmentRepository,
      private readonly dispatcher: EventDispatcher,
    ) {}

    async execute(command: PauseCommitmentCommand): Promise<PauseCommitmentResult> {
      const aggregate = await this.repository.findById(command.commitmentId);
      if (!aggregate) throw new CommitmentNotFoundError(command.commitmentId);

      aggregate.pause(); // aggregate owns the business rules

      await this.repository.save(aggregate);

      const events = aggregate.getUncommittedEvents();
      if (events.length) await this.dispatcher.dispatch(events);
      aggregate.clearUncommittedEvents();

      // Return result built from the aggregate – source of truth
      return new PauseCommitmentResult(aggregate.id.value, aggregate.status, aggregate.version);
    }
  }
  ```

### Infrastructure Layer

- Re‑use existing `CommitmentRepository` contract (`save(commitment): Promise<void>`). No changes.
- Re‑use existing `EventDispatcher` contract. No changes.

### API Layer

- **[MODIFY]** `src/commitment/api/commitments.controller.ts`
  ```ts
  @Post('v1/commitments/:id/pause')
  async pause(@Param('id') id: string): Promise<PauseCommitmentResult> {
    const command = new PauseCommitmentCommand(id);
    return this.pauseCommitmentHandler.execute(command);
  }
  ```
  - Map domain errors to HTTP status codes:
    - `CommitmentNotFoundError` → **404**
    - `InvalidLifecycleTransitionError` → **400**

## Tests

### Domain Tests (single spec file)

- File: `packages/domain/src/commitment/__tests__/commitment.spec.ts`
  - Add a new `describe('pause()', () => { … })` block covering:
    1. **Active → Paused** transition creates one `CommitmentPaused` event and increments version by 1.
    2. **Idempotent pause** (already Paused) does not emit an event and does not change version.
    3. **Invalid transition** (e.g., Completed → Paused) throws `InvalidLifecycleTransitionError`.
    4. After handling, `aggregate.getUncommittedEvents()` is empty (event cleanup).

### Application Tests

- File: `src/commitment/application/__tests__/pause-commitment.handler.spec.ts`
  - Happy path (real transition) – verify repository.save called, dispatcher.dispatch called once, result reflects new state/version.
  - Idempotent path – verify dispatcher not called, version unchanged.
  - Not‑found error – verify `CommitmentNotFoundError` bubbles up.
  - Ensure no framework types leak from handler.

### API Tests

- File: `src/commitment/api/__tests__/commitments.controller.pause.spec.ts`
  - `200 OK` with correct JSON payload.
  - `404 Not Found` when commitment does not exist.
  - `400 Bad Request` for invalid transition.
  - Idempotent request returns same payload, no side‑effects.

## Documentation

- Update `CAP-003-pause-commitment.md` to reference the new event shape (no previous/new state) and the `/v1/commitments/:id/pause` route.

## Verification Plan

1. **Build** – `pnpm run build` (no TS errors).
2. **Lint** – `pnpm lint` passes.
3. **Unit & Integration Tests** – all domain, application, and API tests pass.
4. **E2E Tests** – HTTP endpoint behaves as specified.
5. **pnpm verify** – full pipeline succeeds.

## Definition of Done

VS‑003 is complete only when **all** of the following are true:

- ✅ Capability implemented (domain, application, API).
- ✅ Domain invariants preserved (status, version, event emission).
- ✅ Exactly one `CommitmentPaused` event emitted on a real transition.
- ✅ Idempotent behavior verified (no extra events, version unchanged).
- ✅ No framework leakage outside the API layer.
- ✅ No scope expansion.
- ✅ All business‑behavior tests pass (covering version increment, idempotency, invalid transition, event cleanup).
- ✅ `pnpm verify` passes.
- ✅ Architecture Review completed.
- ✅ Product Review completed.
- ✅ `PRODUCT_BACKLOG.md` updated to **✅ Complete** for Pause Commitment.
- ✅ `PRODUCT_HEALTH.md` updated (capability count).
- ✅ VS‑003 Completion Report, Architecture Review notes, and Product Review summary produced.

---

## Scope Guard

Only files directly required for the Pause Commitment slice may be modified. Any discovered ideas must be recorded as:

- Technical Debt
- Maintenance Task
- ADR Candidate
- Future Backlog Item
  They **must not** be implemented during VS‑003.

---

## Implementation Order (Domain‑first)

1. `Commitment.pause()`
2. `CommitmentPaused` event
3. Domain tests (`describe('pause()')`)
4. `PauseCommitmentCommand`
5. `PauseCommitmentResult`
6. `PauseCommitmentHandler`
7. Handler tests
8. HTTP endpoint (`POST v1/commitments/:id/pause`)
9. API tests
10. `pnpm verify`
11. Architecture Review
12. Product Review
13. Update `PRODUCT_BACKLOG.md`
14. Update `PRODUCT_HEALTH.md`
15. VS‑003 Completion Report
