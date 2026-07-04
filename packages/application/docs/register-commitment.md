# Register Commitment — Vertical Slice Handbook

## Overview

This document describes the architecture of the **Register Commitment** vertical slice — the first complete end-to-end feature of the Commitment bounded context.

This slice validates that the entire stack, from HTTP endpoint to in-memory persistence, works together correctly before introducing a real database.

---

## Slice Anatomy

```
POST /v1/commitments
  └─ CommitmentsController          # NestJS HTTP adapter
       └─ Zod schema validation
       └─ RegisterCommitmentCommand
            └─ RegisterCommitmentNestjsHandler   # NestJS CQRS adapter
                 └─ RegisterCommitmentCommandHandlerCore  # Framework-agnostic
                      ├─ CommitmentRepository.findById()  # Idempotency check
                      ├─ Commitment.register()            # Aggregate factory
                      ├─ CommitmentRepository.save()      # Persistence
                      └─ DomainEventDispatcher.dispatch() # Event publishing
```

---

## Files

### API Layer

| File                                                 | Responsibility                               |
| ---------------------------------------------------- | -------------------------------------------- |
| `src/commitment/api/commitments.controller.ts`       | HTTP endpoint, Zod validation, error mapping |
| `src/commitment/api/dtos/register-commitment.dto.ts` | Swagger request body DTO                     |

### Application Layer

| File                                                                 | Responsibility                           |
| -------------------------------------------------------------------- | ---------------------------------------- |
| `src/commitment/application/commands/register-commitment.command.ts` | POJO command carrying input data         |
| `src/commitment/application/commands/register-commitment.handler.ts` | Core framework-agnostic handler          |
| `src/commitment/application/commands/register-commitment.result.ts`  | Return type: `{ commitmentId, version }` |
| `src/commitment/application/ports/domain-event-dispatcher.port.ts`   | Port interface for event publishing      |

### NestJS Adapter

| File                                                          | Responsibility                                     |
| ------------------------------------------------------------- | -------------------------------------------------- |
| `src/commitment/nestjs/register-commitment.nestjs-handler.ts` | Wires NestJS `@CommandHandler` to the core handler |

### Infrastructure

| File                                                               | Responsibility                                 |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| `src/commitment/infrastructure/in-memory-commitment.repository.ts` | In-memory `Map`-backed repository (for VS-001) |
| `src/commitment/infrastructure/noop-event-dispatcher.ts`           | No-Op event dispatcher stub                    |

### Module

| File                                  | Responsibility                                          |
| ------------------------------------- | ------------------------------------------------------- |
| `src/commitment/commitment.module.ts` | Registers all providers, controllers, and CQRS handlers |

---

## Command Flow

### Input

```http
POST /v1/commitments
Content-Type: application/json

{
  "id": "018f6b5c-42e1-7000-8000-999999999999",
  "identityId": "018f6b5c-42e1-7000-8000-111111111111",
  "title": "Practice Clean Architecture",
  "description": "Optional description"
}
```

**Rule #82 — Client Owns Aggregate Identity**: The client supplies the `id` (a UUID). The server validates it but never replaces it.

### Output

```json
{
  "commitmentId": "018f6b5c-42e1-7000-8000-999999999999",
  "version": 1
}
```

---

## Idempotency

If a `POST /v1/commitments` is received with an `id` that already exists in the repository:

- The handler returns `200 OK` with the **original** `{ commitmentId, version }` payload.
- No new aggregate is created.
- No domain events are dispatched.
- The title or description in the duplicate request are **ignored**.

This ensures safe retry semantics for mobile clients operating under intermittent connectivity.

---

## Validation

The controller uses a **Zod schema** to validate the request before passing it to the command handler:

```typescript
const registerSchema = z.object({
  id: z.string().uuid(),
  identityId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
});
```

**Validation failures** (e.g. missing fields, invalid UUID format) return `400 Bad Request` before the domain is ever touched.

**Domain invariant violations** (e.g. title too long) are caught from the aggregate and also returned as `400 Bad Request`.

All error responses follow the **RFC 7807 Problem Details** format via `ProblemDetailsExceptionFilter`.

---

## Domain Events

`Commitment.register()` emits `CommitmentRegisteredEvent`, which is captured by the aggregate's `domainEvents` array.

In this slice the `NoOpDomainEventDispatcher` discards those events. A real dispatcher (e.g. backed by NestJS `EventBus` or an outbox) will be wired in a subsequent vertical slice.

---

## Jest Configuration

The backend Jest config differs from the default NestJS scaffold in the following ways:

| Setting                                                   | Value                                 | Reason                                              |
| --------------------------------------------------------- | ------------------------------------- | --------------------------------------------------- |
| `moduleNameMapper["@commitment/domain"]`                  | Points to `packages/domain/src/index` | Avoids importing the ESM `dist/` bundle             |
| `moduleNameMapper["^(\\.\\./.*)\\.js$"]`                  | Strips `.js` suffix                   | Domain source files use ESM-style `.js` re-exports  |
| `transform["ts-jest"].tsconfig.module`                    | `"commonjs"`                          | Overrides NodeNext for Jest's CJS runtime           |
| `transform["ts-jest"].tsconfig.resolvePackageJsonExports` | `false`                               | Prevents `package.json#exports` conflicts under CJS |

The same overrides apply to `test/jest-e2e.json`.

---

## Test Coverage

### Unit Tests

| Suite                                        | Tests | Coverage                                          |
| -------------------------------------------- | ----- | ------------------------------------------------- |
| `register-commitment.handler.spec.ts`        | 3     | Handler happy path, idempotency, domain exception |
| `in-memory-commitment.repository.spec.ts`    | 1     | Save and findById                                 |
| `commitments.controller.spec.ts`             | 3     | Valid command, Zod failure, domain error mapping  |
| `register-commitment.nestjs-handler.spec.ts` | 1     | NestJS adapter + NoOp dispatcher                  |

### E2E Tests

| Suite                     | Tests                                                                   |
| ------------------------- | ----------------------------------------------------------------------- |
| `commitments.e2e-spec.ts` | 4 (happy path + idempotency, invalid UUID, empty title, title too long) |

---

## Next Steps

- Replace `InMemoryCommitmentRepository` with a real database adapter (SQLite → PostgreSQL).
- Replace `NoOpDomainEventDispatcher` with a NestJS `EventBus` or outbox-based dispatcher.
- Add `GET /v1/commitments/:id` as the next vertical slice.
