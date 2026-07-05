# Capability

Pause Commitment

## User Problem

Life is unpredictable.

Illness, travel, work pressure, or family emergencies may temporarily prevent a user from honoring a commitment.

Without a deliberate pause mechanism, users often interpret these interruptions as failure, abandon the commitment, and lose motivation.

The product must allow users to intentionally pause an active commitment while preserving progress, maintaining the integrity of the commitment lifecycle, and encouraging future resumption instead of abandonment.

## Business Outcome

- Increase user retention across the commitment lifecycle.
- Reduce abandonment rate of active commitments by providing a safe, non‑penalizing pause path.
- Strengthen the perceived reliability of Commitment as a long‑term habit‑forming tool.

## Success Criteria

- Active commitments can transition to **Paused**.
- The operation is **idempotent** – repeated pauses on the same commitment have no side‑effects.
- No progress (events, version, metadata) is lost during the transition.
- The commitment can later transition to **Resume**.
- Domain invariants remain valid after the pause.

## Acceptance Criteria

- ✅ A user can pause an **Active** commitment via a single UI action.
- ✅ Exactly **one** `CommitmentPaused` event is emitted when the transition actually occurs.
- ✅ The pause operation returns a successful result even if the commitment is already paused (idempotent behavior).
- ✅ All existing progress is preserved without alteration.
- ✅ Unit and integration tests cover the happy path, the idempotent case, and error handling for non‑existent commitments.

## Out of Scope

- Automatic or scheduled resume of a paused commitment.
- Notification or reminder logic tied to a pause.
- AI‑driven recommendations for when to pause or resume.
- Scheduling adaptations or calendar integration.
- Analytics dashboards specific to pause usage.
- **Conflict resolution across multiple devices** (to be addressed when Offline First is implemented).

## Domain Impact

**Lifecycle transition affected:** `Active → Paused`.

No other lifecycle transitions are modified by this capability.
