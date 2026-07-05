# Technical Debt Register

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

This document tracks identified technical debt, compilation warnings, and architectural compromises, outlining their impact, priority, and recommended resolution steps.

---

## Active Technical Debt Item 1: Jest Hybrid Module Warnings (TS151002)

- **Description:** Testing execution in `@commitment/domain` displays warnings: `ts-jest[config] (WARN) message TS151002: Using hybrid module kind (Node16/18/Next) is only supported in "isolatedModules: true".`
- **Impact:** Clutters terminal outputs during local validation runs and CI pipelines, reducing developer feedback readability. Does not block build execution or compilation.
- **Priority:** Low
- **Recommended Resolution:** Update the `@commitment/domain` package `tsconfig.json` to include `"isolatedModules": true` or configure `ts-jest` config blocks to ignore code `151002` diagnostics. _Deferred to EPIC-001 (TASK-001)._

---

## Active Technical Debt Item 2: TD-003 — Redundant Idempotency Logic in Handlers

- **Description:** Review the handlers for Activate and Pause to verify they do not contain business decisions (including idempotency). If they exist, move them to the aggregate to maintain the domain's exclusive responsibility.
- **Impact:** Redundant business logic in the orchestrator layer (handlers) violates CQRS orchestration rules and dilutes the aggregate's authority over state transitions, risking inconsistencies if the domain logic evolves.
- **Priority:** Medium
- **Recommended Resolution:** Remove handler-level `if (commitment.state === ...)` checks for Activate and Pause, ensuring the Domain Aggregate fully handles these state idempotency rules natively.

---

## 📜 Change History

- **v1.1.0 (2026-07-05):** Registered TD-003 regarding redundant idempotency logic in Activate/Pause handlers.
- **v1.0.0 (2026-07-04):** Formatted log structure and registered the hybrid ES module compiler warning.
