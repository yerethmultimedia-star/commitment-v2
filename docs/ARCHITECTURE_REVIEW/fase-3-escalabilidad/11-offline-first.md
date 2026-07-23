# Offline First

## Current State

**Designed (for an abandoned stack) / Not Implemented (for the current one).** `apps/mobile` has no real offline capability today, beyond a narrow, single-feature optimistic-UI pattern.

Verified directly:

- `apps/mobile/package.json` has no local-database dependency of any kind — no `@react-native-async-storage/async-storage`, no `expo-sqlite`, no MMKV, no WatermelonDB. The only local-storage-adjacent dependency is `expo-secure-store` (already confirmed by Iteration 7 to hold only the auth session UUID, not domain data).
- `src/core/query/query-client.ts` configures react-query with `retry`, `refetchOnWindowFocus`, `staleTime` — no `persistQueryClient`, no custom `networkMode`, no `onlineManager` override. Its in-memory cache does not survive an app restart/kill.
- Zero occurrences anywhere in `apps/mobile/src` of `onlineManager`, `persistQueryClient`, `NetInfo`, `isConnected`, or `networkMode` (grepped directly).
- `src/features/dashboard/registry/default-widgets.ts` declares `offline: true` / `supportsOffline: true` capability flags on most dashboard widgets — but these flags are never read anywhere in `src/features/dashboard/engine/` or `src/features/dashboard/ui/` (grepped directly, zero consumers). This is inert, aspirational schema, the same pattern Iteration 1 found with `DomainEventMetadata.actorType: 'AI_PROPOSAL'` — a field that exists to describe an intention nothing enforces.
- Two source comments (`CreateCommitmentScreen.tsx:26`, `EditCommitmentScreen.tsx:78`) explicitly defer offline UX to a future ticket: `"A toast will be shown here in VS-025/VS-030 (offline/feedback layer)"` — the team's own code acknowledges this is not built yet, not a bug.
- `docs/02-domain/offline_sync_engine.md` ("FASE 6.7... Versión 1.0 Definitiva y Documento Congelado," Junio 2026) specifies a full local-first architecture: SQLite + SQLCipher local event store, a Local Outbox / Server Inbox sync pattern, a Sync FSM, and OCC-based conflict resolution. **Its own sync-state-machine section says it is "controlado en Flutter"** — this document was written for the project's prior Flutter-based stack, not the current Expo/React Native + NestJS stack. It joins the already-known-stale batch (`CONCEPTS.md`, `bounded_contexts.md`, `domain_state_machines.md`, `postgresql_physical_model.md`, `event_store_model.md`, `read_models.md`) as a 7th pre-Framework document describing a superseded technical reality — not previously counted in that group.

**The external, unverified "5%" estimate essentially holds up**, with one nuance: real optimistic UI does exist, narrowly.

## Strengths

- **Real optimistic UI for Commitment create/edit.** `useCreateCommitment.ts:47` and `useEditCommitment.ts:20` both implement genuine `onMutate` handlers with cache snapshotting and rollback on error (`useCreateCommitment.ts:74`, "If the mutation fails, use the context returned from onMutate to roll back"). This is real, correct react-query optimistic-update engineering — not offline support, but a related capability that improves perceived responsiveness even on a flaky connection. Not confirmed for Task/Habit/Goal mutations in this pass (only Commitment's hooks showed this pattern in the grep).
- **Demo Mode is honestly separate from offline claims.** Iteration 7 already confirmed Demo Mode (`isDemoModeActive()` + per-feature `demo*Repository`) is a real, consistent convention. Checked here specifically for conflation risk: nothing in the codebase presents Demo Mode as "offline support" — it's consistently framed (in comments, naming) as a demo-data toggle, not a connectivity feature. This is a real strength worth naming explicitly, because the two are easy to blur and the code doesn't blur them.

## Weaknesses

- No local persistence layer exists for domain data at all. A killed app loses all in-flight react-query cache; a user who force-quits mid-session sees a full reload against the network on relaunch.
- No network-state detection exists anywhere — the app cannot distinguish "slow network" from "no network," and has no code path that behaves differently in either case.
- The one design document for this capability describes a different mobile framework (Flutter) and a different backend persistence model (SQLite/SQLCipher client + Supabase cloud with a real event store) than either currently exists (Expo/React Native client; NestJS backend with in-memory, non-event-sourced-for-most-aggregates persistence — Iteration 5).

## Risks

- **Compounding sequencing risk (the most important one):** even if offline-first were built today, it would have nothing durable to reconcile against — the backend has no real persistence (confirmed repeatedly, most recently Iteration 5) and no aggregate's canonical state survives a backend restart. Building a client-side sync engine before backend persistence is decided would mean designing a reconciliation protocol against a moving, undecided target.
- **Capability-flag risk:** the inert `offline`/`supportsOffline` widget flags are a latent trap — a future engineer could reasonably assume these flags gate real behavior (they read as intentional API surface) and either rely on them incorrectly or spend time honoring a contract nothing currently upholds.
- **Product-principle risk:** `PRODUCT_VISION.md` states "Offline by design – core features work without connectivity" as a Core Principle, stated in the present tense as if already true. This is the same class of drift already tracked for `PRODUCT_BACKLOG.md` (materially stale) — worth folding into that same governance question rather than treating as a new, separate doc-drift instance.

## Technical Debt

- `docs/02-domain/offline_sync_engine.md` needs the same disposition decision already pending for the other 6 stale pre-Framework docs (`docs/00-framework/REVIEW_STATUS.md`'s Framework Freeze Preparation, priority 3) — it should be added to that same batch, not handled separately, since it shares the same root cause (pre-dates the current stack/Framework entirely).
- The inert `offline`/`supportsOffline` capability flags in `default-widgets.ts` should either be wired to real behavior or removed — as vestigial schema they cost nothing today but will cost real confusion later.

## Recommendations

1. **Do not build offline-first now.** It would be premature relative to the still-open backend persistence-strategy decision already flagged in `docs/00-framework/REVIEW_STATUS.md` (Framework Freeze Preparation, priority 1: "Is there a planned trigger for actually implementing real persistence?"). Sequence this after that decision, not before.
2. **When persistence strategy is decided, rewrite `offline_sync_engine.md` from scratch** rather than adapt it — its Flutter-specific state machine and SQLite/SQLCipher assumption don't transfer to Expo/React Native, and its Outbox/Inbox design, while conceptually sound, needs to be re-derived against whatever the actual chosen backend persistence model turns out to be.
3. **Correct `PRODUCT_VISION.md`'s present-tense "Offline by design" claim** in the same pass as its already-flagged North Star/Success Metrics corrections (`docs/00-framework/REVIEW_STATUS.md`, Framework Freeze Preparation priority 2 was already fixed for the metric; this is a similar present-tense-overclaim needing the same treatment) — either reframe as a future intention or remove until true.
4. **Either wire or remove the `offline`/`supportsOffline` widget capability flags** — cheap either way, and removes a latent misunderstanding trap.

## Priority

**Medium.** Nothing is broken today for a single-user, always-connected demo context, and building real offline support now would be premature given the backend persistence question is still open. But the gap between stated product principle and shipped reality is total (not partial), and the one artifact meant to guide this work describes an abandoned technology stack — both need a deliberate decision, not silent continued drift, once the backend persistence sequencing question (already tracked as higher priority) is resolved.
