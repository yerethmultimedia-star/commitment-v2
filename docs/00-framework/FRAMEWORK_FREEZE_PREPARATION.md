# Framework Freeze Preparation Report

**Date:** 2026-07-19
**Nature of this document:** pure inventory and traceability. Nothing in the repository was edited to produce this report — it is the input to a future Framework Freeze Review, not the review itself. Findings here are candidates for that review, not final rulings.

---

## 1. Documents analyzed

**Read in full:**

- `docs/00-framework/THE_COMMITMENT_FRAMEWORK.md`, `docs/00-framework/REVIEW_STATUS.md`
- ADRs: `docs/01-product/adr/adr_001_to_010.md` (covers ADR-001–010), and individually `adr_011`, `adr_013`, `adr_014`, `adr_015`, `adr_016`, `adr_017`, `adr_018`, `adr_019`, `adr_020`, `adr_021`, `adr_022`, `adr_023` in `docs/03-architecture/` — 23 ADRs total (ADR-012 does not appear to exist as a file; not investigated further, out of scope for this pass).
- Domain vocabulary docs: `docs/02-domain/CONCEPTS.md`, `UBIQUITOUS_LANGUAGE.md`, `canonical_dictionary.md`, `bounded_contexts.md`, `domain_state_machines.md`.
- Product docs: `docs/01-product/PRODUCT_VISION.md`, `PRODUCT_BACKLOG.md`, `PRODUCT_HEALTH.md`, `capabilities/CAP-002-activate-commitment.md`, `capabilities/CAP-003-pause-commitment.md`.

**Grep-checked only (specific terms, not read end-to-end):** `DEMO_DATASET.md`, `habit_commitment_relationship_review.md`, `adr_014` (streak/gamification terms) — see §4.3.

**Not opened this pass (scoped out, with reason):**

- The seven "prior foundational documents" (`commitment_constitution.md` + 2 variants, `commitment_behavioral_principles.md`, `commitment_navigation_philosophy.md`, `commitment_experience_principles.md`, `north_star.md`) — already fully accounted for by the Framework's own Appendix. Re-deriving that analysis would duplicate work already done. **Caveat:** see §6 — three domain docs with the same vintage and vocabulary were _not_ in the Appendix's list and are flagged below.
- Architecture assessment/evaluation docs (`design_system_evolution.md`, `draft_lifecycle_ux_assessment.md`, `fase2_creation_flow_evaluation.md`, `goal_backend_*` x3, `goal_view_alignment_assessment.md`, `milestone_domain_assessment.md`, `reminder_engine_extension.md`, `task_domain_review.md`, `task_frontend_migration_checklist.md`) — these are working notes that fed into the ADRs already read in full; the ADRs are the decision of record.
- Pure technical/schema docs (`read_models.md`, `persistent_domain_model.md`, `offline_sync_engine.md`, `event_store_model.md`, `postgresql_physical_model.md`, `command_catalog.md`, `event_catalog.md`) — implementation detail below the altitude the Framework governs; low expected yield for a philosophy-alignment pass.
- CAP technical-design/implementation-plan variants — implementation detail, not product/philosophy decisions.

---

## 2. Traceability matrix

| Framework element                                               | Relevant ADR(s)                                                                                                                      | Relevant PRD(s)/product doc(s)                                            | Status                                                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Ch. 0 — Why this document exists                                | —                                                                                                                                    | —                                                                         | — (meta, no ADR/PRD expected)                                                                                              |
| Ch. 1 — What Commitment is / "Who do I want to become?"         | —                                                                                                                                    | PRODUCT_VISION.md (Mission, Vision, Core Principles)                      | ✅ aligned                                                                                                                 |
| Ch. 2 — The Transformation Model (8 stages)                     | ADR-019 (Goal→Commitment→Task hierarchy), ADR-022 (Planning vs. Execution Aggregates)                                                | PRODUCT_BACKLOG.md (Register/Activate/Pause/Resume/Complete/Cancel epics) | ✅ aligned — the 8-stage model maps cleanly onto the shipped Draft→Active→...→Archived lifecycles                          |
| Ch. 2.7 — Adaptation                                            | —                                                                                                                                    | —                                                                         | — no coverage found (see §5)                                                                                               |
| Ch. 3 — The Blueprint (design ≠ decision)                       | ADR-022 (Draft requires explicit activation for Planning Aggregates)                                                                 | —                                                                         | ✅ aligned                                                                                                                 |
| Ch. 4 — User Language vs. Domain Language (membrane)            | **ADR-019, ADR-020**                                                                                                                 | —                                                                         | ❌ contradicts (see §4.1)                                                                                                  |
| Ch. 5 — The Role of AI (architect, not product)                 | ADR-007 (AI-agnostic contract), domain_state_machines.md §"AI Commands" (AI never emits a domain command directly)                   | PRODUCT_VISION.md ("AI assists but never decides")                        | ✅ aligned                                                                                                                 |
| Ch. 6 — Explainability                                          | —                                                                                                                                    | —                                                                         | — no coverage found (see §5)                                                                                               |
| Law 0 — Technology is never the product                         | ADR-007, ADR-011 (preferred, not irrevocable, tech)                                                                                  | —                                                                         | ✅ aligned                                                                                                                 |
| Law 1 — Aspiration → system before actions                      | ADR-019, ADR-022                                                                                                                     | —                                                                         | ✅ aligned                                                                                                                 |
| Law 2 — Four distinct roles                                     | ADR-022 (Command Preconditions: agreggate still decides)                                                                             | —                                                                         | ✅ aligned                                                                                                                 |
| Law 3 — Plan is not the objective                               | —                                                                                                                                    | **PRODUCT_VISION.md (North Star Metric)**                                 | ❌ contradicts (see §4.2)                                                                                                  |
| Law 4 — AI amplifies, never replaces                            | domain_state_machines.md §"AI Commands"                                                                                              | PRODUCT_VISION.md                                                         | ✅ aligned                                                                                                                 |
| Law 5 — Explainable via observable evidence                     | —                                                                                                                                    | —                                                                         | — no coverage found (see §5)                                                                                               |
| Law 6 — Systems evolve                                          | ADR-022 (Task lifecycle, Reopen) — partial                                                                                           | —                                                                         | ⚠️ needs review — Task-level evolution exists; no ADR for Commitment/Goal-level "adapt the plan" flow                      |
| Law 7 — Clarity precedes action                                 | ADR-019 (explicit scope boundaries per ADR)                                                                                          | —                                                                         | ✅ aligned (process-level)                                                                                                 |
| Ch. 7 (as a whole) — Laws 8-10 removed/deferred                 | —                                                                                                                                    | —                                                                         | ✅ consistent — no ADR claims these as active principles                                                                   |
| Ch. 8 — Capability test (5 questions)                           | ADR-020 ("burden of proof is on exclusion, not inclusion" — same spirit)                                                             | —                                                                         | ✅ aligned                                                                                                                 |
| Ch. 9 — Success Metrics (rejects streaks/completion as primary) | **ADR-006 (no gamification), ADR-010 (no streaks) support it; ADR-014 (StreakWidget) and shipped Habit streak field cut against it** | **PRODUCT_VISION.md (Success Metrics / North Star) contradicts it**       | ❌ contradicts (see §4.2) + ⚠️ internal tension (see §4.3)                                                                 |
| Ch. 10 — How this document governs                              | ADR-011, ADR-016 (both establish "any change needs its own ADR/governance record" — same philosophy applied to architecture)         | —                                                                         | ✅ aligned (analogous pattern, different domain)                                                                           |
| Axiom — "User owns intention, system owns representation"       | ADR-019, ADR-020                                                                                                                     | —                                                                         | ❌ contradicts — same finding as Ch. 4                                                                                     |
| Axiom — "AI proposes; it does not enact"                        | domain_state_machines.md §"AI Commands" ("La IA nunca emite un Comando de Dominio de forma directa")                                 | PRODUCT_VISION.md                                                         | ✅ aligned — notably, this exact invariant survived from the _old_, otherwise-superseded FSM doc into current architecture |
| Axiom — "Blueprint is independent of its implementation"        | ADR-022 (Draft/Active split for Planning Aggregates)                                                                                 | —                                                                         | ✅ aligned                                                                                                                 |

---

## 3. Confirmed alignments

- **Law 0 / Chapter 5 ("technology and AI are never the product") ↔ ADR-007 and ADR-011.** ADR-007 designs the AI integration as a swappable, agnostic contract specifically so no single model vendor becomes load-bearing. ADR-011 generalizes the same instinct to the whole stack ("Tecnologías Preferidas," not irrevocable). Both predate the Framework but already embody its Law 0.
- **The Axiom "AI proposes; it does not enact" ↔ `domain_state_machines.md`'s "AI Commands" section.** Verbatim-equivalent rule already encoded: _"La IA nunca emite un Comando de Dominio de forma directa... Solo si el usuario toca 'Aceptar propuesta', se emite el Comando Humano correspondiente."_ This is notable because this document is otherwise one of the stale, pre-Framework domain docs (see §6) — this specific invariant is the one part of it that already matches the new Framework precisely, and is also restated independently in `PRODUCT_VISION.md` ("AI assists but never decides").
- **Chapter 2 / Chapter 3 (Blueprint precedes Commitment, Planning vs. Execution split) ↔ ADR-022.** ADR-022's "Planning Aggregates vs. Execution Aggregates" distinction (Goal/Commitment require Draft→explicit-activation; Task/Habit don't) is architecturally exactly what Chapters 2–3 argue for philosophically. This is a case of architecture and philosophy converging independently — worth naming as a strength, not just a checkbox.
- **Chapter 8's "burden of proof is on exclusion" ↔ ADR-020's identical framing** for Quick Capture eligibility. Different domain, same reasoning shape.

---

## 4. Framework violations

### 4.1 — ADR-019 / ADR-020 vs. Chapter 4 (the membrane) and its Axiom — **highest-confidence violation**

Chapter 4 states the test directly: _"If a person ever has to learn what a 'Goal' is, as distinct from a 'Commitment,' in order to use the product — the membrane has failed at that point, regardless of how correct the underlying model is."_

ADR-019 (2026-07-17) decides the opposite, explicitly and normatively:

> _"`Commitment` se convierte formalmente en un concepto de cara al usuario, no solo de dominio."_
> _"'Compromiso' queda reservado exclusivamente para representar a `Commitment`. 'Tarea' queda reservado exclusivamente para representar a `Task`. Ninguna superficie de UI puede volver a usar 'Tarea'/'Tareas' para representar un `Commitment`, bajo ninguna circunstancia."_

This is precisely the scenario Chapter 4 calls a membrane failure: the user is now required to know that "Compromiso" and "Tarea" name two different domain concepts in order to use the product correctly. ADR-020 (Quick Capture) then builds on ADR-019, adding `Commitment`/"Compromiso" as a user-facing capture type — extending the same exposure rather than containing it.

This is not a hypothetical tension — ADR-019's own "Próximos pasos" section has a phased rollout (Fase 1–4) that had not finished executing as of the ADR's writing. The longer that rollout proceeds under the old philosophy, the more expensive it becomes to reconcile with Chapter 4 later. See §7, priority 1.

### 4.2 — PRODUCT_VISION.md vs. Chapter 9 and Law 3 — **highest-confidence violation**

Chapter 9: _"Commitment explicitly rejects treating completed tasks, unbroken streaks, or habit-tracking consistency as the primary measure of its own success... A single number cannot capture this well, and the temptation to substitute one that can — a streak, a completion rate, a score — should be treated as exactly that: a temptation, not a solution."_

`PRODUCT_VISION.md`'s **North Star Metric** is:

> _"Percentage of active commitments successfully completed."_

— a single completion-rate number, used as the primary success measure, which is exactly the pattern Chapter 9 names and rejects by name. The same document's "Success Metrics" section (adoption rate, 30-day retention, average active commitments, NPS) is activity/engagement measurement, not transformation measurement, which Law 3 ("the plan is never the objective; transformation is") and Chapter 9 both argue against as a primary measure.

`PRODUCT_VISION.md` predates the Framework and was not revisited during the editorial review (it's a PRD, out of the Framework's own document, so correctly untouched by that review). It is, however, a currently-active document with no superseded notice.

### 4.3 — Internal architecture contradiction touching Chapter 9 (lower confidence, flagged for awareness, not a clean textual violation)

ADR-006 ("Exclusión de Gamificación") and ADR-010 ("Eliminación de Rachas") explicitly reject streaks as a product concept, replacing them with a "Resilience Index." Both predate the Framework but already match its spirit. However:

- ADR-014 (Activity History & Experience Themes) lists a `StreakWidget` as one of the default Dashboard widgets: `[TodayWidget, WeeklyProgressWidget, QuickActionsWidget, StreakWidget, CalendarWidget]`.
- `habit_commitment_relationship_review.md` describes Insights computing values "from Habit's own streak/completion state" — i.e., the shipped `Habit` aggregate maintains a streak concept directly.

Chapter 9 doesn't forbid ever displaying streak-like information to a user (it forbids treating it as the _primary success measure_), so this isn't a clean-cut Framework violation the way §4.1–4.2 are. But it is a direct contradiction between two of the project's own architecture decisions (ADR-010 says no streaks; ADR-014 + shipped Habit code have one), in territory Chapter 9 cares about. Worth a conscious product decision rather than leaving it as an accidental drift. See §7, priority 4.

---

## 5. Missing architectural decisions (Framework has no implementing ADR)

- **Chapter 2.7 / Law 6 — Adaptation.** No current ADR (011–023) defines how the system actually proposes or executes a revised plan when Observation shows the existing one no longer fits, at the Commitment/Goal level. (Task has `Reopen`/state transitions per ADR-022, but that's execution-level rework, not the Commitment-level "the plan itself changes" that Chapter 2.7 describes.) The old `domain_state_machines.md` had an `AdaptarCompromiso`/`EnAdaptacion` transition, but that document is stale (§6) and nothing in the current architecture batch replaces it.
- **Chapter 6 / Law 5 — Explainability.** No ADR describes how an AI-generated recommendation (a Blueprint, an adaptation, a Coach suggestion) actually surfaces its reasoning to the user by default. This is a foundational Chapter/Law with zero current architectural backing.
- **Chapter 2.6 — Observation.** No ADR defines the mechanism that notices "friction, momentum, silence" evidence-first, as Chapter 2.6 describes. The old Resilience/Insights bounded context (`bounded_contexts.md`) modeled this, but it's part of the stale batch in §6.
- **Chapters 2.2/2.3 / Chapter 5's "Understanding" and "Proposing" responsibilities.** No current ADR describes the actual AI flow that turns a captured intention into a Blueprint — ADR-007 (AI-agnostic contract) is the closest, but it's infrastructure-level (which model to call), not about the Understanding→Blueprint reasoning process itself.

## 6. Missing product decisions / undocumented scope

- **Three domain documents share the exact vintage, vocabulary, and stale status as the seven documents the Framework's own Appendix already tracked — but were never counted.** `docs/02-domain/CONCEPTS.md`, `bounded_contexts.md`, and `domain_state_machines.md` (all dated June/2026-07-04, all marked "🔒 DOCUMENTO CONGELADO OFICIALMENTE") use the same superseded vocabulary the Appendix already resolved elsewhere: `Microacción` with a hard 3-item limit, Spanish domain events (`PactoActivado`, `FriccionDetectada`, `CompromisoConcebido`), a full `EnFriccion`/`EnAdaptacion`/`Recuperandose` state machine, and — notably — a whole **"Social Context (Red de Apoyo)"** bounded context, which the Appendix explicitly lists under "Intentionally Removed" as a subsystem that was "simply never built." These three documents still present all of that as current, frozen architecture, with no cross-reference to the Framework or its Appendix. The Framework's own Appendix already asks _"What should formally happen to the seven documents this appendix draws from?"_ — these three belong in that same question, making it effectively ten documents, not seven.
- **ADR-019's naming decision was made without reference to any Framework principle**, because the Framework's current, approved form didn't exist yet when the ADR was written (2026-07-17, two days before this review). This isn't a fault of the ADR — it's a sequencing fact worth recording: the Framework's Chapter 4 is, in effect, a retroactive philosophical objection to an already-decided, partially-implemented product decision, not a proactive constraint that was available when ADR-019 was written.
- ADR-015/016 (roadmap reprioritization, sprint governance) and ADR-017/018 (i18n/Metro engineering incidents) are pure process/engineering records with no Framework-relevant content — correctly outside the Framework's jurisdiction, not a gap.

## 7. Recommended remediation order

1. **Resolve the ADR-019/020 vs. Chapter 4 conflict first.** This is the highest-urgency item because it's live: ADR-019's phased rollout (Fase 1–4) was still in progress as of its own text. Two paths, both legitimate — decide, don't let it drift: (a) amend Chapter 4 with an explicit, argued exception for why `Commitment` specifically is allowed to cross the membrane (the ADR's own reasoning — "the app is literally named Commitment" — might be a legitimate argument, but Chapter 4 doesn't currently make room for it), or (b) revisit ADR-019 before further rollout phases ship. Either is cheaper now than after Fase 3/4 (visual unification, Product Polish) are built on top of the current naming.
2. **Fix `PRODUCT_VISION.md`'s Success Metrics / North Star Metric.** Lower risk to change than #1 — nothing else in the repository appears structurally dependent on the exact metric wording. Replace with metrics that reflect Chapter 9 (e.g., adaptation-usage rate, Blueprint personalization over time, system-presence-shrinking signal) instead of a single completion percentage.
3. **Fold `CONCEPTS.md`, `bounded_contexts.md`, and `domain_state_machines.md` into the Framework Appendix's already-open question** about what to do with the legacy foundational documents — this is a documentation-hygiene decision, not urgent, but cheap to resolve alongside #1 since it's the same category of decision.
4. **Decide the ADR-006/010-vs-ADR-014/Habit streak tension** — lower urgency than 1–2 since it's a live but non-blocking product surface; a conscious decision (keep StreakWidget as a minor, non-primary display, or remove it) closes the gap either way.
5. **Only after 1–4 are resolved**, do a final light-touch pass over the remaining ADRs (011, 013, 015–018, 021–023), `PRODUCT_BACKLOG.md`, `PRODUCT_HEALTH.md`, and the CAP-* capability docs — this preparation pass already found them clean or orthogonal to the Framework, so a full Freeze Review of those specifically is expected to be short confirmation, not new discovery.
