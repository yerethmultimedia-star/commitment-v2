# Technical Design

## Capability

**Activate Commitment**

## Domain Objects

- **Commitment**: Aggregate root representing a user's commitment, with state (`Pending`, `Active`, `Paused`, `Completed`, `Cancelled`) and version.

## Command

- **ActivateCommitment**: Command carrying the `commitmentId` (UUID) and the initiator's identity.

## Domain Event

- **CommitmentActivated**: Event emitted when a commitment transitions from `Pending` to `Active`. Contains `commitmentId`, new `version`, and timestamp.

## Repository Interaction

1. **Load Aggregate** – Retrieve the `Commitment` aggregate by `commitmentId` from the repository.
2. **Activate** – Invoke the aggregate's `activate()` method, which:
   - Validates current state is `Pending`.
   - Changes state to `Active`.
   - Increments version.
   - Emits `CommitmentActivated`.
3. **Save Aggregate** – Persist the updated aggregate back to the repository.
4. **Return Version** – Return the new version (and state) to the caller.

## HTTP Contract

- **POST** `/commitments/{id}/activate`
- **Path Parameter**: `id` – UUID of the commitment to activate.
- **Request Body**: _(empty)_ – activation is a command without additional payload.

## Response Contract

- **200 OK**
  ```json
  {
    "commitmentId": "<uuid>",
    "version": <number>,
    "state": "Active"
  }
  ```
- **Error Responses**
  - **400 Bad Request** – Invalid request format.
  - **404 Not Found** – Commitment with the given `id` does not exist.
  - **409 Conflict** – Commitment is already `Active` (or in a state where activation is not allowed).
  - **422 Unprocessable Entity** – Business rule prevents activation (e.g., invalid state transition).

## Non‑Goals

- Notifications
- Scheduling
- Micro‑actions
- Offline synchronization
- AI assistance
- Event bus integration beyond emitting the domain event

---

_This Technical Design validates that the proposed solution aligns with the business capability before implementation begins._
