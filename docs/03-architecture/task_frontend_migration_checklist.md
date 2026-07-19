# ✅ Task Frontend Migration Checklist (ADR-022 Fase 2.3) — COMPLETE 2026-07-19

Not an ADR — a working checklist for the frontend migration to ADR-022's 5-state Task lifecycle.
Backend (Fase 2.1 Domain + Fase 2.2 Application/Backend) is complete and Golden-Path-verified; see
`docs/03-architecture/adr_022_task_lifecycle_and_execution_model.md` and `PROJECT_STATUS.md` item 14.

**Status: Fase 2.3 (Frontend) is complete.** Every item below is checked off, with a note on how it
was resolved. Verified via `tsc --noEmit`, `jest` (84/99 — 15 pre-existing unrelated `__DEV__`
failures), and a live Playwright functional walkthrough (23/24 automated checks passed against a
running `apps/backend` + Expo web target in Demo Mode; the one non-pass was a pre-existing,
unrelated React 19 `element.ref` deprecation warning traced to the Design System's
`ConfirmationDialog`/`Dialog` component — reproduced on an untouched Goal-Archive call site too, so
not introduced by this work). Sequence followed, per explicit instruction: model → components/states
→ API integration → Goal Workspace projection → navigation → semantic sweep → validation.

## Semantic sweep — re-run and confirmed clean 2026-07-19

```
grep -rniE "archiv|deferred" apps/mobile/src --include="*.ts" --include="*.tsx" | grep -viE "commitment|habit|goal"
grep -rn "ArchiveButton|RestoreDialog|TaskArchived|TaskRestored|archiveTask|restoreTask|isArchived|showArchived|ArchiveMenu|ArchiveDialog|archiveMutation|archiveAction|archiveReducer" apps packages
```

Zero matches beyond intentional historical/documentation comments (e.g. "`Archived` removed...") and
Goal/Habit's own legitimate Archive state (explicitly out of ADR-022 scope). **One real finding from
this sweep, fixed:** `core/demo/__tests__/demo-tasks.repository.test.ts` still called the removed
`demoTasksRepository.archive()` — would have failed at runtime. Replaced with tests for
start/block/unblock/returnToPending/cancel/reopen, including a preBlockStatus-restoration assertion.

## 1. State model — DONE

- [x] `features/tasks/models/task.model.ts` — `TaskStatus` is now the 5-state ADR-022 set. Added
      `TaskBlockedType` and `blockedType`/`blockedReason` to `TaskModel`.
- [x] `features/tasks/components/TaskStatusBadge.tsx` — 5-state tone/icon map (`pending`=neutral/
      Circle, `in_progress`=accent/PlayCircle, `blocked`=warning/Ban, `completed`=success/
      CheckCircle2, `cancelled`=danger/XCircle). `archived`/`Archive` icon removed.
- [x] `features/tasks/screens/TasksScreen.tsx` — **Bucket decision made:** kept the existing 4
      date/status buckets (`inbox`/`today`/`upcoming`/`completed`, `archived`→`cancelled`), did
      **not** add a separate Blocked bucket — In Progress/Blocked tasks fall through to the same
      date-based bucketing as Pending (still "actionable and due"), distinguished per-card via
      `TaskStatusBadge`'s tone+icon rather than a 6th tab. Verified live: badges render distinctly
      per state on the same list.
- [x] Dashboard UX note — implemented, not just flagged. `TodayWidget.tsx`'s flat `$accent` dot
      replaced with `TaskStatusBadge` per row (UX reuse, ADR-022 §9) so Pending/In Progress/Blocked
      are visually distinguishable in "Today" without changing the backend response shape.
      Additionally found and fixed during this pass: `useDashboardContext.ts`'s priority-of-the-day
      hero selector could pick a **Blocked** task as "today's #1 priority" (an unintended consequence
      of Fase 2.2 broadening `dashboard.today`) — now explicitly excludes Blocked from hero
      candidates (still visible in the plain "today" list, just not electable as the single hero).

## 2. Actions — DONE

- [x] `features/tasks/api/tasks.api.ts` — `archive()` removed; added `start()`, `block(id, reason?)`,
      `unblock()`, `cancel()`, `returnToPending()`, `reopen()`.
- [x] `features/tasks/hooks/useTasks.ts` (`useTaskActions()`) — mutations added to match.
- [x] `features/tasks/screens/TasksScreen.tsx` — rewritten around a new `TaskCard` component (status-
      gated action bar, not a fixed 4-button row) + `TaskActionBar`/`taskActions.ts`
      (`getAllowedTaskActions()`/`isTaskEditable()`, mirroring `commitmentActions.ts`'s "UI must never
      contain status conditionals" rule). Cancel requires confirmation (`ConfirmationDialog`, reused);
      other actions fire immediately. Action-dispatch/confirmation/pending-state logic extracted into
      `useTaskActionDispatch()` so it isn't duplicated between TasksScreen and Goal Workspace's Tasks
      tab.
- [x] `core/demo/demo-tasks.repository.ts` — `archive()` replaced with the 6 new actions, including a
      `preBlockStatus` map mirroring the backend's internal field so Unblock restores the exact prior
      operational status.
- [x] `core/demo/demo-data.ts` — completion-rate filter now excludes `'cancelled'` (was `'archived'`);
      "today"/"upcoming" now include Pending+InProgress+Blocked, mirroring the backend. No literal
      `'archived'` fixture data existed to migrate (checked directly — all fixtures already used only
      `'pending'`/`'completed'`).
- [x] `core/demo/__tests__/demo-tasks.repository.test.ts` — updated (see semantic sweep above).

## 3. i18n — DONE, both `en` and `es`

- [x] `core/i18n/locales/{en,es}/tasks.json` — `buckets.archived`→`buckets.cancelled`,
      `buckets.empty.archived`→`buckets.empty.cancelled`, `actions.archive` removed, added
      `actions.{start,block,unblock,returnToPending,cancel,reopen}`, `status.archived` removed, added
      `status.{in_progress,blocked,cancelled}`, and a new `confirm.cancel.{title,description}` block
      for the Cancel confirmation dialog. Verified rendering live in Spanish (the seeded browser
      locale) — every new label displayed correctly, no raw key leaks.
- [x] `core/i18n/locales/{en,es}/common.json` — `goals.workspace.tabs` gained `overview`/
      `commitments`/`analytics` (kept `tasks`/`milestones`/`notes`); added `goals.workspace.tasks`,
      `tasksEmpty`, and a new `goals.workspace.analytics.*` block.
- [x] Zero-hardcoded-strings rule followed throughout.
- **Minor finding, not fixed (low priority):** `goals.workspace.upcoming`/`upcomingEmpty` keys are now
  orphaned (the section they labeled was replaced by the new Tasks tab). Harmless dead i18n content,
  not a correctness issue — left in place rather than scope-creeping into a full i18n key audit.

## 4. Navigation — DONE

- [x] `features/goals/screens/GoalWorkspaceScreen.tsx` — `WorkspaceTab` is now `'overview' |
    'commitments' | 'tasks' | 'analytics' | 'milestones' | 'notes'`, in that order. Verified live:
      tab strip renders exactly `Resumen | Compromisos | Tareas | Analítica | Hitos | Notas`.
  - [x] Old `tasks` tab's mixed content split: Commitments+Habits lists moved to the new
        `commitments` tab (unchanged content/behavior, just relocated); a genuinely new `tasks` tab
        built (see §6).
  - [x] `Milestones`/`Notes` — untouched, verified still present and functioning, moved to trailing
        position per the review's "hide from main flow, don't delete in this PR" guidance (not
        removed — reordered only).
- [x] `features/goals/components/GoalTabStrip.tsx` — reused unchanged (already fully generic over the
      tab list, exactly the reuse mandate expects — no new component built).
- [x] New `analytics` tab built (not in the original checklist scope, but required by ADR-022 §8):
      Commitments-by-status and Tasks-by-status breakdowns + completion rate, reusing `MetricCard`
      (no new Design System component). Verified live with real demo numbers (2 Active/1 Completed
      Commitments, 6 Pending/8 Completed Tasks, 57% completion rate).

## 5. Task creation flow — DONE, confirmed reusable as suspected

- [x] `features/tasks/components/TaskForm.tsx` — the existing `relationKind` selector already
      satisfied the requirement. Extended with two optional props (`defaultRelationKind`,
      `commitmentOptions`) rather than new form logic, so Goal Workspace's Tasks tab defaults to the
      'commitment' kind (or 'none' if the Goal has zero Commitments yet, to avoid an empty-looking
      selector) and restricts the Commitment dropdown to the Goal's own linked Commitments.

## 6. Tasks view as a projection — DONE

- [x] `GoalWorkspaceScreen.tsx`'s `goalScopedTasks` — `tasks.filter(t => t.commitmentId &&
    goal.commitmentIds.includes(t.commitmentId))`, computed client-side from the same `useTasks()`
      query every other Task screen uses (no separate fetch, no duplicated dataset). Matches ADR-022
      §8's literal text: Commitment-transitive only, excludes independent and other-Goal-linked
      Tasks. (Note: this is intentionally _narrower_ than the pre-existing `linkedTasks` used for
      Overview's stats, which also includes direct Goal-linked Tasks — kept `linkedTasks` unchanged
      for Overview to avoid an unrequested behavior change to already-working aggregate stats; the
      ADR's stricter definition applies specifically to the new Tasks tab.)

## 7. TECH_DEBT.md Item 41 — RESOLVED

Closed. `tasksApi.archive()` no longer exists; the real-mode 404 it caused is gone. See
`TECH_DEBT.md` for the resolution note.

## 8. Verification — DONE

- [x] Semantic sweep re-run, clean (see top of this document).
- [x] `tsc --noEmit` clean (mobile).
- [x] `jest`: 84/99 passing, 15 pre-existing unrelated `__DEV__`-environment failures
      (`DashboardLayoutEngine.test.ts`, untouched by this work) — same baseline as before this change.
- [x] `demo-tasks.repository.test.ts` updated and passing (referential-integrity + preBlockStatus
      coverage for all 6 new actions).
- [x] No snapshot tests existed for `TaskStatusBadge`/`TasksScreen` to update.
- [x] Live functional walkthrough via Playwright against a running `apps/backend` + Expo web target,
      Demo Mode seeded (`commitment-auth-storage`/`commitment-demo-mode-storage`, same recipe as
      Golden Path #1): Start → Block → Unblock (verified exact preBlockStatus restore) → Complete →
      Reopen, Cancel's confirmation dialog, and the full Goal Workspace tab redesign including the
      new Tasks and Analytics tabs with real demo data. 23/24 automated checks passed.
- [x] `PROJECT_STATUS.md` item 14 and `TECH_DEBT.md` Item 41 updated to reflect Fase 2.3 completion.
