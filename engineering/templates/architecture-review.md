# Architecture Review

## Checklist

- [ ] **Aggregate Ownership:** Aggregate is the exclusive owner of lifecycle and transition rules.
- [ ] **Lean Handlers:** Command Handlers orchestrate only, no domain-level decisions.
- [ ] **Idempotency:** Idempotency is natively handled without side effects.
- [ ] **Event Integrity:** Exactly one Domain Event is emitted per real state transition.
- [ ] **Dependency Injection:** Handlers rely on abstract types/interfaces (`import type`).
- [ ] **Pipeline:** Lint, build, and tests are completely green.
