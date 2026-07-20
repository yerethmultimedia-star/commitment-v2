# Review Status — THE_COMMITMENT_FRAMEWORK.md

**Document status: Draft v0.1 — Editorial Review Complete** (2026-07-19). All chapters and the Appendix are approved. The document is not yet frozen as v1.0 — that step is separate and depends on resolving the Deferred v1.1 items below and the "Unresolved Conflicts" in the Appendix.

## Phase change (2026-07-19): editorial review closed, freeze review is next

The editorial phase is done. `THE_COMMITMENT_FRAMEWORK.md` and `EDITORIAL_GUIDELINES.md` are now frozen — no further edits to either except a deliberate version decision (e.g. cutting v1.0) or a change to the editorial process itself. This file (`REVIEW_STATUS.md`) stays live.

Deferred v1.1 items and the Appendix's Unresolved Conflicts are now **product backlog, not editorial debt** — they get resolved as conscious product decisions, not reopened as writing/consistency problems. Don't relitigate an approved chapter for a reason that isn't about its text.

Before declaring **Framework v1.0**, run a **Framework Freeze Review** (not another chapter-by-chapter pass) checking:

- Does anything in the existing ADRs (`docs/03-architecture/`) contradict the Framework?
- Does any PRD contradict a Framework principle?
- Do the current domain names (Goal, Commitment, Habit, Task, etc.) still respect the Chapter 4 membrane separation (user language vs. domain language)?
- Of the Deferred v1.1 items, does any genuinely need to be resolved before freezing, rather than legitimately waiting for v1.1?

If that review is clean, v1.0 is reasonable.

## Framework Freeze Preparation — priority 1 resolved (2026-07-19)

`docs/00-framework/FRAMEWORK_FREEZE_PREPARATION.md` flagged ADR-019/020 vs. Chapter 4 (the membrane) as the highest-confidence, highest-urgency violation: ADR-019 made `Commitment`/"Compromiso" a mandatory, permanently-reserved user-facing term, which is precisely the membrane-failure scenario Chapter 4 names by example. Correction note: it was reported as a mid-rollout risk, but ADR-019's own header states implementation had not started — zero cost to amend.

**Resolution:** amended both ADR-019 and ADR-020 with a governance addendum (not a rewrite — the original diagnosis and Decision 1 in both ADRs stand). The fix reframes the invariant: **the domain owns the invariant (Commitment stays distinct from Task); the membrane owns the representation** ("Compromiso" is the _current_ representation, not a permanently reserved word). The absolute "bajo ninguna circunstancia" lock was removed from ADR-019; ADR-020's Quick Capture flow was reframed from "user selects the `Commitment` type" to "user expresses an intention; the membrane resolves it to `Commitment`." Both amendments are appended as dated sections in the ADR files themselves, explicitly noting they predate Chapter 4's formal adoption.

## Framework Freeze Preparation — priority 2 resolved (2026-07-19)

`PRODUCT_VISION.md`'s North Star ("Percentage of active commitments successfully completed") was a single completion-rate number promoted to the top of the document — exactly the pattern Chapter 9 names and rejects ("a streak, a completion rate, a score... a temptation, not a solution... never at the top of this document, as the goal").

**Resolution:** replaced the North Star with the **Commitment Transformation Index (CTI)**, explicitly framed as an operationalization of Chapter 9, not a new philosophy — traceability runs Framework → Product Vision, not the reverse. The CTI's dimensions (Blueprint personalization, healthy adaptation, decreasing system dependence, longitudinal evidence of change) are stated as "including — but not limited to," deliberately non-normative in `PRODUCT_VISION.md`, so instrumentation can evolve without requiring a document edit each time. The former North Star was not deleted — it was reclassified as an **Operational KPI**, matching Chapter 9's own point that completion rate is a legitimate Execution/Observation-stage instrument, just never the top-level goal. A governance sentence was added: _"No operational metric may replace the Commitment Transformation Index as the North Star unless the Framework itself is deliberately amended,"_ to prevent future quiet drift back toward DAU/streaks/completion-rate as North Star.

Remaining Freeze Preparation priorities (3–5, not yet actioned): fold `CONCEPTS.md`/`bounded_contexts.md`/`domain_state_machines.md` into the Appendix's open question about legacy documents, resolve the ADR-006/010-vs-ADR-014 streak-widget tension, then a light confirmatory pass on the rest.

Live record of chapter-by-chapter approval status. Update this file whenever a chapter's status changes — this is the source of truth if conversational context is lost. See `EDITORIAL_GUIDELINES.md` for the review methodology this status log assumes.

## Chapter status

| Chapter                                                | Status                                              |
| ------------------------------------------------------ | --------------------------------------------------- |
| 0 — Why This Document Exists                           | ✅ APPROVED                                         |
| 1 — What Commitment Is                                 | ✅ APPROVED                                         |
| 2 — The Transformation Model                           | ✅ APPROVED                                         |
| 3 — The Blueprint                                      | ✅ APPROVED                                         |
| 4 — User Language vs. Domain Language                  | ✅ APPROVED                                         |
| 5 — The Role of AI                                     | ✅ APPROVED                                         |
| 6 — Explainability                                     | ✅ APPROVED                                         |
| 7 — The Laws of Commitment                             | ✅ APPROVED (see conflict below)                    |
| 8 — Principles / Capability Test                       | ✅ APPROVED (2026-07-19)                            |
| 9 — Success Metrics                                    | ✅ APPROVED (2026-07-19), no edits                  |
| 10 — How This Document Should Be Used                  | ✅ APPROVED (2026-07-19), no edits                  |
| Appendix — Migration From Prior Foundational Documents | ✅ APPROVED (2026-07-19), one amendment — see below |

## 2026-07-19 reconciliation

Context: the canonical file had drifted to a different local path (`iCloud/Desktop/Commitment-v2/docs/00-framework/`) than this project's working repo. It was located, read in full, and copied into this repo (`docs/00-framework/THE_COMMITMENT_FRAMEWORK.md`) as the single going-forward source of truth. Before continuing the review, the file's actual content was checked against every previously-approved edit below, chapter by chapter, to make sure no edits were silently lost or reverted in transit.

**Already present (verified applied, no action needed):**

- Ch. 3 — ends by deferring naming to Chapter 4 ("What it is called is Chapter 4's question, not this one"); no dangling materialization promise.
- Ch. 4 — Membrane concept present; human/domain language split explicit; axiom _"The user owns the intention. The system owns the representation"_ present; Goal/Commitment/Habit/Task framed as current-domain examples; no temporal ("today...") language.
- Ch. 5 — Membrane/Architect reconciled as "the same intelligence, viewed through different responsibilities"; Learning redefined to design-only, never profiling/curiosity/because-it-can, implementation deferred to architecture.
- Ch. 6 — uses "implicit assumption" (not "hidden model"); _"Commitment only ever makes offers"_ remains prose, correctly NOT promoted to an axiom.
- Ch. 7 — Law 2 reads "Users execute, supported by the system"; Law 3 cites Chapter 9 (not 10); Laws 0, 2, 4, 7 all carry provenance citations back to earlier chapters; Laws 8–10 are absent from the Laws list (removed per Provenance Test failure, as previously agreed).

**Missing (still needs action):**

- Ch. 8 — none of the three pending edits (below) have been applied yet. Confirmed still open, not silently resolved or reverted.
- A formal **Deferred v1.1** list does not exist anywhere in the repo yet. The content of former Laws 8–10 (see Conflict below) needs to actually be written down here, not just implied.

**Conflict (logged as editorial debt, not fixed now — see "Editorial debt" section below):**

- The Appendix still cites Laws 8–10, which no longer exist in Chapter 7. Per review discipline, the Appendix is frozen until its own review pass — this is not corrected now just because it was noticed during Chapter 8 work.

## Chapter 8 — approved 2026-07-19

Applied all three previously-pending edits, then re-ran the full review battery:

1. Added provenance citations for all five capability-test questions (each now cites the chapter that argues for it: 2.2, 3, 2.4, 5, 1).
2. Rewrote Question 3 to drop the overloaded word "commitment" from the question text itself — it now reads _"Does it strengthen a person's follow-through on the promises they've already made?"_, with the Commitment-stage reference moved into the citation only.
3. Rewrote Question 4 to _"Does it improve the system's ability to design better systems for this specific person?"_ — matches Chapter 5's redefinition of learning verbatim instead of the old generic "help the system learn."

Battery result: passes Correctness, Consistency, Longevity, Operational Value, Provenance, Compression, Independence, and Substitutability. No new axioms introduced; all five items remain Level 3 (Operational Consequences) as expected for this chapter.

## Chapter 9 — approved 2026-07-19, no edits

Passed the full battery on first review. Notably, Provenance holds: "the system's presence should shrink as the user's capability grows" is not a new idea introduced here — it traces back to Chapter 1's "it stays out of the way when it isn't needed." Stays correctly at Level 3 (Operational Consequences); does not introduce a new Law or Axiom. Consistent with Law 3 (Chapter 7), which already cites this chapter as its provenance.

## Chapter 10 — approved 2026-07-19, no edits

The overlap with the front-matter Scope line is intentional, not redundant: Scope answers "what is this document," Chapter 10 answers "what happens when it conflicts with something else." Preserved as a deliberate mirror between Chapter 0 (why the document exists) and Chapter 10 (how it governs). No new principles about Commitment introduced — correctly stays meta-documentation.

## Appendix — approved 2026-07-19, one amendment

Reviewed against the full battery, with particular attention to the editorial debt logged during Chapter 8/9 work (dangling references to former Laws 8–10).

**Amendment applied:** the three "Retained" bullets that cited "— Law 8," "— Law 9," and "— Law 10" now cite "Deferred v1.1" instead. Checked each of the three concepts against every approved chapter (0–10) for independent provenance before deciding not to restore them as Laws:

- _Silence as a deliberate design tool_ — no chapter currently argues for this; Chapter 6 covers explainability of recommendations, not the value of withholding them. No provenance in the current draft.
- _Context as a permanent modifier of behavior that never touches identity_ — no chapter currently develops this distinction. No provenance in the current draft.
- _A commitment is never deleted for failing, only adapted/paused/archived_ — closest existing support is Law 6 / Chapter 2.7 (Adaptation), but neither actually argues against deletion specifically; the concept is adjacent, not covered. No independent provenance yet.

Since none of the three currently has an argued basis elsewhere in the document, restoring them as Laws now would just reproduce the original Provenance Test failure. They stay deferred (see below) rather than reinstated.

All other Appendix sections (Evolved, Intentionally Removed, Unresolved Conflicts Requiring Human Review) were checked against the fully-approved Chapters 0–10 and remain accurate and consistent — no other edits needed.

## Deferred to v1.1 (candidates)

- **Silence as a deliberate design tool, not an absence of feature.** Originally former Law 9. No chapter in the current draft argues for it independently; would need its own supporting argument (likely adjacent to Chapter 6, or as a new consideration in Chapter 2.6 Observation) before it could return as a Law.
- **Context as a permanent modifier of behavior that never touches identity.** Originally former Law 10. Would need a chapter establishing why context and identity must stay separate before it could be reintroduced.
- **A commitment is never deleted for failing, only adapted, paused, or archived with its learning intact.** Originally former Law 8. Partially adjacent to Law 6 / Chapter 2.7, but "never deleted" specifically is not argued anywhere yet. Could potentially be absorbed into Chapter 2.7 or Law 6 directly, rather than reinstated as its own Law — worth considering as an edit to Chapter 2.7 in a future revision instead of a standalone Law.
