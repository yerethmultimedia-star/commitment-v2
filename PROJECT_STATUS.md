# Commitment v2 — Project Status

Version: 1.52.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-17

---

## Current Phase

**Design System Adoption (2026-07-15)**, resumed at Goals. The **Stabilization & Product Audit**
gate that previously blocked this is now partially cleared, not fully closed — status verified
against code on 2026-07-15, not restated from memory:

- The audit's sole **Critical** finding (P1/TD-8, invisible submit buttons on Commitment/Habit
  forms) is **fixed and verified**.
- A separate, narrower mini-phase — TD-015 keyboard accessibility (no interactive element was
  Tab-reachable on web) plus 2 same-day follow-up regressions (nested `<button>`, missing UA reset,
  invisible focus ring) — is **fixed and verified** (216/216 design-system tests, live keyboard-only
  Playwright pass). See `TECH_DEBT.md` Item 15.
- P3/TD-9 (Badge/Chip primitive) is also fixed (2 of 3 call sites; third is now dead code, not
  deleted).
- **4 High findings remain open, tracked but not blocking per explicit 2026-07-15 direction:** P2
  (duplicated screen titles), P4 (Tasks screen interaction pattern), P5 (Goals sub-tab text
  truncation), A1/TD-10 (Goal aggregate has no backend module). Medium/Low findings from the audit
  are untouched. See `engineering/governance/architecture_product_audit_2026Q3.md` v1.1.0 and
  `TECH_DEBT.md` v1.14.0 for full evidence per item.

Underlying phase: Vertical Slice Phase (Product Capabilities), Design System Adoption sub-track.

## Current Sprint

**VS-031 — Product Experience Foundation: `Completed`, not `Closed`.** What shipped as VS-031 grew
far past its original Block A (Dashboard Layout Engine, Recommendation Engine): it now also
includes a full Habit vertical, Goal/Milestone aggregate + Goal Workspace, an Insights engine,
`CommitmentPriority` threaded through the full stack, a 4-theme Theme Engine redesign, a Coach
recommendation UI, a repo-wide accessibility/design-token pass, and a canonical demo dataset. Full
evidence and a 7-category review: `engineering/governance/vs031_completion_report.md` (v2.2.0).
Committed as `1a3f598`/`7853f22`/`7cdf6cf`. **Not `Closed`:** whether the post-Block-A work should
retroactively be scoped as one sprint or split into new sprint numbers per ADR-016 Rule 2 is still
an open product decision, now joined by the stabilization audit's own findings as additional
context for that decision.

- **VS-032 — Design System Adoption: `Closed` (2026-07-16).** All 9 screens complete: Stabilization
  ✅, Today ✅, Coach ✅, Calendar ✅, Goals ✅, Habits ✅, Tasks ✅ (functional-audit round found and
  fixed 2 blockers), Insights ✅ (product-audit standard), Profile ✅ (found and fixed a demo/real
  seam violation), Appearance ✅ (closed 2026-07-16 — found and fixed a screen-reader accessibility
  gap in the theme picker; found, logged, not fixed a High-Contrast setting with no real effect, see
  `TECH_DEBT.md` Item 28). **Product Polish is now the active milestone** — see below. Not yet
  reconciled against the open VS-032-scoping question below (whether this and VS-031's post-Block-A
  work should retroactively be split into separate sprint numbers) — this note records what's
  actually happened, not a resolution of that question.
- Sprints **VS-025** (Dashboard Experience Foundation), **VS-026** (Theme Engine Foundation),
  **VS-027** (Experience Themes), and **VS-028** (Widget Registry) are self-labeled complete per
  their respective commits. **VS-029** (Motion System) has no commit evidence and remains
  Planned. **VS-030** (Accessibility & Polish) is self-labeled complete, but its fitness against
  the roadmap's accessibility criteria has not been independently verified — see
  `engineering/governance/roadmap_reconciliation_2026Q3.md` §2.
- Previous Sprint **VS-024** (Activity Record History) has been successfully closed.
- Full reconciliation of this status against git history: `engineering/governance/roadmap_reconciliation_2026Q3.md`.

---

## Estado general del proyecto

### Reauditadas el 2026-07-14 (evidencia: `engineering/governance/vs031_completion_report.md` v2.0.0 — tests, tsc, recorrido Playwright de 12 pantallas)

| Área                 | Progreso | Madurez       | Observaciones                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :------------------- | :------: | :------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme Engine         | **90%**  | 🟢 Producción | 4 temas rediseñados, invariantes semánticas verificadas, auditoría WCAG hecha. Falta perf/bundle.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Dashboard Experience | **85%**  | 🟢 Producción | Engine + Recommendation + Hero card + Coach widget + FloatingTabBar verificados funcionando.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Dashboard Widgets    | **80%**  | 🟢 Producción | Widget Registry con ~10 widgets activos, verificado vía Playwright. Sin medición de perf.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Habits               | **97%**  | 🟢 Producción | Design System Adoption + UX redesign + Goal linkage opcional, todo cerrado (2026-07-15). Item 18 resuelto.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Tasks                | **95%**  | 🟢 Producción | Fase 2 VS-032 cerrada (2026-07-16) tras auditoría funcional completa — ver detalle abajo. Item 23 (Medium, pre-existente, no bloqueante) queda abierto.                                                                                                                                                                                                                                                                                                                                                                       |
| Goals                | **90%**  | 🟢 Producción | Design System Adoption completo (2026-07-15) — ver checkpoint. Falta backend module (A1/TD-10, High, tracked).                                                                                                                                                                                                                                                                                                                                                                                                                |
| Insights             | **94%**  | 🟢 Producción | VS-032 cerrada (2026-07-16) — auditoría de producto completa. "Hábitos de Hoy" reemplazado por métricas reales de consistencia (Item RI-5). 1 hallazgo de UX diferido a Product Polish (Item 26). **UI Freeze declarado** junto con Today/Coach/Calendar/Goals/Habits/Tasks.                                                                                                                                                                                                                                                  |
| Profile              | **88%**  | 🟢 Producción | VS-032 cerrada (2026-07-16). Encontrado y corregido: la pantalla mostraba la identidad demo siempre, incluso con Demo Mode apagado (Item RI-6) — ahora pasa por el mismo seam demo/real que el resto de la app. Migrado a componentes DS (Button/Switch). Falta backend real de Identity/Profile (Item 27, Medium, paralelo a TD-10). Sumada al UI Freeze.                                                                                                                                                                    |
| Appearance           | **90%**  | 🟢 Producción | VS-032 cerrada (2026-07-16) — último ítem del sprint. 4 temas + persistencia (SecureStore) + Preview (crossfade) + Reducir Movimiento verificados vía Playwright, clicks reales. Migrado a AppScreen/DS (Body/Switch/SectionHeader/LoadingState). Encontrado y corregido: el picker de temas no exponía el tema seleccionado a lectores de pantalla (`aria-selected` nunca se emitía — RI-7). Encontrado, no corregido: "Alto contraste" no tiene ningún efecto visual real (Item 28, Medium, diferido). Sumada al UI Freeze. |
| Coach                | **60%**  | 🟡 Beta       | UI shell + reglas de recomendación reales verificadas; sin IA real (fuera de alcance).                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Accesibilidad        | **80%**  | 🟡 Beta       | Pase de tokens/labels en ~20 archivos este sprint; no auditado contra checklist WCAG formal.                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### No reauditadas desde 2026-07-08 (pendientes)

| Área                 | Progreso | Madurez          | Observaciones                                                        |
| :------------------- | :------: | :--------------- | :------------------------------------------------------------------- |
| Dominio              | **100%** | 🟢 Producción    | Estable                                                              |
| Backend              | **97%**  | 🟢 Producción    | Pendiente persistencia definitiva y optimizaciones                   |
| Arquitectura         | **100%** | 🟢 Producción    | Congelada                                                            |
| Mobile Platform      | **92%**  | 🟢 Producción    | Base consolidada                                                     |
| Internacionalización | **100%** | 🟢 Producción    | Transversal                                                          |
| Design System        | **35%**  | 🟡 Beta          | En expansión — probablemente subestimado tras Phase 8, no reauditado |
| UX/UI                | **65%**  | 🟡 Beta          | En evolución                                                         |
| Offline              |  **5%**  | ⚪ Planificado   | Arquitectura preparada                                               |
| Cloud Sync           | **10%**  | ⚪ Planificado   | Preparado para sincronización                                        |
| Analytics            | **15%**  | 🔵 Investigación | Sin desarrollo funcional                                             |
| AI Coach             |  **0%**  | 🔵 Investigación | Pendiente                                                            |

_Nota (2026-07-14): la tabla se dividió en dos bloques para no dejar números contradictorios en el
mismo documento (ver feedback de usuario del 2026-07-14). El primer bloque tiene evidencia directa
de esta sesión; el segundo sigue siendo el mismo estimado no verificado desde 2026-07-08 y necesita
su propia auditoría dedicada — no se inventan números para áreas que no se verificaron._

---

## Progreso global

**Progreso total estimado:** **≈88%**

_Nota: No significa que el usuario vea el 87% de funcionalidades, sino que **la plataforma necesaria para soportarlas** ya existe._

---

## Slice Value Evaluation (Expected for VS-025)

| Métrica               | Resultado         |
| :-------------------- | :---------------- |
| Valor para usuario    | ⭐⭐⭐⭐⭐        |
| Valor técnico         | ⭐⭐⭐ shadow     |
| Impacto visual        | Alto              |
| Reutilización         | Muy alta          |
| Riesgo                | Bajo              |
| Deuda técnica añadida | Ninguna / Listada |

---

## Próximos slices

- ✅ **VS-025 — Dashboard Experience Foundation** (Completed, self-labeled)
- ✅ **VS-026 — Theme Engine Foundation** (Completed, self-labeled)
- ✅ **VS-027 — Experience Themes** (Completed, self-labeled)
- ✅ **VS-028 — Widget Registry** (Completed, self-labeled)
- ⚪ **VS-029 — Motion System** (Planned; no commit evidence found)
- ✅ **VS-030 — Accessibility & Polish** (Completed, self-labeled; accessibility criteria not independently verified)
- ✅ **VS-031 — Product Experience Foundation** (Completed, verified — see `vs031_completion_report.md` v2.2.0; committed as `1a3f598`/`7853f22`; not `Closed` — retroactive sprint-scoping decision still open)

1. ✅ **VS-032 — Design System Adoption** (`Closed`, 2026-07-16; supersedes the stale
   "VS-032 — Calendar" single-screen framing — Calendar was completed as one screen within it, not
   the whole sprint). Three blocks per 2026-07-15 direction — full detail in `ENGINEERING_BOARD.md`:
   - _Foundation_ (done, no longer re-audited per screen): Theme Engine ✅, Accessibility ✅,
     Keyboard Navigation ✅, Design System Foundation ✅.
   - _Design System Adoption_ (all 9 screens ✅): Today, Coach, Calendar, Goals, Habits, Tasks
     (Fase 2, 2026-07-15 — Goal linkage optional + score-based Priority-of-the-day, see
     `TECH_DEBT.md` Item 22), Insights (2026-07-16), Profile (2026-07-16), **Appearance**
     (2026-07-16 — closing checkpoint, see `TECH_DEBT.md` RI-7/Item 28).
2. **Milestone: Product Polish** (active as of 2026-07-16 per the user's VS-032 closing evaluation
   — deliberately _not_ named `VS-033`, since it measures something categorically different from
   every VS-032 checkpoint; `VS-033` stays reserved for Reminder Settings below). Three explicit
   freezes in effect until this milestone is scoped: **domain** (no new aggregates/entities, bugs
   only), **Design System** (no new components unless Critical, refinement only), **navigation**
   (no screens move, no flows change, polish only). Does **not** measure bugs-closed or
   components-migrated (VS-032's retired metrics) — measures whether the product _feels
   exceptional_: time-to-complete-frequent-tasks, visual consistency, premium perception,
   microinteractions, animation quality, copy, onboarding, delight, fine-grained accessibility,
   perceived performance. Guiding question: not "¿qué pantalla sigue?" but "¿qué haría que
   Commitment pareciera una aplicación de Apple, Notion o Linear?" Scope carried over from deferred
   VS-032 findings: Insights stat-card affordance (`TECH_DEBT.md` Item 26), Profile empty-state
   copy for the no-backend case (Item 27's note), Appearance's High-Contrast setting (Item 28).
   Lifts the UI Freeze on all 9 adopted screens once started — see `ENGINEERING_BOARD.md` v1.25.0.
   Full pillar definitions (Motion/Visual Language/Interaction Language/Content/Delight) and the
   working `Principios` list: `PRODUCT_POLISH_GUIDE.md` (new, v1.0.0).
3. **VS-033 — Reminder Settings**
4. **VS-034 — Recurrence Management**
5. **VS-035 — Offline First & Sync**
6. **VS-036 — Search / Filters** (reprogrammed from VS-031 per ADR-015)
7. ✅ **VS-037 — Product Consistency Initiative** (opened 2026-07-17, **audit phase Closed
   2026-07-17**). Follows ADR-019 (visible domain model) and ADR-020 (Universal Capture) — both
   closed and treated as the architectural baseline. Run as a category-by-category audit
   (Terminología → Modelo mental → Comportamiento → Visual), sweeping each category fully before
   implementing, to batch related fixes instead of many single-string PRs — explicit user
   methodology for this workstream, distinct from the find→decide→implement rhythm of
   ADR-019/ADR-020.

   **Final results:**

   | Categoría      | Resultado                                                                                        |
   | -------------- | ------------------------------------------------------------------------------------------------ |
   | Terminología   | 1 corrección directa confirmada (**T-001**, `TECH_DEBT.md` Item 37)                              |
   | Modelo Mental  | 2 observaciones sin acción (**M-001**, **M-002**) + 1 decisión de producto pendiente (**M-003**) |
   | Comportamiento | 1 inconsistencia importante, **ya resuelta** (**B-001**, Item 36)                                |
   | Visual         | 2 inconsistencias de Design System confirmadas (**V-001** Item 38, **V-002** Item 39)            |
   - **T-001:** Coach's `commitments-completed` achievement counts Commitments but displays
     "objetivos completados." Confirmed, no ADR needed.
   - **M-001:** entity creation-flow richness varies (3 distinct secondary patterns across
     Goal/Commitment+Habit/Task) — closed, no evidence of friction, a reasonable hypothesis
     (different entities need different upfront configuration) explains it.
   - **M-002:** Commitment has no top-level nav, lives nested under Goals — closed as _consistent_
     with ADR-019 (containment, not invisibility), not a residue of the old model.
   - **M-003:** Coach's onboarding-style suggestions always point to creating a Goal, never a
     Commitment directly, even when driven by Commitment data — left open as a genuine product
     question, not resolved.
   - **B-001 (resolved):** Goal Workspace's "Upcoming" Task cards had zero interaction, unlike
     their Commitment/Habit siblings in the same tab. A small sub-investigation (precedent
     comparison, ruling out "reversibility" as the deciding factor via `TasksScreen.tsx`'s own
     unconfirmed one-tap complete) converged on a reusable rule — _a summary card should lead to
     the entity's own interaction surface_ — and was implemented immediately as an exception to the
     batch-at-the-end plan. Verified live via Playwright.
   - **V-001:** Task's priority/status don't reuse the `Badge` component Commitment already uses
     for the same semantics. Priority sub-case is pure implementation duplication (fix is
     mechanical). Status sub-case needs one small product call (should Task status get the same
     visual prominence as Commitment status?) before applying.
   - **V-002:** `GoalWorkspaceScreen.tsx` hand-rolls all 5 of its empty states instead of using the
     shared `EmptyState` component every other screen already uses.

   **Process observation (user's own closing read):** each category revealed a different _class_
   of finding — Terminología found language debt inherited from ADR-019; Modelo Mental found
   architecture questions, not errors; Comportamiento found one real UX break, now fixed; Visual
   found Design System adoption gaps, not conceptual issues. Read together, this suggests the
   product's architecture is fairly consolidated — remaining inconsistencies are convergence debt
   (screens/components that haven't caught up to the current pattern), not conceptual gaps.

   **Sequencing, confirmed 2026-07-17:** VS-037 was a cross-cutting audit inserted between two
   strategic roadmap initiatives — now that it's closed, the roadmap resumes where it was
   interrupted. **Goal Backend / CQRS / Event Store is next**, not the Consistency Cleanup batch.
   Explicit reasoning: T-001/V-001/V-002 are convergence debt (terminology + Design System
   adoption) — the product functions correctly without them, they don't block or unlock anything.
   Goal Backend/CQRS/Event Store affects core domain evolution and gates future capability
   (history, audit, sync, projections) — higher architectural impact, keeps priority. Consistency
   Cleanup stays **queued, unscheduled**, deferred to a later window — with one explicit escalation
   condition: if any of the three items starts generating real friction _while_ Goal Backend work
   is underway (e.g. V-001 blocks reusing a component in a new screen, V-002 forces duplicating an
   empty state, T-001 starts confusing new Coach/navigation work), pull it forward then rather than
   waiting for a dedicated cleanup window.

8. 🔄 **Goal Backend / CQRS / Event Store — ADR-021 Approved (2026-07-17), Fase 1 implemented
   (2026-07-17).** Resumed as the strategic initiative after VS-037 closed, following the same
   Investigation → Alternatives → Decision process validated by ADR-019/ADR-020. Investigation
   deliberately started from the problem, not the solution — full trail: `docs/03-architecture/
goal_backend_current_assessment.md` (Paso 1), `docs/03-architecture/
goal_backend_alternatives_evaluation.md` (Paso 2/3), `docs/03-architecture/
adr_021_goal_backend_and_domain_history_infrastructure.md` (decision). Key reframe: the real
   problem was never CQRS or Event Store — it was that Goal has no backend at all — and a complete
   `InMemoryEventStore` was found already built and registered in DI, but never once invoked
   anywhere in the codebase, which the investigation explicitly treated as _not_ evidence it was
   needed. **Decision:** build `apps/backend/src/goal/` mirroring Commitment/Task/Habit's existing
   CQRS + versioned-state pattern (state stays the source of truth, no Event Sourcing), plus
   connect the previously-unused Event Store as a durable domain-event log generalizing ADR-014's
   Commitment-only history mechanism, with Goal as its first consumer. Full detail: `TECH_DEBT.md`
   Item 10.
   - **Explicitly deferred, not part of this decision:** migrating Commitment/Task/Habit onto the
     same history infrastructure (only if it later demonstrates real value); reducing per-command
     backend boilerplate (~7 files/command, the one technical pain point actually measured in the
     Assessment) — registered as its own future candidate, "Backend Infrastructure
     Simplification," below.
   - **Fase 1 status (2026-07-17):** implemented and verified per
     `docs/03-architecture/goal_backend_implementation_plan.md`. `apps/backend/src/goal/` now has
     Register/Rename/Complete/Archive commands, a single `GoalView` read model, an in-memory
     versioned repository, `GoalsController`, and `GoalModule` (registered in `app.module.ts`,
     reusing `CommitmentModule`'s exported `DomainEventDispatcher` rather than duplicating it — the
     same DI pattern `task.module.ts` already uses). Verified clean: `tsc --noEmit`, 81/81 backend
     jest tests (7 new), 10 new e2e tests. Remaining: LinkCommitment/LinkHabit (Fase 3), Event Store
     connection (Fase 4), mobile integration (Fase 5), Golden Path + closure (Fase 6) — none started.
     Full detail: `TECH_DEBT.md` Item 10.
9. **Candidate, not yet numbered — Backend Infrastructure Simplification.** Surfaced 2026-07-17
   during the Goal Backend investigation: a single backend command costs ~7 files (command,
   handler, nestjs-handler, result, DTO, 2 tests); Commitment alone has 64 backend files for 7
   commands. This is the only technical pain point the investigation found actually _measured_,
   not hypothetical — and it's orthogonal to whichever persistence strategy is chosen (Event
   Sourcing wouldn't reduce it on its own). Deliberately kept out of ADR-021's scope — optimizing
   shared command infrastructure before building the module that would need it (Goal) was judged
   premature. Not started, not yet scoped.
10. **Candidate, not yet numbered — Historical/Analytics Engine.** Flagged 2026-07-16 during the
    Insights audit: almost everything Insights shows is computed live off _current_ state
    (`currentStreakDays`, `completedAt`, etc.) — there's no persisted daily/event history, which is
    exactly why "últimos 7 días"/"peor día de la semana" for Habits couldn't be built honestly this
    round (see `TECH_DEBT.md` RI-5). A real daily-snapshot or event-sourced history table would
    unlock weekly adherence, best/worst day, monthly trends, heatmaps, and materially better Coach/AI
    insights later — not a VS-032 concern, explicitly deferred to VS-033 or a future architectural
    cycle, not started. **Potentially unlocked by ADR-021's Event Store infrastructure once Goal
    (and possibly other aggregates) start producing durable domain-event history** — not yet
    connected, worth revisiting once ADR-021 ships.

---

## Principles & Rules

- DDD (Domain-Driven Design)
- CQRS (Command Query Responsibility Segregation)
- Event Sourcing Foundations
- Offline First
- Internationalization by Design
- **Architecture Review Framework** (system-prompt.md)
  - Architecture Reviews
  - Product Reviews
  - UX Reviews
  - Localization Reviews
  - Performance Reviews
  - Platform Reviews
  - Quality Reviews
- **Monorepo structure freeze** (Rule #93)

---

## 📜 Change History

- **v1.52.0 (2026-07-17):** **Goal Backend Fase 1 ("Goal Backend mínimo") implemented and
  verified.** Per `docs/03-architecture/goal_backend_implementation_plan.md`:
  `apps/backend/src/goal/` now exists with Register/Rename/Complete/Archive commands, a single
  `GoalView` read model, an in-memory versioned repository, `GoalsController`, and `GoalModule`
  (reuses `CommitmentModule`'s exported `DomainEventDispatcher` via DI import inheritance, mirroring
  `task.module.ts` — no duplicate event dispatcher). Registered in `app.module.ts`. Verified:
  `tsc --noEmit` clean, 81/81 backend jest tests passing (7 new), 10 new e2e tests
  (`test/goals.e2e-spec.ts`) passing, no regressions in Commitment/Task/Habit. Implementation
  guardrail held throughout: no ADR-021 architecture reopened. Remaining scope (LinkCommitment/
  LinkHabit, Event Store connection, mobile integration, Golden Path) not started. Full detail:
  `TECH_DEBT.md` Item 10.
- **v1.51.0 (2026-07-17):** **ADR-021 approved — Goal Backend / CQRS / Event Store decided.**
  Investigation-first process (Assessment → Alternatives → ADR) found the real problem was total
  absence of a Goal backend, not a CQRS/Event Store limitation, and that a complete `EventStore`
  already existed in the codebase but was never invoked anywhere — its existence was explicitly
  not treated as evidence it was needed. Decision: build Goal's backend on the same
  CQRS+versioned-state pattern already proven by Commitment/Task/Habit, and separately connect the
  existing Event Store as a durable domain-event log generalizing ADR-014's Commitment-only
  history mechanism (state stays the source of truth — not Event Sourcing). Migrating other
  aggregates onto shared history, and reducing per-command boilerplate, both explicitly deferred
  as separate future work, not part of this decision. Full detail: `TECH_DEBT.md` Item 10.
- **v1.50.0 (2026-07-17):** **Roadmap sequencing confirmed post-VS-037.** Goal Backend / CQRS /
  Event Store resumes as the next strategic initiative (VS-037 was a cross-cutting audit inserted
  between two roadmap items, not a replacement for either). Consistency Cleanup (T-001/V-001/V-002)
  stays queued and unscheduled — deferred, not urgent, none of the three block or unlock anything —
  with an explicit escalation condition if any starts causing real friction during the Goal Backend
  work.
- **v1.49.0 (2026-07-17):** **VS-037's audit phase formally closed.** Final tally: 1 direct fix
  (T-001), 2 no-action observations + 1 open product question (Modelo Mental), 1 resolved UX break
  (B-001), 2 Design System adoption gaps (V-001, V-002). T-001/V-001/V-002 grouped into a queued
  "Consistency Cleanup" batch, not yet scheduled — sequencing against the next roadmap initiative
  still an open question. Full closing summary and results table in this document's VS-037 entry.
  Full detail: `TECH_DEBT.md` v1.47.0 (Items 38/39 registered).
- **v1.48.0 (2026-07-17):** **VS-037's Terminología and Modelo Mental categories swept; Comportamiento
  in progress.** First implemented finding: B-001 (`TECH_DEBT.md` Item 36) — Goal Workspace's
  "Upcoming" Task cards were fully inert; fixed via a small sub-investigation that converged on a
  reusable rule (summary cards should lead to the entity's own interaction surface) rather than
  copying either of two conflicting precedents outright. One terminology finding confirmed but
  deliberately batched, not yet fixed: T-001 (Item 37, Coach's Commitment-count mislabeled as
  "objetivos"). Two observations closed with no action (M-001, M-002); one open product question
  parked, not a bug (M-003, Coach's Goal-only suggestion logic). Full detail: `TECH_DEBT.md`
  v1.46.0.
- **v1.47.0 (2026-07-17):** **VS-037 — Product Consistency Initiative opened.** With ADR-019 and
  ADR-020 both closed and treated as the architectural baseline, the user directed a return to
  the higher-level roadmap rather than starting backend/structural work immediately — a
  product-wide audit for inconsistencies against that baseline first. Corrected a real numbering
  error before registering it: the user's first proposal was "VS-032," already taken (Design
  System Adoption, closed); the immediate correction, "VS-035," was also already reserved
  (Offline First & Sync), caught only after a full sweep of every `VS-0XX` reference across
  `PROJECT_STATUS.md`/`ENGINEERING_BOARD.md`/`TECH_DEBT.md`/`DECISION_LOG.md`/`RISK_REGISTER.md` —
  highest existing reference was VS-036, so **VS-037** is the genuine next free number. Opening
  question: whether the current product experience has inconsistencies with ADR-019/ADR-020 that
  should resolve before structural backend work (Goal Backend/CQRS/Event Store) begins. Follows the
  same lifecycle validated twice already (ADR-019, ADR-020): Investigation → ADR if needed →
  Implementation → Golden Path → Quality Gate → Close.
- **v1.46.0 (2026-07-17):** **ADR-020 approved — Quick Capture is now Universal Capture.**
  Commitment joins Goal/Habit/Task/Note as a fully supported Quick Capture type, minimal
  capture (title only, enriched later — same pattern the other types already use). Fase 2B closes
  the ADR-019 arc's last open thread: the "Compromisos" tab's "+" button now correctly opens on
  "Compromiso" instead of the stale "Tarea" default, verified live end-to-end (Playwright: create,
  appears immediately, no console errors beyond an already-tracked dev-only warning). Recovered
  from an iCloud sync corruption incident mid-session (8 files, transparently logged) and
  discovered (not caused) 2 unrelated pre-existing backend test failures, now tracked. Full detail:
  `TECH_DEBT.md` v1.45.0, `ENGINEERING_BOARD.md` v1.44.0.
- **v1.45.0 (2026-07-17):** Fase 2B (Quick Capture for Commitments) opened as a fresh product
  workstream — investigation-first, per the validated lifecycle. Current state of Quick Capture
  documented: 4 supported types, all single-field/fire-and-forget, no formalized philosophy behind
  which entities are included. One real bug found and logged (not fixed): the Goals tab renamed
  "Compromisos" in Fase 1 still opens Quick Capture defaulted to "Tarea" (`TECH_DEBT.md` Item 34,
  Blocked by Fase 2B). Full detail: `TECH_DEBT.md` v1.44.0, `ENGINEERING_BOARD.md` v1.43.0.
- **v1.44.0 (2026-07-17):** **Golden Path #1 executed — PASS.** Fase 2A (Commitment creation)
  formally reached Completed. First run surfaced and drove the fix of a real bug (Commitment
  descriptions were silently never saved anywhere); a separate pre-existing "Historial fails to
  load" defect (affects all Commitments, not just new ones) was found and correctly left as its own
  tracked item rather than folded into this fix. ADR-019's full arc (Investigation → ADR →
  Language → Creation → Golden Path → Gate) is now closed end to end with a real pass, not just a
  documented plan. Fase 2B (Quick Capture) is open to start as its own topic. Full detail:
  `TECH_DEBT.md` v1.43.0, `ENGINEERING_BOARD.md` v1.42.0.
- **v1.43.0 (2026-07-17):** Thread closed — VS-032 → Product Polish → "two task lists" finding →
  domain investigation → dataset fix → ADR-019 → Fase 1 (language) → Fase 2A (creation) → Golden
  Path → E2E gate. New governance indicator introduced: `docs/07-quality/golden_path_coverage.md`,
  tracking Golden Path status/execution mode across core flows — currently one entry (Commitment
  Creation, ⏳). No open architecture or implementation decisions remain on this thread; the only
  remaining work is operational (run the Golden Path), after which Fase 2B (Quick Capture) opens as
  its own independent product discussion. Full detail: `TECH_DEBT.md` v1.42.0, `ENGINEERING_BOARD.md`
  v1.41.0.
- **v1.42.0 (2026-07-17):** Fase 2A formally kept open — `Implemented / Pending End-to-End
Verification`, gated explicitly before Fase 2B can start. The verification script is now a
  standing doc, `docs/07-quality/golden_path_commitment_creation.md`, proposed as a future
  permanent regression test. Full detail: `TECH_DEBT.md` v1.41.0, `ENGINEERING_BOARD.md` v1.40.0.
- **v1.41.0 (2026-07-17):** Insisting on a real end-to-end walkthrough before calling Fase 2A done
  (not just typecheck/jest) caught two real Edit-screen bugs — Commitment's Goal link wasn't
  showing correctly and any change to it was silently dropped on save. Both fixed. Item 32 status
  corrected from "resolved" to "implemented, pending E2E" — the actual walkthrough still hasn't run
  (no browser tooling this session); a manual script was handed to the user. Full detail:
  `TECH_DEBT.md` v1.40.0, `ENGINEERING_BOARD.md` v1.39.0.
- **v1.40.0 (2026-07-17):** Commitment can now be created from the app — `TECH_DEBT.md` Item 32
  resolved. Fase 2A connects the previously-orphaned `commitments/create.tsx` from a new "+" button
  on Goal Workspace's Commitments section, mirroring Habits' existing creation pattern exactly.
  Quick Capture support (Fase 2B) stays a separate, deliberately unresolved decision. Full detail:
  `TECH_DEBT.md` v1.39.0, `ENGINEERING_BOARD.md` v1.38.0.
- **v1.39.0 (2026-07-17):** Fase 2 implementation paused for a design evaluation, per user
  direction — "how a user creates a Commitment" evaluated and recommended; "should Quick Capture
  create Commitments" deliberately left open, not resolved. See
  `docs/03-architecture/fase2_creation_flow_evaluation.md`. No code changed. Full detail:
  `TECH_DEBT.md` v1.38.0, `ENGINEERING_BOARD.md` v1.37.0.
- **v1.38.0 (2026-07-17):** ADR-019 Fase 1 (Lenguaje) executed same day as approval. Goals
  screen's Commitment-showing tab renamed "Tareas"→"Compromisos." Goal Workspace's mixed tab
  deferred to Fase 3 (information-architecture question, not naming). Full detail: `TECH_DEBT.md`
  v1.37.0, `ENGINEERING_BOARD.md` v1.36.0.
- **v1.37.0 (2026-07-17):** **ADR-019 approved** — `Commitment` remains a user-visible concept;
  official language table (`Objetivo`/`Compromiso`/`Tarea`/`Hábito`) is now normative across the
  app. 4-phase implementation plan registered: Lenguaje → Creación → Unificación visual → Product
  Polish. `TECH_DEBT.md` Items 31/32 unblocked, ready for Fase 1/Fase 2 respectively. Whether Quick
  Capture should support Commitment creation remains an explicitly open, separate question. Full
  detail: `TECH_DEBT.md` v1.36.0, `ENGINEERING_BOARD.md` v1.35.0.
- **v1.36.0 (2026-07-17):** Wrote `docs/03-architecture/adr_019_commitment_user_model.md`,
  answering whether `Commitment` should stay user-visible and, if so, its official UI-language
  table (`Objetivo`/`Compromiso`/`Tarea`/`Hábito` recommended). Status: Propuesta, pending explicit
  approval — no code changed. `TECH_DEBT.md` Items 31/32 reclassified from ordinary tech debt to
  "Blocked by ADR." Full detail: `TECH_DEBT.md` v1.35.0, `ENGINEERING_BOARD.md` v1.34.0.
- **v1.35.0 (2026-07-17):** Following the demo-data rewrite, ran a real walkthrough (create a Goal,
  read the re-seeded Commitments, try to create a new one) to test whether the "Tareas" naming
  confusion was really a data problem or a language problem — confirmed language, as predicted.
  Trying to complete the walkthrough's own "create a Commitment" step surfaced a more severe,
  separate finding: **Commitment has no creation path anywhere in the app UI**, despite a fully-
  built `commitments/create.tsx` screen ("Crear Compromiso") existing in the codebase, completely
  orphaned from navigation. That screen's existing "Compromiso" terminology is real evidence a
  version of the naming decision was already underway once. Logged as `TECH_DEBT.md` Item 32 (High
  priority, deliberately not fixed — connecting it now would decide the still-open naming question
  by default). Full detail: `TECH_DEBT.md` v1.34.0, `ENGINEERING_BOARD.md` v1.33.0.
- **v1.34.0 (2026-07-17):** Investigation into two differently-shaped "Tareas" cards surfaced a
  product-language collision, not just UI duplication — Goals' Commitment-tab, the standalone Tasks
  screen, and Goal Workspace's own tab all label themselves "Tareas" for two different domain
  objects (`Commitment` and `Task`). The domain model itself is well-designed (`Goal.ts`'s own
  comment states `Goal -> Commitment -> Task/Habit`); the actual root cause was the demo dataset
  teaching the wrong model (Commitment titles read Goal-sized, Task titles were shared generic
  filler). Rewrote all 17 Commitment titles and gave every Commitment bespoke Task titles, with
  every numeric field untouched — verified across 5 screens via Playwright. The naming decision and
  visual-duplication cleanup are explicitly deferred, logged as `TECH_DEBT.md` Item 31. Full detail:
  `TECH_DEBT.md` v1.33.0 (RI-13), `ENGINEERING_BOARD.md` v1.32.0, `docs/03-architecture/
DEMO_DATASET.md`.
- **v1.33.0 (2026-07-16):** `TECH_DEBT.md` Item 30 (Tamagui animations producing no visible CSS
  transition) resolved same day it was opened, via a short targeted investigation per user
  direction. Root cause: the installed Tamagui version's activating prop is `transition`, not
  `animation` (a version-specific rename this codebase's existing convention never caught up to),
  compounded by a closure-binding gotcha in how `createAnimations()`'s driver gets extended with
  custom presets. Both fixed. **Motion infrastructure is now fully working, verified end-to-end**
  via real Playwright presses on real components showing genuine interpolation, not just a code
  read. Full RCA: `TECH_DEBT.md` v1.32.0 (RI-12), `ENGINEERING_BOARD.md` v1.31.0.
- **v1.32.0 (2026-07-16):** Product Polish's first infrastructure work — Motion centralized in the
  Theme Engine (`ThemeMotion` real values across all 4 themes) and `packages/design-system`'s
  Tamagui animation config, per user direction to build infrastructure before resuming screen
  audits. Found and fixed a real dead-code bug (`useInteractionAnimation`'s `animation` field was
  computed but never applied on any of its 5 consumers). Discovered, logged, not resolved: Tamagui's
  `animation` prop produces no visible CSS transition anywhere in the app's web build even when
  fully wired — a deeper pre-existing gap (`TECH_DEBT.md` Item 30). Full detail: `TECH_DEBT.md`
  v1.31.0 (RI-11), `ENGINEERING_BOARD.md` v1.30.0, `PRODUCT_POLISH_GUIDE.md` v1.4.0.
- **v1.31.0 (2026-07-16):** VS-032 closing evaluation delivered by the user (Principal Architect
  role) — Arquitectura A, Calidad del proceso A+, UX A-. Full detail and Product Readiness table:
  `ENGINEERING_BOARD.md` v1.25.0 "VS-032 — Final Evaluation". Redefined the next milestone
  accordingly: **Milestone: Product Polish**, not `VS-033` — three explicit freezes (domain,
  Design System, navigation) and a measurement axis that's no longer bugs-closed/components-
  migrated but whether the product _feels exceptional_ (premium perception, microinteractions,
  animation, copy, onboarding, delight, perceived performance). Roadmap entry above updated to
  match.
- **v1.30.0 (2026-07-16):** VS-032 — Appearance closed; **VS-032 formally declared `Closed`**
  (all 9 screens done). Scoped tightly per explicit user direction — no new capabilities, only
  verification + bug fixes: 4 themes, persistence, accessibility, contrast, Preview, Demo Mode,
  Theme Engine consistency.

  ```text
  VS-032 — Appearance

  Estado: ✅ Completed (2026-07-16) — last screen of VS-032

  Verificación funcional: los 4 temas (Claro/Amanecer/Medianoche/Bosque)
  seleccionan correctamente, persisten a través de navegación in-app Y de un
  reload completo (SecureStore), y son independientes de Demo Mode (ajuste de
  dispositivo, no de datos — correcto arquitectónicamente, no pasa por el seam
  demo/real). Preview con crossfade (ViewShot + Reanimated) funciona sin
  errores. Reducir Movimiento se verificó en código: salta por completo la
  captura/crossfade en vez de solo acortar su duración.

  Auditoría de accesibilidad: encontrado y corregido un bug real — el picker
  de temas (ThemePreviewCard.tsx) fijaba accessibilityState={selected} como
  prop cruda de React Native en vez de pasar por
  toPlatformAccessibilityProps (el helper que usa el resto de la app),
  y react-native-web nunca traduce accessibilityState a aria-* por su cuenta.
  Confirmado vía inspección de DOM en Playwright: aria-selected nunca se
  emitía para ninguna de las 4 tarjetas, antes o después de seleccionar.
  Corregido; reverificado que aria-selected ahora refleja correctamente cuál
  tema está activo. Orden de Tab por teclado confirmado intacto (RI-7).

  Auditoría de contraste: verificados independientemente (fórmula WCAG de
  luminancia relativa) los pares contentPrimary/contentSecondary contra
  background/surface de los 4 temas — todos pasan AA texto normal (4.5:1),
  con el caso más ajustado en Bosque (contentSecondary/background, 4.48:1,
  esencialmente en el umbral). Los pares contentOnAccent/contentOnSemantic ya
  estaban documentados y verificados en el propio código fuente del
  theme-engine.

  Encontrado, NO corregido (decisión de alcance, no bug bloqueante): "Alto
  contraste" no tiene ningún efecto visual real en ningún lugar de la app —
  ThemeResolver.resolve() recibe el flag pero nunca ajusta colores (comentario
  propio: "podríamos... aquí" — nunca implementado), y ningún consumidor
  posterior lee isHighContrast. Confirmado por código Y empíricamente
  (Playwright: estilos computados idénticos byte-a-byte antes/después del
  toggle). No es una violación de WCAG AA (los 4 temas ya pasan AA sin este
  ajuste) ni una regresión — es una promesa de UI que nunca se implementó.
  Registrado como TECH_DEBT.md Item 28, con dos resoluciones honestas
  propuestas (implementar de verdad, o quitar el control) para decidir en
  Product Polish.

  Migración a Design System: AppearanceSettingsScreen migrada de ScrollView
  crudo + Text/Switch de Tamagui a AppScreen + Body/SectionHeader/Switch/
  LoadingState de @commitment/design-system (mismo patrón ya usado en las
  8 pantallas previas). LanguageSettingsScreen ya estaba correctamente
  adoptada — solo se le agregó el mismo LoadingState que faltaba (ambas
  pantallas hacían "if (!settings) return null" sin estado de carga).

  Verificación: tsc limpio (mobile), Playwright con clicks reales (no force,
  no page.goto() intermedio salvo para probar el reload completo a propósito).
  ```

  Maturity: Appearance 90% (new row). **VS-032 formally `Closed`.** New
  **Product Polish Sprint** opened as the active milestone (not yet numbered
  — see roadmap below), lifting the UI Freeze once it actually starts. Full
  detail: `TECH_DEBT.md` v1.29.0 (RI-7, Item 28), `ENGINEERING_BOARD.md`
  v1.24.0.

- **v1.29.0 (2026-07-16):** VS-032 — Profile closed. Functional audit found the identity/plan card
  showed the hardcoded demo user ("Jordan Rivera") **even with Demo Mode off** — the only screen in
  the app not routing through the demo/real API-layer seam every other feature uses. Fixed with a
  new `features/profile/api/profile.api.ts` + `useProfile()` hook: Demo Mode on shows the full demo
  identity as before; off shows an honest minimal profile (no fabricated name/email/plan, avatar
  initials from the real identityId) — there's no real Identity/Profile backend to fetch from yet
  (new `TECH_DEBT.md` Item 27, parallel to Goal's TD-10/A1). Also migrated raw Tamagui
  `Text`/`Button`/`Switch` to `@commitment/design-system` equivalents. Verified via Playwright in
  both Demo Mode states and Midnight theme. Full detail: `TECH_DEBT.md` v1.28.0 (RI-6, Item 27).
  Profile added to the UI Freeze list. **Appearance is the last VS-032 Design System Adoption item
  before Product Polish.**
- **v1.28.0 (2026-07-16):** Registered a roadmap candidate (not yet numbered): a Historical/Analytics
  Engine (persisted daily snapshots or event history), flagged by the user as the likely next real
  architectural pillar after VS-032 — almost everything Insights shows today is computed off current
  state, which is exactly why an honest weekly/best-worst-day habit metric couldn't be built this
  round. Explicitly not started, candidate for VS-033 or a later cycle. VS-032 roadmap note updated:
  Insights ✅, Profile next.
- **v1.27.0 (2026-07-16):** Insights' 2 UX findings resolved by explicit user decision. Finding 1
  (stat-card affordance) deferred to Product Polish — 3 valid options logged, none picked yet
  (`TECH_DEBT.md` Item 26). Finding 2 ("Hábitos de Hoy" duplicating Today) fixed now, because it
  "afecta la identidad del producto": replaced with **Racha promedio** + **Con racha activa** across
  all enabled habits — real consistency-over-time metrics, not a today-snapshot, and honestly
  computable from the existing domain model (no fabricated per-day history). Insights maturity
  92%→94%. **Declared a UI Freeze** on Today/Coach/Calendar/Goals/Habits/Tasks/Insights — the 7
  audited screens change only for bugs/accessibility/performance/explicit Product Polish decisions
  from here on, so Profile/Appearance work doesn't drift their style and require re-propagating it
  later. Full detail: `TECH_DEBT.md` v1.27.0 RI-5, `ENGINEERING_BOARD.md` v1.22.0.
- **v1.26.0 (2026-07-16):** VS-032 — Insights closed as a **product audit**, not a component-swap
  pass, per explicit user direction (using the Tasks incident as the template from the start, not
  after a false start this time):

  ```text
  VS-032 — Insights

  Estado: ✅ Completed (2026-07-16, product audit standard)

  Auditoría funcional: métricas cambian con datos reales (verificado completando
  una tarea in-app: "Tareas completadas" 7→8), productividad/deltas correctos
  (15 tests unitarios dedicados), sin tarjetas duplicadas o sin propósito.

  Auditoría de dominio: ninguna estadística asume que todo pertenece a un Goal —
  las 4 stat cards y Habit Consistency/Streak Highlight operan sobre TODAS las
  Tasks/Habits (independientes, ligadas a Goal, ligadas a Commitment), no filtran
  por goalId. Solo Goal Progress es (correctamente) goal-scoped por diseño.

  Auditoría de Design System: StatCard local duplicado eliminado (el StatCard de
  @commitment/design-system ya estaba construido para este caso exacto, nunca se
  usó); LoadingState/ErrorState/EmptyState migrados desde shared/ui/feedback
  (cierra más de TECH_DEBT Item 13); encontrado y corregido un bug de arquitectura
  más profundo: AppScreen no tenía background propio, causando un hueco claro bajo
  el contenido en pantallas cortas con cualquier tema no-default — corregido en el
  primitivo compartido, no por pantalla (afecta a las 12 pantallas que usan
  AppScreen, no solo Insights).

  Auditoría de accesibilidad: agregados accessibilityLabel a los círculos de racha
  semanal y las barras del gráfico de enfoque (antes ilegibles para lector de
  pantalla). Encontrado (no corregido, alcance mayor): los headers de navegación
  nativos ignoran el tema Experience activo (Midnight/Forest/Sunrise), siguen el
  esquema claro/oscuro del sistema — confirmado sistémico (afecta también Goal
  Workspace), registrado como Item 24.

  Auditoría de UX: 2 hallazgos reales, presentados para decisión de producto (no
  corregidos unilateralmente) — (1) solo 1 de 4 stat cards es interactiva sin
  ninguna señal visual que las distinga; (2) "Hábitos de Hoy" en Insights duplica
  el widget ya existente en Today, sin encajar en el enfoque semanal del resto
  de la pantalla.

  Verificación: tsc limpio (mobile + design-system), 225/225 tests design-system
  (2 snapshots actualizados, diff confirmado mínimo), 78/93 tests mobile (15
  fallos pre-existentes documentados, sin relación). Playwright con clicks reales
  y navegación in-app, ambos temas (Sunrise/Midnight) verificados visualmente.
  ```

  Full detail: `TECH_DEBT.md` v1.26.0 (Items 24/25, RI-3/RI-4).

- **v1.25.0 (2026-07-16):** Correction to v1.24.0. That entry marked Tasks `✅` on the strength of
  domain/CQRS/persistence verification — it had never undergone a real functional audit (actual
  clicks on the actual controls), and the user correctly refused to accept it as closed on that
  basis. The audit found two blockers, both fixed same-day, both re-verified:

  ```text
  VS-032 — Tasks

  Estado: ✅ Completed (2026-07-16, after functional audit + fixes)

  Bloqueantes encontrados durante la auditoría funcional:
  • FAB principal ("Nueva tarea") visualmente presente pero no clickeable — bug de
    stacking context en web (el FloatingTabBar ganaba el hit-test sobre el FAB).
  • demoTasksRepository mutaba el array en el sitio — refetch() no disparaba
    re-render sin un cambio de estado no relacionado (cambiar de pestaña).

  Causa raíz 1: zIndex del FAB atrapado dentro de stacking contexts propios del
  ScrollView, nunca compite al nivel del tab bar (sibling posterior sin z-index).
  Solución 1: FAB movido a <Portal>, re-envuelto en <Theme name={themeId}> (Portal
  vive fuera del Theme de AppearanceProvider — Item 20).

  Causa raíz 2: mutación in-place (unshift/asignación directa de propiedades) —
  list() devolvía siempre la misma referencia; React Query/useMemo comparan por
  referencia, nunca detectaban el cambio.
  Solución 2: demoTasks pasó de const a let + replaceDemoTasks(); cada método
  mutante ahora construye un array nuevo (mismo patrón que demoHabitsRepository
  ya usaba correctamente).

  Verificación: 12 tests Jest nuevos (referencia nueva en cada mutación) + Playwright
  con clicks reales (no force, no page.goto() intermedio) confirmando: FAB clickeable,
  creación/edición/completado reflejados de inmediato sin cambiar de pestaña, y una
  tarea real recién creada ganando el Hero de Today por score.

  Regla nueva: ENGINEERING_BOARD.md v1.19.0 — ninguna capacidad puede reportar
  "Ready for Production: Sí" solo con typecheck + tests + Playwright; se requiere
  auditoría funcional del flujo principal antes de cerrar el checkpoint.
  ```

  Maturity adjusted 92%→95% (verified, not just implemented). Full detail:
  `TECH_DEBT.md` "Resolved Issues — Lessons Learned" (v1.24.0), `ENGINEERING_BOARD.md` v1.19.0.

- **v1.24.0 (2026-07-15):** VS-032 Fase 2 closed — Tasks marked ✅ (92%, new row). The design doc's
  premise correction stands (no parallel "Priority Task" entity existed), but the user's Fase-2
  feedback expanded scope beyond the original v1.0.0 proposal: mutual-exclusivity invariant between
  Task.goalId/commitmentId, score-based Priority-of-the-day (not a fixed origin hierarchy), consistent
  Hero Card structure, a single unified "Relacionado con" selector in `TaskForm` (also closing a
  found-live edit-mode gap), and a real demo-verified case of a non-Commitment task winning the Hero.
  See `TECH_DEBT.md` Item 22 (resolution detail) and Item 23 (new Medium finding, deferred).
- **v1.23.0 (2026-07-15):** Habits Item 18 fully closed (Goal linkage now genuinely optional
  end-to-end), maturity 92%→97%. Phase 2 (Tasks) is now a design-proposal step — Task/Goal
  optionality plus consolidating Today's "Priority Task" into one Task concept — pending user
  approval before implementation starts. See `ENGINEERING_BOARD.md` v1.17.0.
- **v1.22.0 (2026-07-15):** P1/Critical global scroll regression — root-caused (missing
  `GestureHandlerRootView`, exposed by Postpone's new `BottomSheet`) and fixed at the app root.
  See `ENGINEERING_BOARD.md` v1.16.0 and `TECH_DEBT.md` Item 21.
- **v1.21.0 (2026-07-15):** Postpone rebuilt around a new Design System primitive
  (`DurationWheelPicker`, iOS Timer-style) — first new Design System component added since
  Stabilization closed, explicitly authorized by the user for this piece. See
  `ENGINEERING_BOARD.md` v1.15.0 and `TECH_DEBT.md` v1.20.0.
- **v1.20.0 (2026-07-15):** Habits UX redesign iteration 2 — radical list simplification per user
  review of iteration 1, secondary actions (Postpone/Archive/Goal) moved to the habit detail. See
  `ENGINEERING_BOARD.md` v1.14.0 and `TECH_DEBT.md` v1.19.0.
- **v1.19.0 (2026-07-15):** Habits UX redesign layered on top of the capability pass below —
  Apple Health/Fitness/Timers-inspired visual/motion quality pass, requested before starting Tasks.
  Maturity held at 92% (redesign is quality, not new coverage; Item 18 still the only real gap).
  See `ENGINEERING_BOARD.md` v1.13.0 and `TECH_DEBT.md` v1.18.0.
- **v1.18.0 (2026-07-15):** Habits marked ✅, maturity raised 80%→92% (remaining gap: Item 18,
  Habit↔Goal linkage has no UI path — High, tracked, not blocking). First capability-level pass
  (whole lifecycle + integration surface, not just the primary screen) — 3 real bugs found and
  fixed live. Tasks is next. See `ENGINEERING_BOARD.md` v1.12.0 and `TECH_DEBT.md` v1.16.0.
- **v1.17.0 (2026-07-15):** Goals marked ✅ in VS-032's Design System Adoption block, Goals maturity
  raised 75%→90% (remaining gap: A1/TD-10, Goal aggregate has no backend module — tracked, not
  blocking). Habits is next. See `ENGINEERING_BOARD.md` v1.10.0 for governance evidence pointers.
- **v1.16.0 (2026-07-15):** Restructured the VS-032 roadmap entry into the three blocks (Foundation
  / Design System Adoption / Product Polish) specified by explicit user direction, matching
  `ENGINEERING_BOARD.md` v1.8.0's new "Working Agreement for Design System Adoption" — platform
  stabilization is now treated as done and isn't re-audited per screen; only regressions, data loss,
  cross-feature architectural violations, WCAG AA failures, or Critical debt pause the adoption work
  going forward.
- **v1.15.0 (2026-07-15):** Closed the TD-015 keyboard-accessibility mini-phase (verified fixed —
  see `TECH_DEBT.md` Item 15) and, per explicit user direction, resumed Design System Adoption at
  Goals rather than treating it as still gated by the full Stabilization & Product Audit. Verified
  against code (not restated from memory) that the audit's Critical finding (P1/TD-8) and one High
  finding (P3/TD-9) are also already fixed, undocumented until now; 4 High findings remain open,
  tracked as debt, explicitly not blocking. See `architecture_product_audit_2026Q3.md` v1.1.0 and
  `TECH_DEBT.md` v1.14.0. Replaced the stale single-screen "VS-032 — Calendar" roadmap entry with
  what actually happened: VS-032 in progress as a screen-by-screen Design System Adoption sprint.
- **v1.14.0 (2026-07-15):** Entered a Stabilization & Product Audit phase per explicit direction —
  paused new feature work and new high-level docs (Product Capability Map, Bounded Context Map,
  Dependency Roadmap) until the audit's findings are resolved or triaged. See
  `architecture_product_audit_2026Q3.md`. Corrected the stale "none of this is committed" note now
  that VS-031 is committed (`1a3f598`/`7853f22`/`7cdf6cf`).
- **v1.13.0 (2026-07-14):** VS-031's working tree committed (`1a3f598`, `7853f22`) — supersedes
  v1.12.0's "uncommitted" note. Discovered `ARCHITECTURE.md`, `TECH_DEBT.md`, `RISK_REGISTER.md`
  already existed and were never read before this point — produced a discrepancy report (see
  `TECH_DEBT.md` Item 3, `RISK_REGISTER.md` Risk 1/3) rather than silently reconciling. Most
  notable finding: 26 Feature files violate the documented i18n Rule 2 (no direct `t()` calls in
  Features) — this contradicts the "Internationalization by Design" principle listed below and is
  now tracked as technical debt, not fixed.
- **v1.12.0 (2026-07-14):** VS-031 moved from `Active` to `Completed` (verified per
  `engineering/governance/vs031_completion_report.md` v2.0.0 — 399 tests passing, 12-screen
  Playwright walkthrough, 0 crashes) — not `Closed`; 218 files of working-tree changes remain
  uncommitted. Flagged (not fixed): `walkthrough.md` is severely stale (describes mobile as
  Flutter, only covers Sprint 0/1), predates this update, and needs a dedicated pass.
- **v1.11.0 (2026-07-12):** Reconciled against actual commit history (see
  `engineering/governance/roadmap_reconciliation_2026Q3.md`). Active Sprint moved from VS-025 to
  VS-031 (Product Experience Foundation, reassigned from Search/Filters per ADR-015). Marked
  VS-025–VS-028 and VS-030 Completed (self-labeled), left VS-029 Planned, updated Próximos slices,
  and flagged the progress/maturity table as unaudited since 2026-07-08.
- **v1.10.0 (2026-07-08):** Aligned next slices with VS-026 (Theme Engine Foundation) and VS-027 (Experience Themes), updated observations, and locked monorepo structure.
- **v1.9.0 (2026-07-08):** Restructured reviews into the 7 standardized categories, synchronized the 15-area general status table, global progress, value evaluation, and reordered dashboard roadmap priorities.
- **v1.8.0 (2026-07-08):** Integrated Rules #99-103 (Technical Debt, Performance, API Contract, Design Consistency, Feature Independence Reviews), updated roadmap sprint lists VS-025 to VS-030, and aligned status progress table.
- **v1.7.0 (2026-07-08):** Comprehensive progress maturity metric table added, risk analysis, remaining work distribution updated, and value evaluation template hooks registered.
- **v1.6.0 (2026-07-08):** Set VS-025 to Active Sprint with Tracks A-E, replaced progress metrics with combined Progress & Maturity State table, and added Rule #97 and #98.
- **v1.5.0 (2026-07-08):** Marked VS-024 (Activity History) complete. Updated overall progress percentages, added Theme System track, and set active sprint to VS-025 Dashboard v2.
- **v1.4.0 (2026-07-07):** Marked VS-006 as complete (Cancel capability delivered). Lifecycle Management capabilities fully implemented.
- **v1.3.0 (2026-07-07):** Marked VS-005 as complete (Complete capability delivered). Advancing to VS-006 (Cancel).
- **v1.2.0 (2026-07-05):** Marked VS-003 and VS-004 as complete (Pause and Resume capabilities delivered). Advancing to VS-005.
- **v1.1.0 (2026-07-04):** Updated to reflect transition to the Vertical Slice Phase and VS-001 sprint.
- **v1.0.0 (2026-07-04):** Integrated as the official project status baseline at the root level.
