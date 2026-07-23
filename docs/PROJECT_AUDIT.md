# Project Audit — Fase 1 (2026-07-20)

**Nature of this document:** read-only survey of the actual codebase, produced to ground the Framework/ADR governance work (`docs/00-framework/`) in what is really implemented, not just what is documented. Nothing was edited to produce this report. This is a Fase 1 working artifact — it is deliberately not yet one of the "official" frozen references (`PROJECT_STATE.md`, `DOMAIN_MODEL.md`, etc.) the user eventually wants; that's Fase 3, and needs human review of this report first. Fase 2 (compare this against the Framework/ADRs and flag drift requiring product decisions) is a separate, later pass.

Where the ADR/PRD layer has already been audited in depth, this report doesn't repeat that work — see `docs/00-framework/FRAMEWORK_FREEZE_PREPARATION.md` for the ADR-vs-Framework traceability matrix. This report's distinct contribution is that it actually reads the code.

---

## 1. Project structure

Turborepo/pnpm monorepo. Real directory-level map:

```
apps/
  backend/     NestJS API. src/{commitment,task,habit,goal,notifications,devices,messaging,
               observability,infrastructure,config,filters,middleware}. No `identity/` or
               `insights/` backend module (see §3, §6).
  mobile/      Expo Router (~57.0.4) + React Native + Tamagui. src/app/** = file-based routes
               (see §5). src/features/** = screen/feature code by domain area (goals, tasks,
               habits, commitments, coach, dashboard, insights, appearance, calendar, profile).
               src/core/** = i18n, UI store, shared components.

packages/
  domain/          Framework-agnostic domain layer (event-sourced aggregates + value objects).
                   The only package with real business logic; see §2.
  api-contracts/   Single file, src/index.ts — shared request/response TypeScript types between
                   mobile and backend. Not an OpenAPI/generated contract, just hand-written types.
  design-system/   Real, substantial Tamagui-based component library (portal, scroll, input,
                   layout, providers, focus, screens, adapters, components, hooks, pickers,
                   modal, accessibility, tokens, interaction, keyboard) plus tamagui.config.ts.
  theme-engine/    Theme/appearance engine (core + themes), consumed by design-system and mobile.
  localization/    Thin i18n helper layer (t.ts, date.ts, number.ts, use-translation.ts,
                   adapter.ts) — the actual translation strings live in
                   apps/mobile/src/core/i18n/locales/{en,es}/*.json, NOT in this package.
  platform/        Tiny cross-platform shims: keyboard.ts, providers.ts, haptics.ts.
  shared/          Just an `observability/` folder + index.ts — cross-cutting logging/tracing
                   helpers.
  application/     Empty — no src/ directory exists. Placeholder package, nothing implemented.
  config/          Empty — no src/ directory exists. Placeholder package, nothing implemented.
```

Infra (docker-compose.yml, running at audit time): Redis, an OpenTelemetry collector, Prometheus, Grafana, and a full local Supabase stack (Postgres + Studio + PostgREST + Realtime + Storage). Notably, **none of this Postgres/Supabase infrastructure is actually used by the backend** — see §4.

## 2. Domain model (as implemented in code)

`packages/domain/src/` has aggregates for: `goal`, `commitment`, `task`, `habit`, `identity`, `devices`, `notifications`, plus supporting non-aggregate areas `appearance`, `calendar`, `dashboard`, `insights`. **There is no `blueprint` directory, class, or any reference to "Blueprint" anywhere in `packages/domain/src`, `apps/backend/src`, or `apps/mobile/src`** (verified with a case-insensitive recursive grep across all three — zero hits). Blueprint exists only in `THE_COMMITMENT_FRAMEWORK.md` Chapter 2.3/3; it has no code representation at all, not even a stub.

**Goal** (`packages/domain/src/goal/aggregate/goal.ts`) — event-sourced (`AggregateRoot<GoalId>`, `recordEvent`/`applyEvent`). States: `Draft, Active, Completed, Archived` (enum `GoalState`). Fields: `identityId, title, description, state, commitmentIds: string[], habitIds: string[], completedAt`. Methods: `register`, `rename`, `updateDescription`, `linkCommitment`, `linkHabit`, `activate` (requires non-empty description AND at least one linked Commitment — throws `GoalActivationRequirementsNotMetError` otherwise), `complete`, `archive`. The class's own header comment states the intended hierarchy as "Goal -> Commitment -> Task/Habit, plus Goal -> Habit/Milestone directly" — but there is no `linkTask`/`taskIds` on Goal at all; Task links to Goal from the Task side only (see below). Milestone is explicitly not modeled ("intentionally not modeled yet").

**Commitment** (`packages/domain/src/commitment/aggregate/commitment.ts`) — event-sourced. States: `Draft, Active, Paused, Completed, Cancelled`. Fields: `identityId, title, description, state, recurrencePattern, targetDate, seriesId, priority`. Methods: `register`, `activate(hasExecutionPlan: boolean)` (requires description AND an externally-resolved "has at least one linked Task" fact — comment explains this is deliberately NOT a direct Task query, to preserve aggregate boundaries; ADR-022 supplies this via a `CommitmentActivationPreconditions` class), `pause`, `resume`, `cancel`, `complete`, `rename`, `updateDescription`, `edit`, `changePriority`. No `habitIds` or `taskIds` array on Commitment itself — the relationship is held from the Task/Habit side (`commitmentId` field) and via Goal's `commitmentIds`.

**Task** (`packages/domain/src/task/aggregate/Task.ts`, 584 lines) — event-sourced, single `_props: TaskProps` bag. Status enum (`task-status.ts`): `Pending, InProgress, Blocked, Completed, Cancelled` (comment: "`Archived` was removed — existing `archived` data migrates to `Cancelled`. `Deferred` was considered and rejected"). Fields include `commitmentId: CommitmentId | null` AND `goalId: string | null` — **a Task can link directly to a Goal, independent of any Commitment**, contradicting the "Goal -> Commitment -> Task" strict-hierarchy framing in Goal.ts's comment and in ADR-019's own diagram; the real model is closer to "Task can attach to a Goal, a Commitment, both, or neither." Also has `estimatedMinutes/actualMinutes`, `startDate/dueDate/completedAt`, `blockedType: 'manual'|'dependency'`/`blockedReason`/`preBlockStatus`, `tags`, `metadata`, soft-delete via `deletedAt`. Methods: `register, complete, start, block, unblock, cancel, returnToPending, reopen(commitmentAllowsReopen: boolean), delete, changePriority, schedule, estimate, relinkGoal, relinkCommitment, duplicate`.

**Habit** (`packages/domain/src/habit/aggregate/habit.ts`, 347 lines) — event-sourced. States: `Active, Disabled, Archived` (`HabitState`). Fields: `identityId, title, recurrence, reminderTime, state, goalId: string | null, recurrenceAnchorDate, lastCompletedDate, currentStreakDays, missedStreakGrace, postponedUntil`. **`currentStreakDays` is a real, computed, persisted field** (via `computeHabitStreak` in `engine/compute-habit-streak.js`) — this is directly relevant to the open ADR-006/010-vs-ADR-014 streak tension already logged in `REVIEW_STATUS.md`: the streak concept isn't just a stray dashboard widget, it's load-bearing in the `Habit` aggregate itself. Habit has `goalId` but **no `commitmentId` field at all** — confirms ADR-023's "weak, non-owning association" decision at the code level: Habit does not hold a direct reference to any Commitment.

**Identity** (`packages/domain/src/identity/aggregate/identity.ts`, 107 lines, not yet read in depth — flagged for Fase 2 follow-up if needed).

## 3. Architecture

**Backend** (`apps/backend/src/`, NestJS): modules registered in `app.module.ts` are `HealthModule, ObservabilityModule, CqrsModule, CommitmentModule, TaskModule, HabitModule, GoalModule, NotificationsModule, DevicesModule, MessagingModule`, plus `ScheduleModule` and `BullModule` (BullMQ, backed by the real Redis container). **There is no `IdentityModule`, no `InsightsModule`, and no `CoachModule`/AI module registered anywhere in the backend.** Pattern per aggregate module: NestJS controller → command/handler pairs (CQRS via `@nestjs/cqrs`) → an in-memory repository/projection store bound via string-token DI (`provide: 'CommitmentRepository', useClass: InMemoryCommitmentRepository`, same pattern in `task.module.ts`, `habit.module.ts`, `goal.module.ts`). Routes are extensive and real (confirmed via live route registration log, not just file inspection) — e.g. `/v1/commitments{,/:id,/:id/activate,/:id/pause,/:id/resume,/:id/complete,/:id/cancel}`, `/v1/tasks{,/:id,/:id/complete,/:id/reopen,/:id/start,/:id/block,/:id/unblock,/:id/cancel,/:id/return-to-pending,/:id/dependencies,/:id/duplicate,/:id/priority,/:id/goal,/:id/commitment,/:id/schedule}`, `/v1/habits{,/:id,/:id/complete,/:id/uncomplete,/:id/postpone,/:id/enable,/:id/disable,/:id/goal}`, `/v1/goals{,/:id,/:id/activate,/:id/complete,/:id/archive,/:id/commitments,/:id/habits}`, `/v1/tasks/quick-capture`, `/v1/tasks/dashboard/:identityId`, `/v1/devices/register`, `/v1/messaging/outbox/**`.

**Mobile ↔ backend:** `packages/api-contracts` (a single hand-written `index.ts`, not generated) supplies shared TS types; mobile uses `@tanstack/react-query` + `ky` (per `apps/mobile/package.json`) to call the backend.

**Auth:** not investigated in depth this pass — `(auth)/login.tsx` and `(auth)/onboarding.tsx` exist as mobile routes; no dedicated `AuthModule` was seen in the backend module list. Flagged as an open question (§8) — worth a dedicated look before Fase 2, since it affects how "real" any of this is for more than one user.

**Coach / AI:** `apps/mobile/src/app/(tabs)/coach.tsx` is a real, wired tab. Its logic (`CoachRecommendationProvider.ts`) is explicit in its own header comment: _"Rule-based provider for the Coach screen... No AI, no I/O — deterministic rules only... the AI-backed provider that eventually replaces or augments this one (VS-034) can be added to recommendationConfig.ts without the Coach screen changing."_ **There is no LLM/AI SDK dependency anywhere in the repo** (checked `package.json` at root/mobile/backend and grepped source for openai/anthropic/ai-sdk/llm — no real hits). Everything Chapter 5 of the Framework describes (Understanding, Reasoning, Proposing, Explaining, Adapting, Learning as AI responsibilities) is, in the actual shipped product, a deterministic rules engine over dashboard/coach context (`DashboardContext`, `RecommendationProvider` interface) — not an AI system in any sense the Framework means. This is architecturally anticipated (the comment literally names the future ticket, VS-034) but it means Chapter 5 currently describes aspiration, not current behavior, at the code level.

**Notifications/Reminders:** real module (`NotificationsModule`), BullMQ-backed (`bullmq-execution-engine.ts`, `reminder.processor.ts`), with a `habit-reminder-rollover.service.ts`. Uses `in-memory-reminder-scheduler.ts` in at least one place per `TECH_DEBT.md` — same in-memory pattern as the rest of the backend (see §4).

**Insights:** exists as a domain folder (`packages/domain/src/insights`) and a mobile tab (`(tabs)/insights.tsx`, `insights/focus.tsx`) with its own engine/recommendation code under `features/dashboard/engine/recommendation/`, but **no dedicated backend `InsightsModule`** — likely computed client-side or piggybacking on other modules' data; not confirmed in depth this pass (flagged for Fase 2).

## 4. Database / persistence layer

**This is the single largest code-vs-docs gap found in this audit.** `apps/backend/src/infrastructure/` contains exactly two files: `event-store/in-memory-event-store.ts` and `projections/in-memory-projection.repository.ts`. **Neither `pg`, `@supabase/supabase-js`, `prisma`, `typeorm`, `drizzle`, nor `knex` appears as a dependency in `apps/backend/package.json` or `packages/domain/package.json`.** There are no migration files anywhere in the repo (`find . -iname migrations` returns nothing). Every aggregate module (`commitment.module.ts`, `task.module.ts`, `habit.module.ts`, `goal.module.ts`) binds its repository/projection-store DI tokens to `InMemory*` classes. **All application data is held in process memory and is lost on every backend restart** — directly confirmed live during this session (the backend process needed restarting earlier and came back with an empty/fresh in-memory store).

This is a known, deliberate, and already-tracked state, not a hidden bug: `TECH_DEBT.md` (line ~1728) states explicitly _"Demo persistence is in-memory (expected, applies to every entity type)."_ **ADR-021** (`docs/03-architecture/adr_021_goal_backend_and_domain_history_infrastructure.md`) is even more direct: its own investigation ("Paso 1 — Assessment," citing `goal_backend_current_assessment.md`) states _"Un `InMemoryEventStore` completo ya existe... registrado en DI (`task.module.ts`) pero **nunca invocado** en ningún punto del código (verificado por búsqueda exhaustiva de `saveEvents()`/`getEvents()`)"_ — i.e., even the one piece of "event store" code that exists is dead code, never called. ADR-021 explicitly chose **versioned-state CQRS, not Event Sourcing**, as the going-forward pattern for Goal (matching Commitment/Task/Habit) — a deliberate, reasoned rejection of the event-sourced model, still implemented in-memory.

This directly contradicts three domain documents that describe a different, more finished reality:

- `docs/02-domain/postgresql_physical_model.md` — "Versión 2.0 (Definitiva y Documento Congelado)," dated Junio 2026, specifies a full physical schema (`event_store`, `snapshots`, `outbox` tables, UUIDv7 strategy, AES-GCM-256 payload encryption at rest) that has zero code implementation.
- `docs/02-domain/event_store_model.md` and `docs/02-domain/read_models.md` — describe an event-sourced read-model architecture that ADR-021 explicitly decided against in favor of versioned-state CQRS.

These three docs are frozen/dated from the project's early design phase (same vintage as the CONCEPTS.md/bounded_contexts.md/domain_state_machines.md docs already flagged as stale in the Framework's Appendix) and describe target/aspirational architecture, not current reality. They were not re-verified against code in this pass beyond confirming the top-level mismatch — a full doc-by-doc diff is Fase 2 work.

## 5. Mobile navigation & screen inventory

All routes under `apps/mobile/src/app/` (expo-router, file-based):

```
(auth)/login.tsx, (auth)/onboarding.tsx                — auth group
(settings)/{index,appearance,language}.tsx             — settings group
(tabs)/{index,goals,coach,insights,profile}.tsx         — main tab bar
+not-found.tsx, index.tsx                               — root
calendar.tsx
commitments/create.tsx, commitments/[id].tsx, commitments/[id]/edit.tsx
goals/[id].tsx
habits/index.tsx, habits/create.tsx, habits/[id]/index.tsx, habits/[id]/edit.tsx
insights/focus.tsx
tasks/[id]/index.tsx, tasks/[id]/edit.tsx
```

**`commitments/create.tsx` is no longer orphaned.** ADR-019 (written 2026-07-17) found this screen built but unlinked from any navigation. As of this audit (2026-07-20), `GoalWorkspaceScreen.tsx:250` calls `router.push(\`/commitments/create?goalId=${goal.id}\`)`— it is wired in. Additionally,`GoalCommitmentsTab.tsx`exists (not`GoalTasksTab.tsx`, which ADR-019 found mislabeling Commitments as "Tareas") and the Spanish locale file (`apps/mobile/src/core/i18n/locales/es/commitments.json`) already uses "Compromiso"/"compromisos" throughout (e.g. `"title": "Crear Compromiso"`, `common.json`'s `commitmentsTab`key). **This means ADR-019's Fase 1 (Lenguaje) and Fase 2 (Creación) — which its own text and our 2026-07-19 amendment assumed were both still unstarted — have in fact already shipped in code**, in the ~3 days between the ADR being written/amended and this audit. This doesn't create a new Framework conflict (the shipped label "Compromiso" is consistent with the amended ADR-019's "current representation" framing), but it means`REVIEW_STATUS.md`'s "zero cost to amend, implementation hadn't started" note is now stale and should be corrected — flagged in §8.

No other orphaned screens were found in this pass, but navigation wiring for every screen wasn't exhaustively traced (only spot-checked the previously-flagged one) — a full "every route has an entry point" trace is Fase 2/3 work if wanted.

## 6. Implementation status by capability area

Cross-referencing what's actually registered/routed/coded (§2–5) against the two "status" documents that claim to track this:

| Capability area                                             | Code reality                                                               | `PRODUCT_BACKLOG.md` claim                                                                                                                                                                                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commitment (Register/Activate/Pause/Resume/Complete/Cancel) | All six exist as real aggregate methods + backend routes                   | Register: "✅ Done". Activate: "✅ Complete". **Pause, Resume, Complete, Cancel: "Planned"** — false; all four exist as working `Commitment.pause()/resume()/complete()/cancel()` methods with backend routes and ADR-023/ADR-014 built on top of them. |
| Goal                                                        | Full aggregate + backend module (ADR-021) + mobile workspace screens       | Not listed as an epic at all                                                                                                                                                                                                                            |
| Task                                                        | Full aggregate (584 lines, 13 behaviors) + backend module + mobile screens | Not listed as an epic at all                                                                                                                                                                                                                            |
| Habit                                                       | Full aggregate + backend module + streaks + mobile screens                 | Not listed as an epic at all                                                                                                                                                                                                                            |
| Notifications                                               | Real BullMQ-backed module, reminder rollover service                       | Listed only as a "Future Epic (placeholder)"                                                                                                                                                                                                            |
| Coach                                                       | Real mobile tab, rule-based recommendation engine                          | Listed only as a "Future Epic (placeholder)"                                                                                                                                                                                                            |
| AI                                                          | Not implemented (§3)                                                       | Listed only as a "Future Epic (placeholder)" — this one is actually accurate                                                                                                                                                                            |
| Statistics/Insights                                         | Mobile tab + domain folder + recommendation engine exist                   | Listed only as a "Future Epic (placeholder)"                                                                                                                                                                                                            |
| Identity                                                    | Domain aggregate exists; no backend module confirmed                       | Listed only as a "Future Epic (placeholder)"                                                                                                                                                                                                            |

**`docs/01-product/PRODUCT_BACKLOG.md` is severely stale** — it reads as a day-one planning document (it doesn't mention Goal, Task, or Habit as epics at all, despite these being the majority of what's actually built) and its "Estado" column is wrong for at least 4 of 6 listed Commitment capabilities. This is a materially bigger and more actionable drift than the already-known-stale `docs/02-domain/CONCEPTS.md`/`bounded_contexts.md`/`domain_state_machines.md` trio, because unlike those three (already flagged, already headed for archival per the Framework Appendix), `PRODUCT_BACKLOG.md` is still the nominal source of truth for "what's been built" and nothing currently flags it as stale. Flagged in §8.

`TECH_DEBT.md` (2782 lines) and the `docs/G0.2-Project-Backbone/` pack (`PROJECT_STATUS.md`, `ROADMAP.md`, `ENGINEERING_BOARD.md`, its own `TECH_DEBT.md`) were not read in full this pass — `TECH_DEBT.md` was only grepped for persistence-related entries (§4) and appears to be a live, actively-maintained, detailed engineering log (dated entries through 2026-07-19), unlike `PRODUCT_BACKLOG.md`. Recommend `TECH_DEBT.md` as the more trustworthy "what's actually going on" source if Fase 2 needs another cross-check.

## 7. Documentation inventory and code-vs-doc drift

Full `docs/` tree has ~85 markdown files across `00-framework/, 00-governance/, 01-product/, 02-domain/, 03-architecture/, 07-quality/`, plus a `G0.1-Governance-Foundation/` and `G0.2-Project-Backbone/` pair of directories that appear to be an entirely separate, earlier governance-pack scaffold (their own copies of `README.md`, `ai_bootstrap.md`, `engineering_constitution.md`, etc. — duplicating `docs/00-governance/`'s files) plus a second, separate `TECH_DEBT.md`/`ROADMAP.md`/`PROJECT_STATUS.md`/`ENGINEERING_BOARD.md` set. **Not resolved this pass**: whether `docs/G0.1-...` and `docs/G0.2-...` are superseded duplicates of `docs/00-governance/` and root `TECH_DEBT.md`, or a genuinely separate, still-relevant track. Flagged in §8 — this looks like the same "which of these old docs are still authoritative" question the Framework's Appendix already asks about its own seven source documents, just one directory over.

Code-vs-doc drift found (beyond the Framework-philosophy contradictions already tracked in `FRAMEWORK_FREEZE_PREPARATION.md`):

- `docs/02-domain/postgresql_physical_model.md`, `event_store_model.md`, `read_models.md` describe a Postgres/event-sourced architecture that was explicitly decided against (ADR-021) and never implemented (§4).
- `docs/01-product/PRODUCT_BACKLOG.md` is stale on both scope (missing Goal/Task/Habit/Notifications/Coach/Insights as real epics) and status (wrong "Planned" labels on shipped Commitment capabilities) (§6).
- `docs/02-domain/CONCEPTS.md`, `bounded_contexts.md`, `domain_state_machines.md` — already flagged as stale in the Framework's own Appendix and `REVIEW_STATUS.md`'s Freeze Preparation priority 3; not re-verified here, just confirmed still present and unarchived.

## 8. Open questions for Fase 2

These need a human/product decision, not just a documentation fix:

1. **Persistence strategy timeline.** Everything is in-memory today, by deliberate choice (ADR-021), with no Postgres wiring despite a full local Supabase stack running and detailed physical-model docs already written. Is there a planned trigger for actually implementing real persistence, or is "demo mode" the intended state for longer than the docs' tone ("Documento Congelado," "Definitiva") implies? This affects how much weight `postgresql_physical_model.md`/`event_store_model.md`/`read_models.md` should carry going forward — as-is, target-architecture, or due for a rewrite reflecting the versioned-state-CQRS decision.
2. **`PRODUCT_BACKLOG.md` needs a real rewrite, not an archive-and-replace.** Unlike the three domain docs already headed for archival, this one is still the nominal "what's the status of each capability" reference and it's actively wrong. Worth deciding whether this becomes part of the Fase 3 official docs (e.g. folded into a `PROJECT_STATE.md`) or gets fixed in place.
3. **`docs/G0.1-Governance-Foundation/` and `docs/G0.2-Project-Backbone/`** — apparent duplicate/superseded governance-pack scaffolding sitting alongside the live `docs/00-governance/` and root `TECH_DEBT.md`. Needs a decision on archive vs. delete vs. "actually still in use for some reason not seen this pass."
4. **ADR-019's rollout status needs correcting in `REVIEW_STATUS.md`.** The 2026-07-19 amendment assumed zero implementation ("zero cost to amend"); code now shows Fase 1 (labels) and Fase 2 (creation flow wired) already shipped as of 2026-07-20. Doesn't create a new Framework conflict (shipped copy matches the amended ADR's "current representation" framing) but the record should be corrected so it doesn't mislead a future reader about timeline/cost.
5. **Auth model** wasn't traced this pass (login/onboarding screens exist on mobile; no backend `AuthModule` was seen in `app.module.ts`) — worth a dedicated look, since it bears on how multi-user/production-real any of the current implementation is.
6. **Backend `InsightsModule` / Identity backend wiring** — both have domain-layer aggregates/folders but weren't confirmed to have a corresponding NestJS module the way Goal/Task/Habit/Commitment do. Worth confirming whether Insights/Identity data is actually served from somewhere, computed client-side, or genuinely absent server-side.
