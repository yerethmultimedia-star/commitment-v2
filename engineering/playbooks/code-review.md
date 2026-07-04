# Playbook: Code Review

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 🎯 Goal

Ensure that all code merged into the codebase meets quality thresholds, remains readable, maintains strong typing, and conforms to coding standards.

## 🔍 Code Review Checkpoints

### 1. Types & Safety

- **No `any` type:** Enforce explicit interfaces or generic placeholders.
- **Null Safety:** Verify correct usage of generic `Nullable<T>` or `Optional<T>` from `@commitment/shared`.
- **Readonly Properties:** Aggregates, events, and data transfer objects (DTOs) should use immutable or readonly specifications.

### 2. Style & Naming

- Class names must be `PascalCase`.
- Variables, functions, and properties must be `camelCase`.
- Constants must be `UPPER_SNAKE_CASE`.
- TS/JS source files must be `kebab-case` (e.g. `user-registered.event.ts`).

### 3. Test Quality

- Check that unit tests verify both happy and edge cases.
- Confirm mocks are cleared between tests (`clearMocks: true` or manual `jest.clearAllMocks()`).
- Verify tests are deterministic (no hardcoded dates or clocks; use injected clock services or mock timers).

## 🔄 Procedure

1. Pull the developer branch locally.
2. Run standard ESLint check:
   ```bash
   npx pnpm run lint
   ```
3. Verify all tests pass locally.
4. Mark inline comments on PR highlighting any deviations from quality standards.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial draft of the Code Review playbook.
