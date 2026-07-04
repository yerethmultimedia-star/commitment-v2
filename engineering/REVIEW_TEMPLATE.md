---
id: TEMPLATE-REVIEW
title: Architecture Review Template
status: Active
owner: Architecture Review Board
created: 2026-07-04
updated: 2026-07-04
version: 1.0.0
related_docs:
  - engineering/ARCHITECTURE_CHECKLIST.md
related_adrs: []
description: Reusable template for documenting architecture and design reviews.
---

# ARCHITECTURE REVIEW: [TASK_ID] - [TITLE]

Review ID: [REV-ID]
Target Task: [TASK_ID]
Reviewer: [Reviewer Name / Board]
Date: [YYYY-MM-DD]
Status: [Pending/Approved/Approved with Modifications/Rejected]

---

## 🔍 Executive Summary

A short summary of the review, the code changes examined, and the overall consensus.

## 🏛️ Architecture Alignment Validation

Verify alignment against the core engineering principles:

| Principle                       | Status          | Notes / Observations                              |
| :------------------------------ | :-------------- | :------------------------------------------------ |
| **DDD (Domain-Driven Design)**  | [Pass/Fail/N/A] | Business rules isolated in `/packages/domain`     |
| **CQRS**                        | [Pass/Fail/N/A] | Command/Query segregation respected               |
| **Event Sourcing**              | [Pass/Fail/N/A] | Aggregates hydrate via events, versions tracked   |
| **Clean Architecture**          | [Pass/Fail/N/A] | Dependency direction correct, no framework leaks  |
| **Offline First**               | [Pass/Fail/N/A] | Drift client database as single source of truth   |
| **Internationalization (i18n)** | [Pass/Fail/N/A] | No hardcoded presentation strings, English domain |
| **Security & Privacy**          | [Pass/Fail/N/A] | Row-level security (RLS) and encryption active    |
| **Cost & Performance**          | [Pass/Fail/N/A] | Efficient network queries, appropriate indexing   |

## 🧪 Quality & Testing

- **Linter Status:** [Pass/Fail]
- **TypeScript Compilation:** [Pass/Fail]
- **Unit Test Coverage:** [Percentage / Pass Status]
- **Integration Test Status:** [Pass/Fail/N/A]

## 📝 Identified Issues & Action Items

### 🔴 Critical Issues (Must fix before merge)

1. _Issue description..._
   - **Action Required:** Describe steps to fix.

### 🟡 Minor Issues / Suggestions (Recommended fixes)

1. _Issue description..._
   - **Action Required:** Describe recommendations.

## 📋 Architectural Decisions & Tech Debt

- **New ADRs Required:** [Yes/No - detail title if Yes]
- **Registered Tech Debt:** [Describe any debt introduced and link to `TECH_DEBT.md`]

## 🏁 Conclusion

- [ ] Approved as-is
- [ ] Approved with modifications (merge after action items are resolved)
- [ ] Rejected (requires major revisions and another review round)
