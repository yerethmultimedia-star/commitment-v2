# Product Backlog (Version 1.0)

This backlog captures the **capabilities** (user‑visible features) that will be delivered in the first release. It is organized by Epic, prioritized, and annotated with the user value each capability provides.

**Corregido 2026-07-23 como parte de AR-004** (`docs/ARCHITECTURE_REMEDIATION/AR-004/ANALISIS.md`, D-004.1). La versión anterior no listaba Goal/Task/Habit/Notifications/Coach/Statistics como epics reales y marcaba 4 de 6 capacidades de Commitment como "Planned" pese a estar implementadas — confirmado en `docs/PROJECT_AUDIT.md` §6-8 y reconfirmado sin cambios en AR-004/Fase 1. Cada fila de este documento debe poder señalar evidencia concreta en el repositorio (módulo backend registrado, hook/mutación real en mobile, o ambos); donde esa evidencia no existe todavía, la capacidad permanece en "Future Epics", no en la tabla principal.

| Epic     | Capability            | User Problem                                                       | Priority | User Value                         | Estado                                | Evidencia                                                                                                                                 |
| -------- | --------------------- | ------------------------------------------------------------------ | -------- | ---------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| EPIC-001 | Register Commitment   | User wants to define a meaningful commitment                       | ✅ Done  | Create a new commitment            | ✅ Complete                           | `apps/backend/src/commitment/`, `apps/mobile/src/features/commitments/hooks/useCreateCommitment.ts`                                       |
| EPIC-001 | Activate Commitment   | User is ready to begin their transformation                        | P0       | Start the commitment               | ✅ Complete                           | `commitment.activate()` + `useCommitmentActions.ts` (mobile, wired in `CommitmentWorkspaceScreen.tsx`)                                    |
| EPIC-001 | Pause Commitment      | User needs to temporarily stop without feeling failure             | P0       | Manage interruptions               | ✅ Complete                           | `commitment.pause()` + `pause-commitment.handler.ts` + `useCommitmentActions.ts`                                                          |
| EPIC-001 | Resume Commitment     | User is ready to continue after a pause                            | P0       | Resume progress                    | ✅ Complete                           | `commitment.resume()` + `resume-commitment.handler.ts` + `useCommitmentActions.ts`                                                        |
| EPIC-001 | Complete Commitment   | User wants to close a commitment and preserve what they learned    | P0       | Finish a commitment                | ✅ Complete                           | `commitment.complete()` + `complete-commitment.handler.ts` + `useCommitmentActions.ts`                                                    |
| EPIC-001 | Cancel Commitment     | User consciously abandons a commitment                             | P1       | Consciously abandon a commitment   | ✅ Complete                           | `commitment.cancel()` + `cancel-commitment.handler.ts` + `useCommitmentActions.ts`                                                        |
| EPIC-002 | Goal                  | User wants to organize commitments/tasks under a long-term outcome | P0       | Track progress toward a bigger aim | ✅ Complete                           | `GoalModule` (`apps/backend/src/goal/`, registrado en `app.module.ts`), `GoalWorkspaceScreen.tsx`                                         |
| EPIC-003 | Task                  | User wants to break work into concrete, actionable steps           | P0       | Execute day-to-day actions         | ✅ Complete                           | `TaskModule` (`apps/backend/src/task/`, registrado en `app.module.ts`), pantallas en `apps/mobile/src/features/tasks/`                    |
| EPIC-004 | Habit                 | User wants to build recurring routines with visible consistency    | P0       | Build sustainable routines         | ✅ Complete                           | `HabitModule` (`apps/backend/src/habit/`, registrado en `app.module.ts`), `TodayHabitsScreen.tsx`, `HabitDetailScreen.tsx`                |
| EPIC-005 | Authentication        | User needs their data scoped to a verified identity                | P0       | Secure access to personal data     | ✅ Complete                           | `AuthenticationModule` (`apps/backend/src/authentication/`, registrado en `app.module.ts` — AR-043)                                       |
| EPIC-006 | Notifications         | User wants reminders without checking the app constantly           | P1       | Timely, relevant reminders         | ✅ Complete                           | `NotificationsModule` (BullMQ, AR-054), `apps/mobile/src/core/notifications/push-registration.ts`                                         |
| EPIC-007 | Coach                 | User wants contextual suggestions on what to do next               | P1       | Reduce decision fatigue            | ✅ Complete (basado en reglas, no IA) | `RuleRecommendationProvider`/`CoachRecommendationProvider` (`apps/mobile/src/features/dashboard/engine/recommendation/`), tab `coach.tsx` |
| EPIC-008 | Statistics / Insights | User wants to see how they're actually progressing over time       | P1       | Visibility into real progress      | ✅ Complete                           | `InsightsLayoutEngine` (`apps/mobile/src/features/insights/engine/`), tab `insights.tsx`                                                  |

---

**Future Epics (placeholder — sin evidencia de implementación a la fecha):**

- Identity (el aggregate de dominio existe; sin módulo de backend — ver AR-030, todavía pendiente en el Roadmap)
- Daily Execution
- Reflection
- Offline Sync (~10% real, ver `docs/ARCHITECTURE_OVERVIEW.md` §2 — AR-048)
- AI (cero código, confirmado — AR-050)

Each upcoming capability will be added here with priority, user value, and status, ensuring a clear roadmap from product vision to implementation.
