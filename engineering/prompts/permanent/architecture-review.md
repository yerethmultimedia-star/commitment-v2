# Architecture Review & Health Metrics

The Architecture Review is a mandatory step before closing any vertical slice. It ensures that the strict boundaries of DDD and CQRS remain intact and prevents business logic from leaking into infrastructure.

## Health Metrics Target

The project maintains a rigorous standard for the following architectural health metrics:

| Metric                           | Target   | Description                                                                                                                              |
| -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Business Logic in Handlers       | **0**    | Handlers must be pure orchestrators. No `if (state === ...)` conditionals.                                                               |
| Business Logic in Controllers    | **0**    | Controllers only validate inputs (Zod) and map exceptions to HTTP codes.                                                                 |
| Events Created Outside Aggregate | **0**    | Only aggregates can instantiate and record Domain Events.                                                                                |
| Shared Kernel Domain Leakage     | **0**    | The Shared Kernel must remain universally agnostic of specific bounded contexts (e.g. no `if (event.name === 'commitment.registered')`). |
| Invariant Coverage               | **100%** | All state transitions, terminal state protections, and idempotency rules must have explicit unit tests.                                  |

## Architecture Review Checklist

When verifying a Vertical Slice, answer the following questions:

1. **Aggregate Ownership:** Is the Aggregate Root the _exclusive_ owner of all lifecycle and transition rules introduced in this slice?
2. **Orchestrator Handlers:** Does the Command Handler strictly orchestrate the flow (`load -> behavior -> save -> dispatch -> return`) without making domain-level decisions?
3. **Idempotency:** Is idempotency properly handled directly within the domain entity? Does it prevent ghost events and version bumps?
4. **Event Integrity:** Is exactly one Domain Event emitted per real state transition?
5. **Dependency Injection:** Are framework adapters (like NestJS `@Inject`) strictly relying on abstract types (`import type`) rather than coupling concrete implementations at runtime where not needed?
6. **Pipeline:** Are `lint`, `build`, and `test` completely green before closing?
