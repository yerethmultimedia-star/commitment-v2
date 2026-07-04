# Playbook: Architecture Review

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 🎯 Goal

Standardize the process for reviewing code architecture against the core engineering principles, verifying boundaries and preventing technical debt.

## 🔍 Checklist of Review Areas

1. **Domain Isolation Check:**
   - Inspect import statements in `packages/domain/`.
   - Ensure no package imports any frameworks, databases, or application layer libraries (e.g. `@nestjs/*`, `flutter/*`, `drift/*`).
2. **Event Sourcing Compliance:**
   - Verify that aggregates only update their internal state in event handlers triggered by `apply()`.
   - Ensure the version property is correctly incremented.
3. **CQRS Segregation:**
   - Verify that write-path aggregates do not expose internal states for query models.
   - Assert that queries perform read-only actions and skip the domain package write path.
4. **i18n & Localization:**
   - Check that no presentation labels or message text strings are hardcoded in views.

## 🔄 Procedure

### 1. Verification Run

Run the verification script to ensure clean compilation and complete test coverage:

```bash
npx pnpm run build && npx pnpm run lint && npx pnpm test
```

### 2. Review Record Drafting

Create a review result file:

- File name format: `engineering/reviews/REVIEW-TASKID-yyyy-mm-dd.md`
- Use the standard `REVIEW_TEMPLATE.md` from `engineering/`.

### 3. Reporting Findings

- Enumerate any critical violations that must be fixed.
- Suggest optimization patterns or technical debt registrations.
- Sign off as `Approved`, `Approved with modifications`, or `Rejected`.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial draft of the Architecture Review playbook.
