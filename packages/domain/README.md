# @commitment/domain

Core pure Domain infrastructure and abstractions for Commitment v2 (Event Sourcing & CQRS).

## Structure

- `core/`: Base abstractions:
  - `AggregateRoot`: State hydration and event collection.
  - `DomainEvent`: Envelope contracts for all historical occurrences.
  - `EventStore`: Storage contracts.
  - `CQRS`: Port handlers for Command & Query patterns.
- `shared/`: Reusable domain primitives and types:
  - `Entity`, `AggregateRoot`, `ValueObject`, `UniqueEntityId`
  - `BusinessRule` validation engine and logical `Specification` checks
  - Minimal outcome `Result` monad and base domain exceptions
  - Placeholder stubs for domain primitives (`Email`, `Percentage`, etc.)
  - Nominal typing utilities (`Brand<T, B>`, `Nullable<T>`, etc.)
- `identity/`: Identity Bounded Context:
  - Core `Identity` aggregate root.
  - Self-validating value objects (`Email`, `DisplayName`, etc.).
  - Domain events `IdentityCreatedEvent` and `IdentityUpdatedEvent`.
  - Repository interfaces.

## Documentation

- [docs/shared-kernel.md](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/docs/shared-kernel.md) — Shared Kernel design patterns
- [docs/shared-api.md](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/docs/shared-api.md) — Shared Kernel public API reference
- [docs/identity.md](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/docs/identity.md) — Identity Context specifications

## Installation

Add to package dependencies:

```json
"dependencies": {
  "@commitment/domain": "workspace:*"
}
```
