# Documentación y Gobernanza

## Current State

This iteration is primarily a **consolidation** of documentation/governance findings already surfaced across 18 prior iterations, plus one new finding (below) that resolves an open question `docs/PROJECT_AUDIT.md` (Fase 1 of this whole effort) left unresolved.

**The Framework itself (`docs/00-framework/`) is a genuine governance success**, already established before this Architecture Review began: `THE_COMMITMENT_FRAMEWORK.md` completed a full editorial review (Chapters 0-10 + Appendix), `EDITORIAL_GUIDELINES.md` and `REVIEW_STATUS.md` exist as living process documents, and — concretely, not aspirationally — that governance already corrected three real product/architecture decisions (ADR-019/020's membrane alignment, `PRODUCT_VISION.md`'s North Star metric). This is the one area of "governance" in this entire review that is unambiguously working as designed.

**Everything else found by this review paints a different picture: real, working documentation coexisting with stale, contradicted, or duplicate documentation, with no consistent mechanism deciding which is authoritative.**

**New finding this iteration — resolves `docs/PROJECT_AUDIT.md` §7's open question about `docs/G0.1-Governance-Foundation/` and `docs/G0.2-Project-Backbone/`:**

- `docs/G0.1-Governance-Foundation/docs/00-governance/` is a **stale, byte-identical duplicate** of 6 of the 8 files in the live `docs/00-governance/` (confirmed via `diff -rq` — zero content differences on the overlapping files), missing only the 2 files added to the live copy most recently (`FOUNDATION_COMPLETION_REPORT.md`, `GOV-001_README_Engineering_Handbook.md`). It is a superseded snapshot, not a divergent second source.
- `docs/G0.2-Project-Backbone/` is **empty scaffold, never filled in** — every file is 36-386 bytes; its entire `TECH_DEBT.md` reads `"# Technical Debt\n\nCurrent debt: Low"` against the real, live root `TECH_DEBT.md`'s 2782 lines. Its own `PACK_SUMMARY.md` calls it _"Baseline operational documentation for the repository"_ — template boilerplate that was generated and never populated.
- **Both are safe to archive or delete with no information loss.** This was an open question in `PROJECT_AUDIT.md`; this iteration closes it with evidence.

## Strengths

- The Framework governance process (editorial review + living `REVIEW_STATUS.md`) is real, working, and has already demonstrably corrected drift — the strongest positive finding in this whole category.
- `TECH_DEBT.md` (root, 2782 lines) is a genuinely live, actively-maintained engineering log with dated entries through 2026-07-19, in sharp contrast to `PRODUCT_BACKLOG.md`.
- ADR discipline is real where it's been applied recently: ADR-019 through ADR-023 show a consistent, evidence-driven format (investigation → decision → explicit scope boundaries → consequences), and this review's own Iteration 16 found ADR-011 correctly anticipates and requires a governance process for exactly the kind of tech-stack pivot that happened around it — the _process_ was well-designed, even though it wasn't followed for ADR-004.

## Weaknesses

Consolidating every documentation/governance finding from Iterations 1-18, organized by pattern rather than repeated verbatim:

- **Stale documents describing rejected or superseded architecture, still presented as current:** `docs/02-domain/CONCEPTS.md`, `bounded_contexts.md`, `domain_state_machines.md` (pre-Framework vocabulary, already flagged in the Framework's own Appendix), plus `postgresql_physical_model.md`, `event_store_model.md`, `read_models.md` (describe Event Sourcing, which ADR-021 explicitly rejected — Iteration 5), plus `offline_sync_engine.md` (written for an abandoned Flutter stack, and independently incompatible with ADR-021 — Iteration 11/12). That's **7 documents**, not the 3 originally flagged before this review began.
- **A live product-vision document with materially wrong status claims:** `PRODUCT_BACKLOG.md` doesn't list Goal/Task/Habit as epics at all and marks 4 of 6 Commitment capabilities "Planned" when they're fully shipped (found in `docs/PROJECT_AUDIT.md`, predating this Architecture Review but still unresolved).
- **An ADR contradicted by what actually shipped, with no formal resolution:** ADR-004 (use Supabase) vs. the actual custom NestJS backend, with no superseding ADR despite ADR-011 requiring one (Iteration 16) — the single largest-scope ADR↔Implementation contradiction found in this review.
- **Shipped content contradicting approved decisions:** gamification/streak copy across Dashboard/Insights/Coach vs. ADR-006/ADR-010 (Iteration 9).
- **A duplicate governance-pack scaffold**, now resolved above (this iteration).
- **A stale ubiquitous-language document actively claiming "Active" status while missing 2 of 4 core aggregates** (`UBIQUITOUS_LANGUAGE.md` — Iteration 1).

## Risks

- **No consistent signal distinguishes "authoritative" from "historical/superseded" documentation.** The Framework's own Appendix does this well for the 7 documents it explicitly tracks, and `REVIEW_STATUS.md` does it well for ADR-level findings from this Architecture Review — but there is no single, repo-wide index answering "which of these ~90 markdown files is anyone supposed to trust today." A new contributor (human or AI) has no way to know this without already having done the archaeology this review did.
- **The ADR process itself (ADR-011) is sound but unenforced** — nothing in the repo (no lint rule, no CI check, no template requirement) verifies that a "Preferred Technology" change actually produced a superseding ADR before shipping. This is a process-design vs. process-enforcement gap, the documentation-governance equivalent of Iteration 8's "no lint rule against raw tamagui imports" finding.

## Technical Debt

- Archive or delete `docs/G0.1-Governance-Foundation/` and `docs/G0.2-Project-Backbone/` (this iteration's finding — zero information loss).
- Fold the 7 (not 3) stale domain/architecture documents into one explicit archival decision, extending the Framework Appendix's already-open question about its original 3.
- Rewrite `PRODUCT_BACKLOG.md` to reflect actual shipped scope and status.
- Resolve the ADR-004/ADR-011 contradiction (already logged as an Architecture-Decision-Pending item at Iteration 16).

## Recommendations

1. Treat this iteration's consolidated list as the single "documentation cleanup" work item for the eventual remediation plan — most of these are individually cheap (archive/delete/rewrite), and doing them together is more efficient than piecemeal, since several touch the same underlying "which docs are current" question.
2. Consider a lightweight, repo-wide "documentation status" convention (even just a frontmatter field or a single index file) so this kind of drift is visible going forward without requiring another full audit to rediscover it.
3. No new process is needed for ADR governance — ADR-011 already specifies the right one. What's missing is enforcement, not design; a PR template checklist item ("does this change a Preferred Technology? If so, link the superseding ADR") would close the gap cheaply.

## Priority

**Medium.** None of this is actively harmful today — a human reading carefully (as this whole review has done) can always tell the difference between current and stale. But it's exactly the kind of drift that compounds silently for future readers (human or AI) who don't have this review's context, and several of the fixes are nearly free (archival decisions, not new engineering work).
