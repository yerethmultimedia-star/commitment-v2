# Vertical Slice Workflow

This is the standard execution pattern for developing and delivering a new vertical slice (VS) in this project. It is designed to preserve architectural integrity, eliminate regressions, and enforce DDD + CQRS best practices.

## 1. Capability Brief

- Define the business value, goal, and scope of the slice.
- Define what constitutes "done" functionally.

## 2. Architecture Sketch (5 minutos)

- Propose the domain model additions or changes.
- Propose CQRS models (Commands, Results, DTOs).
- Discuss any edge cases, invariants, and open questions before coding.

## 3. Implementation Plan

- Document the concrete changes in an `implementation_plan.md` artifact.
- Obtain formal approval (User Review) before execution.

## 4. Task Checklist

- Create a `task.md` artifact breaking down the implementation plan into a checklist.
- Track progress sequentially.

## 5. Domain First (TDD)

- Implement aggregate behavior, state machines, and invariants.
- Write domain specs first.
- Ensure idempotency and exclusively domain-owned rules.

## 6. CQRS Layer

- Create `Command`, `Result`, and `Handler` files.
- Ensure the handler is a _pure orchestrator_ (see `architecture-review.md`).

## 7. API Layer & Infrastructure

- Expose the controller endpoint.
- Register the NestJS adapter in the corresponding module.
- Write controller specs validating HTTP outputs and error mappings.

## 8. Verification Pipeline

- Run linting: `pnpm run lint`
- Run build check: `pnpm run build`
- Run all tests: `pnpm run test`

## 9. Architecture Review

- Perform the mandatory architecture review using the standards defined in `architecture-review.md`.

## 10. Product Review & Slice Closure

- Submit completion report (`vs-XXX_completion_report.md`).
- Update `PROJECT_STATUS.md`.
- Commit changes and close the slice.
