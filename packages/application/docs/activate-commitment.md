# Activate Commitment — Vertical Slice Handbook

## Overview

The **Activate Commitment** capability transitions a registered commitment from `Draft`
to `Active`. This is the second complete vertical slice, establishing the standard
pattern for all future lifecycle behaviors.

---

## HTTP Contract

### Request

```http
POST /v1/commitments/{commitmentId}/activate
Content-Type: application/json

{}
```

The commitment is identified entirely by the path parameter. No request body is required.

### Success Response — `200 OK`

```json
{
  "commitmentId": "018f6b5c-42e1-7000-8000-999999999999",
  "state": "Active",
  "version": 2
}
```

The `state` field was introduced in this slice to enable future client sync.
The `version` equals the total count of domain events recorded on the aggregate
(register = 1, activate = +1, so version = 2 after activation).

### Error Responses

| Status                     | Condition                                                  |
| -------------------------- | ---------------------------------------------------------- |
| `400 Bad Request`          | Invalid UUID format in path parameter                      |
| `404 Not Found`            | Commitment ID does not exist in the repository             |
| `409 Conflict`             | Commitment is in a terminal state (Completed or Cancelled) |
| `422 Unprocessable Entity` | Invalid state machine transition (e.g. Paused → activate)  |

> **Note:** This is the first slice to introduce semantic HTTP error codes.
> All future lifecycle slices (`pause`, `resume`, `complete`, `cancel`) follow this table.

---

## Slice Anatomy

```
POST /v1/commitments/:id/activate
  └─ CommitmentsController.activate()       # Zod UUID validation on path param
       └─ ActivateCommitmentCommand          # POJO — carries only commitmentId
            └─ ActivateCommitmentNestjsHandler  # NestJS @CommandHandler adapter
                 └─ ActivateCommitmentCommandHandlerCore  # Framework-agnostic
                      ├─ repository.findById()    # → 404 (CommitmentNotFoundError)
                      ├─ if state === Active      # → 200 idempotent (Rule #87)
                      ├─ commitment.activate()    # domain decision (Rule #86)
                      │   CommitmentAlreadyCompletedError  → 409
                      │   CommitmentAlreadyCancelledError  → 409
                      │   InvalidCommitmentStateTransitionError → 422
                      ├─ repository.save()        # → returns version number
                      └─ dispatcher.dispatch()    # NoOp (stub)
```

---

## Files Created / Modified

### Application Layer — New

| File                                                        | Purpose                                            |
| ----------------------------------------------------------- | -------------------------------------------------- |
| `application/commands/activate-commitment.command.ts`       | Immutable POJO command (Rule #86)                  |
| `application/commands/activate-commitment.result.ts`        | Result DTO with `commitmentId`, `state`, `version` |
| `application/commands/activate-commitment.handler.ts`       | Core handler with idempotency and error mapping    |
| `application/ports/versioned-commitment-repository.port.ts` | Repository port where `save()` returns version     |

### Application Layer — Modified

| File                                                  | Change                                                           |
| ----------------------------------------------------- | ---------------------------------------------------------------- |
| `application/commands/register-commitment.handler.ts` | Now uses `VersionedCommitmentRepository`; returns actual version |

### Infrastructure — Modified

| File                                                | Change                                                |
| --------------------------------------------------- | ----------------------------------------------------- |
| `infrastructure/in-memory-commitment.repository.ts` | `save()` now tracks and returns version per aggregate |

### NestJS Adapter — New

| File                                           | Purpose                                              |
| ---------------------------------------------- | ---------------------------------------------------- |
| `nestjs/activate-commitment.nestjs-handler.ts` | `@CommandHandler` wrapper delegating to core handler |

### API — Modified

| File                            | Change                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| `api/commitments.controller.ts` | Added `POST :id/activate` endpoint with semantic error mapping |

### Module — Modified

| File                   | Change                                       |
| ---------------------- | -------------------------------------------- |
| `commitment.module.ts` | Registered `ActivateCommitmentNestjsHandler` |

---

## Versioning — Rule #87

The `InMemoryCommitmentRepository` tracks a version counter per aggregate ID:

- **`save()` with uncommitted events** → version += number of new events
- **`save()` with no uncommitted events** → version unchanged (idempotent save)

This ensures that:

- `register` → version 1
- `activate` → version 2
- Duplicate `activate` → version stays at 2

---

## Idempotency — Rules #77 + #87

If `POST /v1/commitments/:id/activate` is received for a commitment already in `Active` state:

1. The handler detects `commitment.state === Active` before calling `activate()`.
2. Returns `200 OK` with the **current** `{ commitmentId, state, version }`.
3. No domain event is emitted.
4. No new save occurs.
5. Version does **not** increment.

This is safe to retry any number of times.

---

## Error Architecture

Application-layer exception classes (defined in `activate-commitment.handler.ts`):

| Class                            | Maps to HTTP                       |
| -------------------------------- | ---------------------------------- |
| `CommitmentNotFoundError`        | `404 NotFoundException`            |
| `CommitmentStateConflictError`   | `409 ConflictException`            |
| `CommitmentStateTransitionError` | `422 UnprocessableEntityException` |

These are framework-agnostic errors thrown by the core handler and translated to
NestJS HTTP exceptions inside the controller. The domain never references HTTP.

---

## Test Coverage

### Unit Tests

| Suite                                        | Tests                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `activate-commitment.handler.spec.ts`        | happy path, idempotency ×3, 404, 409 (cancelled), 409 (completed), 422 (paused) |
| `activate-commitment.nestjs-handler.spec.ts` | adapter delegation + version check                                              |
| `commitments.controller.spec.ts`             | happy path, invalid UUID, 404, 409, 422                                         |
| `in-memory-commitment.repository.spec.ts`    | save returns version, version increment, idempotent save                        |

### E2E Tests

| Scenario                                                | Status |
| ------------------------------------------------------- | ------ |
| Register → Activate → `{ state: 'Active', version: 2 }` | ✅     |
| Activate × 3 — version stable (Rule #87)                | ✅     |
| Unknown ID → `404`                                      | ✅     |
| Invalid UUID in path → `400`                            | ✅     |

---

## Next Steps

- **VS-003** — `POST /v1/commitments/:id/pause`
- **VS-004** — `POST /v1/commitments/:id/resume`
- **VS-005** — `POST /v1/commitments/:id/complete`
- **VS-006** — `POST /v1/commitments/:id/cancel`
