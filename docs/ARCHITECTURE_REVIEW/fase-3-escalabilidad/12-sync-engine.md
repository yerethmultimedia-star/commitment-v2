# Sync Engine / Conflict Resolution

## Current State

**Not Implemented.** No client-side sync mechanism, conflict-resolution logic, or cross-device/cross-session reconciliation exists anywhere in this codebase.

Verified directly:

- Exhaustive grep across `apps/mobile/src`, `apps/backend/src`, `packages/domain/src` for `conflict resolution|vector clock|CRDT|last-write-wins|sync engine|sync queue|reconcil` returns exactly one hit, and it's unrelated: a comment on `Commitment.model.ts:21` about a mobile-only `goalId` adaptation field possibly needing "reconciling against the real domain direction" someday — a data-modeling note, not sync-engine code.
- `apps/mobile/src/core/query/query-client.ts` has `refetchOnWindowFocus: true` and `staleTime: 5min` configured. This provides a **passive, incidental mitigation** for multi-tab/window divergence (returning to a stale tab triggers a background refetch) — not designed as sync, but it does reduce (not eliminate) the window where two views of the same data silently disagree. No polling, no websockets, no push-based invalidation exist.
- This finding directly follows from Iteration 11 (Offline First, score 10/100): with zero local durable storage and zero mutation queueing, there is no offline-made state that would ever need reconciling. "Sync" as a distinct capability has no substrate to operate on today — confirmed, not assumed.
- The one design document for this area, `docs/02-domain/offline_sync_engine.md` §4 ("RESOLUCIÓN DE CONFLICTOS DE CONCURRENCIA (OCC & EVENT SOURCING)"), already flagged by Iteration 11 as Flutter-era/stale overall — evaluated here specifically on its conflict-resolution design, independent of that staleness (see Weaknesses).
- `PRODUCT_BACKLOG.md` lists "Offline Sync" under **"Future Epics (placeholder)"** (line 24) — a nominal future intention exists, but at the same non-committal tier as Identity/Coach/AI/Statistics, in a document already tracked as materially stale (`docs/00-framework/REVIEW_STATUS.md`). No mention of sync or multi-device anywhere in `PRODUCT_VISION.md`. There is no firm product promise here today, just a placeholder acknowledgment it's a plausible future direction.
- The actually-relevant present-day concern is the one Iteration 5 already found and this iteration confirms has no client-facing mitigation either: **no optimistic-concurrency enforcement exists on the real source-of-truth repositories** (`InMemoryGoalRepository`/`InMemoryCommitmentRepository`). Two concurrent writes — whether from two tabs of the same demo session, a retried request, or (eventually) two real devices — would silently last-write-win, with no error and no conflict signal, at the server, today.

## Strengths

None specific to this capability — there is nothing built to evaluate positively. The closest adjacent positive is `refetchOnWindowFocus`, which is real and does help, but it's a generic react-query default being used as configured, not evidence of sync-aware engineering.

## Weaknesses

- No client-side conflict-resolution or sync mechanism exists at any layer.
- **The one existing design's reconciliation algorithm is not just unbuilt for the wrong stack — it's incompatible with the actual, decided backend architecture.** `offline_sync_engine.md` §4's reconciliation strategy depends on rehydrating and re-applying reordered events to recompute local state ("La base local se re-calcula aplicando los eventos re-ordenados de forma determinista") and its §5 device-reinstall edge case depends on downloading "snapshots" to reconstruct state via full replay. Both mechanisms require true Event Sourcing (aggregate state reconstructed from events) as the backend's write model. Iteration 5 already confirmed ADR-021 explicitly rejected Event Sourcing in favor of flat, versioned-state CQRS — aggregate state is never rehydrated from events anywhere in the current backend. This means the document's core reconciliation algorithm would need to be redesigned from its conflict-resolution mechanism outward, not just reimplemented against a different client stack (Iteration 11's framing) — the target backend model it assumes no longer exists by design, independent of which mobile framework is used.

## Risks

- **The real, present-day risk is Iteration 5's finding, now confirmed to have no client-side backstop either:** concurrent writes to the same Goal/Commitment (two tabs, a double-tap-triggered retry, or eventually two real devices) silently overwrite each other with no conflict surfaced to the user. This is the same gap, viewed from the client-concurrency angle rather than the single-request angle — not a new root cause, but confirms the gap has no mitigation anywhere in the stack, client or server.
- **Product-expectation drift is milder here than for Offline (Iteration 11).** "Offline Sync" is only a placeholder-tier future epic, not a stated present-tense principle like `PRODUCT_VISION.md`'s "Offline by design" — so there's no active overclaim to correct, just an epic sitting in an already-stale backlog document.

## Technical Debt

- No new technical debt beyond what Iteration 11 already logged for `offline_sync_engine.md` (needs the same stale-document disposition decision as the other 6 pre-Framework docs). This iteration adds one specific refinement worth carrying into that decision: **a future rewrite of this document cannot simply update the tech stack references — its conflict-resolution mechanism must be redesigned around versioned-state CQRS**, since the OCC-and-event-replay approach it currently specifies has no aggregate-rehydration substrate to run on in the decided architecture.
- Add expected-version enforcement to the state repositories — already recommended by Iteration 5, and the correct prerequisite for any future client-facing conflict signal (a client can't be told "your write conflicted" if the server never detects the conflict in the first place).

## Recommendations

1. **Do not build a sync engine now** — same reasoning as Iteration 11: there's no offline-queued state to reconcile, and the backend persistence-strategy decision (`REVIEW_STATUS.md` priority 1) is still open.
2. **When `offline_sync_engine.md` is eventually rewritten** (already queued as a decision alongside the other 6 stale docs), treat its conflict-resolution section as needing full redesign, not adaptation — flag this explicitly so a future editor doesn't preserve the OCC/event-replay mechanism by default while only swapping SQLite/Flutter references for the current stack.
3. **Prioritize Iteration 5's recommended fix (real optimistic-concurrency checks on the state repositories) ahead of any sync work**, since it's the actual present-day risk, is cheap to do now, and is a hard prerequisite for any future conflict-resolution story regardless of whether that story involves offline sync or just concurrent real-time users.
4. **Correct `PRODUCT_BACKLOG.md`'s "Offline Sync" placeholder** in the same governance pass already planned for that document's broader staleness (`docs/PROJECT_AUDIT.md` §6) — no urgent action needed on its own.

## Priority

**Medium.** Nothing is broken today for a single-user, low-concurrency demo. Consistent with Iterations 5 and 11: this is a legitimate future capability with no product urgency behind it yet (only a placeholder epic), but the one artifact meant to guide it has a conflict-resolution design that's now architecturally incompatible with a decision already made (ADR-021), which should be flagged before anyone reaches for that document as a starting point.
