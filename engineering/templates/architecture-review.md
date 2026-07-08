# Architecture Review

## Checklist

- [ ] **Aggregate Ownership:** Aggregate is the exclusive owner of lifecycle and transition rules.
- [ ] **Lean Handlers:** Command Handlers orchestrate only, no domain-level decisions.
- [ ] **Event Integrity:** Exactly one Domain Event is emitted per real state transition.
- [ ] **CQRS Read Model:** Query Handlers never reconstruct a view from aggregates; they always read from a projection (eventually consistent).
- [ ] **Inter-Module Integration:** Event-consuming modules (Notifications, Analytics, etc.) never invoke aggregates or repositories from other modules directly. Integration is strictly via Domain Events or explicit contracts.
- [ ] **Dependency Injection:** Handlers rely on abstract types/interfaces (`import type`).
- [ ] **Pipeline:** Lint, build, and tests are completely green.
