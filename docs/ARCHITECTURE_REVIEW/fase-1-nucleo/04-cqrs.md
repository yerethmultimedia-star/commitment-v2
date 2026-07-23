# CQRS (Commands, Queries)

## Current State

CQRS is implemented via `@nestjs/cqrs` consistently across `commitment`, `task`, `habit`, `goal`. Each module follows: NestJS Controller (thin, per Iteration 2) → `*Command`/`*Query` DTO → `*CommandHandlerCore`/`*QueryHandlerCore` (framework-agnostic, wrapped by a thin `*.nestjs-handler.ts` adapter) → domain aggregate → `VersionedXRepository` port → in-memory store (Iteration 5's topic).

The read side is genuinely separate, not just naming: `ListCommitmentsQueryHandlerCore` (`commitment/application/queries/list-commitments.handler.ts`) depends on `CommitmentQueryService` (`commitment/application/ports/commitment-query-service.port.ts`) — a distinct port from the write side's `VersionedCommitmentRepository`. Commands are mostly behavior-shaped (`ActivateCommitmentCommand`, `PauseCommitmentCommand`, `ResumeCommitmentCommand`, `CancelCommitmentCommand`, `CompleteCommitmentCommand`, `RegisterCommitmentCommand`), with one deliberate exception: `EditCommitmentCommand` (`commitment/application/commands/edit-commitment.command.ts`) is a generic patch DTO (`title?, description?, recurrencePattern?, targetDate?, priority?`) — CRUD-shaped, for the parts of Commitment that are genuinely just editable metadata, not state-machine transitions.

A real Saga exists: `RecurringCommitmentSaga` (`commitment/application/sagas/recurring-commitment.saga.ts`) is an `@EventsHandler(CommitmentCompletedEvent)` that calculates the next occurrence (`NextOccurrenceCalculator`) and issues a new `RegisterCommitmentCommand` via `CommandBus` — genuine event-choreography orchestration, not just single-aggregate command handling.

Validation happens via manual Zod schemas in controllers (e.g. `commitments.controller.ts`'s `register()`: `registerSchema.safeParse(dto)` → `BadRequestException` on failure), not `class-validator` decorators + a global `ValidationPipe` (confirmed absent: no `useGlobalPipes` in `main.ts`, no `class-validator` imports found in any DTO). `@ApiProperty` decorators on DTOs are Swagger-documentation-only, not enforcement.

## Strengths

- **The read/write split is real, not cosmetic.** `CommitmentQueryService` is a separate port from `VersionedCommitmentRepository` — this is CQRS in the load-bearing sense (the query side could, in principle, be backed by a different projection/store than the command side, which is the entire point of the pattern), not just "we named our DTOs Command/Query."
- **The `RecurringCommitmentSaga` is genuine domain automation earning its keep.** Recurrence is a real product requirement (Framework Chapter 2, "systems evolve"/recurring commitments), and implementing it as event choreography (react to `CommitmentCompletedEvent`, issue a new `RegisterCommitmentCommand`) rather than embedding "create the next occurrence" logic inside `CompleteCommitmentCommandHandlerCore` is the correct call — it keeps Complete's handler single-purpose and makes recurrence an optional, observable side effect.
- **`CompleteTaskCommandHandlerCore` (`task/application/commands/complete-task.handler.ts`) is the cleanest command handler in the codebase**: load → call `task.complete()` → let it throw or succeed → persist → dispatch. No redundant pre-checks. This is the pattern to hold up as the standard.

## Weaknesses

- **TD-003 (already logged in `TECH_DEBT.md` Item 2) is confirmed, with a definitive answer: idempotency logic has leaked into the handler layer, but only in Commitment's Activate/Pause handlers, not Task's.** `ActivateCommitmentCommandHandlerCore.handle()` (line 55-63) and `PauseCommitmentCommandHandlerCore.handle()` (line 52-60) both pre-check `commitment.state === CommitmentState.Active/Paused` and short-circuit _before_ calling the aggregate method. This is provably redundant: `Commitment.activate()` itself (`packages/domain/src/commitment/aggregate/commitment.ts` lines 143-147) already contains `if (this._state === CommitmentState.Active) { /* Idempotent: already active, no state change or event */ return; }` — the exact same check, correctly placed, per Rule #77 ("No Meaningless Events"). The handler-level check does nothing the aggregate doesn't already do; it just duplicates the condition and adds an extra `.save()` round-trip on the idempotent path. Compare directly against `CompleteTaskCommandHandlerCore`, which has no such pre-check at all and simply trusts the aggregate — proving the redundant pattern isn't architecturally necessary anywhere in this codebase, Commitment just does it twice.
- **Validation strategy is inconsistent, not absent.** Zod schemas in controllers work, but coexist with `@ApiProperty`-only DTOs (no `class-validator`, no global `ValidationPipe`) — two different validation philosophies in the same layer (some modules may rely on Zod, others might not consistently; this pass only confirmed Commitment's `register` does). Worth confirming this Zod-in-controller pattern is applied uniformly across Task/Habit/Goal's write endpoints, not just Commitment's.
- **Minor cross-module import leak specific to CQRS infrastructure:** `task/application/commands/complete-task.handler.ts` imports `DomainEventDispatcher` from `'../../../commitment/application/ports/domain-event-dispatcher.port'` — a Commitment-module path — rather than from a shared/neutral location. Functionally harmless (it's a stable interface), but it's the kind of import that makes Task's module boundary read as "depends on Commitment" when the actual coupling is "depends on a generic event-dispatch capability that happens to live in Commitment's folder."

## Risks

- The Activate/Pause duplicate-idempotency-check pattern is exactly the kind of thing that gets copy-pasted onto new command handlers by habit (a future engineer sees it in Activate/Pause and assumes it's the house style), spreading a redundancy that provides no real safety net — the actual safety net is already in the aggregate.
- If the Zod-schema-in-controller pattern isn't applied consistently to every write endpoint, some routes get real 400-with-field-errors behavior and others get whatever the aggregate/Value-Object constructors throw natively (likely a generic 500 or an unhandled exception) — a real inconsistency in API robustness that would surface in production, not in the current in-memory demo.

## Technical Debt

- **TD-003, now with a concrete fix**: remove the handler-level state pre-check from `ActivateCommitmentCommandHandlerCore` and `PauseCommitmentCommandHandlerCore`; call `commitment.activate(...)`/`commitment.pause()` unconditionally and let the aggregate's existing idempotent no-op handle the repeat-call case (it already returns without emitting events, so `getUncommittedEvents()` will simply be empty on that path — no behavior change from the caller's perspective, just removes the duplicated logic).
- Audit whether `registerSchema`-style Zod validation exists for every write endpoint across Task/Habit/Goal controllers, not just Commitment's `register` — not confirmed one way or the other this pass.

## Recommendations

1. Remove the redundant idempotency pre-checks in `ActivateCommitmentCommandHandlerCore`/`PauseCommitmentCommandHandlerCore` — low-risk, well-understood fix, directly closes TD-003. _Justification: Maintainability (removes duplicated business logic from the wrong layer, matching the codebase's own Rule #85/#86) and Developer Experience (removes a misleading example other handlers might copy)._
2. Standardize on one validation strategy (Zod-in-controller appears to be the more deliberate, already-adopted pattern given `env.config.ts` also uses Zod) and confirm/enforce it uniformly across all write endpoints. _Justification: Reliability and Security — inconsistent validation is a real production-readiness gap once this moves past in-memory demo mode._
3. Move `DomainEventDispatcher`'s port definition to a genuinely shared location (e.g. `apps/backend/src/shared/` or similar) rather than Commitment's folder. _Justification: Maintainability/DX — low effort, removes a misleading cross-module import._

## Priority

**Medium.** Nothing here is broken in the current in-memory, single-tenant system — every command handler works correctly today. But TD-003's redundancy is a known, already-logged item with a now-definitive fix, and the validation-consistency question is a real gap that will matter the moment this system takes real, untrusted traffic (which — per Iteration 5's upcoming persistence-strategy question — is an open timeline question for this project, not a hypothetical far future).
