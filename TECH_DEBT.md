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

## 📜 Change History

- **v1.0.0 (2026-07-04):** Formatted log structure and registered the hybrid ES module compiler warning.
