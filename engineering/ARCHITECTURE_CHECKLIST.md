# Architecture Review Checklist

Version: 1.1.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 💾 Repository Memory & AI Readiness

- [ ] **Conversational Independence:** The implementation plan, task definitions, and code structures contain all details needed for another AI agent to resume development. No instructions from previous chats are assumed.
- [ ] **AI System Prompt Alignment:** Verified that all coding activities adhere to `engineering/system-prompt.md`.

---

## 🏛️ Domain-Driven Design (DDD) & Boundaries

- [ ] **Domain Purity:** Domain entities, aggregates, and value objects are placed strictly under `packages/domain/`.
- [ ] **Invariants Encapsulation:** Aggregates encapsulate all mutation operations and enforce their business invariants locally.
- [ ] **Module Boundaries:** Subfolders under `packages/domain/` represent bounded contexts (e.g. `identity`, `execution`). Cross-boundary modifications are prohibited.
- [ ] **Public API Review:** Ensure `index.ts` exports only the intended public contracts, aggregates, and events. Private internal logic remains unexported.

---

## ⚡ CQRS & Event Sourcing

- [ ] **Segregated Paths:** Query handlers bypass aggregates and do not trigger command/write events.
- [ ] **Aggregate Hydration:** In-memory aggregate roots hydrate their state strictly by replaying historical events via `loadFromHistory`. No direct setters exist on fields.
- [ ] **State Mutation Control:** All state mutations trigger a domain event which is applied via the base `AggregateRoot.apply` method.
- [ ] **Concurrency Version Check:** Aggregate version increments match historical stream length to prevent double-write conditions.

---

## 🧼 Clean Architecture & Dependencies

- [ ] **Dependency Direction:** Code imports point inward (e.g. UI calls commands, adapters depend on domain contracts, domain imports nothing).
- [ ] **Zero Leakages:** No dependencies on `NestJS` or `Flutter` packages inside `packages/domain/` or `packages/shared/`.
- [ ] **Workspace Reference Integrity:** Package references in `package.json` use the `workspace:*` identifier.

---

## 📴 Offline First & Sync Engine

- [ ] **Client Database Cache:** Reads and writes execute locally on SQLite (via Drift) before syncing to Supabase.
- [ ] **Sync Queue:** Operations are buffered in a local queue if network connection is offline.
- [ ] **Conflict Resolution:** Inbound events from Supabase use timestamp/vector-clock checks to resolve conflicts deterministically.

---

## 🌐 i18n & Localization

- [ ] **Strict i18n Compliance:** Zero hardcoded strings in user-facing views or presentation models.
- [ ] **Localizations File Sync:** New keys are updated in both English and Spanish translation lists.
- [ ] **Core Language:** All schemas, code variables, database tables, and log events are in English.

---

## ♿ Accessibility & Privacy

- [ ] **Contrast Compliance:** Colors align with HSL desaturated tone values (Calm Design principles).
- [ ] **Decision Hygiene:** UI elements avoid fast triggers, aggressive notifications, or feedback loops.
- [ ] **PII Protection:** User profile details and records are kept on-device, or stored encrypted under Supabase RLS.

---

## 🔒 Security, Observability, & Performance

- [ ] **Supabase RLS Policies:** Every database table in Supabase has active, verified Row-Level Security policies.
- [ ] **Data Validation:** Incoming request payloads are validated via Zod schemas at API boundaries.
- [ ] **Tracing & Metrics:** Tracing context (TraceId/CorrelationId) is propagated across internal logs.
- [ ] **Database Indexing:** Indexed columns are configured for frequently filtered, sorted, or joined query fields.

---

## 💰 Cost Awareness & Maintainability

- [ ] **Query Efficiency:** Multi-join queries or expensive payload retrievals are replaced with read-model queries.
- [ ] **Small Classes & Functions:** Code is highly composable, using small classes and functions.
- [ ] **Test Gating:** Domain package maintains 100% unit test coverage.
- [ ] **Backward Compatibility:** Database schema changes are additive to preserve sync logic compatibility with older app clients.
- [ ] **Technical Debt Logged:** Any deferred adjustments are registered in `TECH_DEBT.md`.
- [ ] **Documentation Sync:** `PROJECT_STATUS.md`, `walkthrough.md`, and relevant doc directories are updated.
- [ ] **Definition of Done:** Verify that the task satisfies all criteria in the system prompt.

---

## 📜 Change History

- **v1.1.0 (2026-07-04):** Expanded checklist to include Repository Memory, AI Readiness, module boundaries, public API reviews, and backward compatibility checks.
- **v1.0.0 (2026-07-04):** Initial checklist creation.
