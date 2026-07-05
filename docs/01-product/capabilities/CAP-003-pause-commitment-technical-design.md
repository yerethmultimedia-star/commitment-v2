# Technical Design – Pause Commitment (CAP‑003)

## Capability

Pause Commitment

## Command

```text
PauseCommitment
```

_Input:_ `commitmentId`
_Output:_ Success/Failure result.

## Aggregate Behavior

```text
Load Commitment aggregate by ID
→ commitment.pause()
```

`pause()` rules:

- Transition `Active → Paused`.
- Idempotent – if already paused, no state change.
- Emits **exactly one** `CommitmentPaused` event when a real transition occurs.
- Preserves all existing uncommitted events and version.

## Repository Flow

```text
save(aggregate)
→ persist new state & version
```

The repository stores the aggregate state and its pending domain events.

## Events

- `CommitmentPaused` – emitted only on a genuine state transition.

## HTTP Contract

**Endpoint:** `POST /api/commitments/{id}/pause`
**Request Body:** `{}` (no payload required)
**Response:** `200 OK` with `{ "status": "paused" }`

## Response Contract

- On success: `{ "status": "paused" }`
- If already paused (idempotent): same response.
- If commitment not found: `404 Not Found`.
- If commitment not in `Active` state (e.g., Completed): `400 Bad Request` with error message.

## Error Cases

| Scenario                                | HTTP Status | Message                                            |
| --------------------------------------- | ----------- | -------------------------------------------------- |
| Commitment does not exist               | 404         | "Commitment not found"                             |
| Commitment not Active (e.g., Completed) | 400         | "Commitment cannot be paused in its current state" |
| Unexpected server error                 | 500         | "Internal server error"                            |

## Non Goals

- Automatic or scheduled resume.
- Notification/reminder logic.
- Conflict resolution across devices (offline‑first).
- Analytics dashboards.
- AI‑driven recommendations.

---

_This design follows the established vertical‑slice pattern used in VS‑002, keeping the flow concise and focused on the domain behavior._
