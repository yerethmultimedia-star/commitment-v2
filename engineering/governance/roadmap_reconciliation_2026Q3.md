# Roadmap Reconciliation Report — 2026 Q3

Version: 1.5.0
Status: Decision Made — Route B Adopted (ADR-015); Governance Docs Synced
Owner: Architecture Review Board
Date: 2026-07-12

---

## Purpose

The governance documents (`ROADMAP.md`, `PROJECT_STATUS.md`, `ENGINEERING_BOARD.md`) have not
been updated since **2026-07-08**, the day VS-025 landed. The repository contains commits labeled
as work corresponding to multiple planned sprints after the governance documents were last
updated, and one of those labels (`VS-031`) collides with a slot the roadmap had already reserved
for different work. This report separates **what the roadmap says** from **what the repository
actually contains**, so that decisions get made explicitly instead of by omission.

This report does not close any sprint and does not modify `ROADMAP.md`, `PROJECT_STATUS.md`, or
`ENGINEERING_BOARD.md`. It is the input to that decision, not the decision itself.

---

## 1. Documented Roadmap State (as of 2026-07-08, unchanged since)

From `ROADMAP.md` v1.4.0:

| Sprint | Roadmap Label                   | Roadmap Status |
| :----- | :------------------------------ | :------------- |
| VS-024 | Activity History & Auditing     | Completed      |
| VS-025 | Dashboard Experience Foundation | **Active**     |
| VS-026 | Theme Engine Foundation         | Planned        |
| VS-027 | Experience Themes               | Planned        |
| VS-028 | Widget Registry                 | Planned        |
| VS-029 | Motion System                   | Planned        |
| VS-030 | Accessibility & Polish          | Planned        |
| VS-031 | **Search / Filters**            | Planned        |
| VS-032 | Calendar                        | Planned        |
| VS-033 | Reminder Settings               | Planned        |
| VS-034 | Recurrence Management           | Planned        |
| VS-035 | Offline First & Sync            | Planned        |

`PROJECT_STATUS.md` v1.10.0 and `ENGINEERING_BOARD.md` v1.2.0 both mirror this: "Active Sprint:
VS-025", last touched the same day.

---

## 2. Observed Repository State (Git History Evidence)

Commits that self-label a `VS-0XX` sprint, in chronological order:

| Commit                          | Date       | Message                                                                                                                              | Implies                                                     |
| :------------------------------ | :--------- | :----------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| `cc8b6ed`                       | 2026-07-08 | feat(dashboard): implement VS-025 dashboard experience foundation and finalize governance freeze                                     | VS-025 self-labeled as complete                             |
| `fe279de`                       | 2026-07-09 | feat(theme-engine): implement framework-agnostic theme engine foundation (VS-026)                                                    | VS-026 self-labeled as complete                             |
| `74f75ec`                       | 2026-07-09 | feat(appearance): implement VS-027 Experience Themes with snapshot crossfade                                                         | VS-027 self-labeled as complete                             |
| `29d3bda`                       | 2026-07-09 | refactor(i18n): apply strict localization rules to widgets and appearance settings (VS-028 complete)                                 | VS-028 self-labeled as complete                             |
| `64de8d0`…`2bf3177` (8 commits) | 2026-07-09 | feat(vs-030): complete phase 1 / tracks 2.0–2.3.9 (interaction foundation, typography, layout, scroll, modal/portal, keyboard/focus) | Individual tracks self-labeled as complete — see note below |
| `7a49e0d`                       | 2026-07-12 | feat(mobile): implement Dashboard engine layer — Block A (**VS-031**)                                                                | Labeled VS-031, scope = Dashboard Engine                    |

**VS-029 ("Motion System" per roadmap): zero commits found.** Searched commit messages for
`VS-029`, `motion`, `animation`, `entrance`, `transition` — no match tied to this sprint. Work
went from VS-028 straight to commits labeled `vs-030`. Whether Motion System was folded into
VS-030's scope, skipped, or simply never labeled is **unverified** — not asserted either way here.

**VS-030 scope check:** the roadmap describes VS-030 as "Accessibility & Polish" (VoiceOver,
Dynamic Type, Large Fonts, Reduced Motion per `PROJECT_STATUS.md`'s Track D). The 8 commits
labeled `vs-030` describe interaction foundation, typography primitives, layout primitives,
safe-area/scroll, modal/portal, and keyboard/focus management — none of the commit messages use
the roadmap's own vocabulary (VoiceOver, Dynamic Type, Reduced Motion, Accessibility). This does
not mean that work is absent from the implementation — it means **the commit message alone is not
sufficient evidence to demonstrate it**. Confirming this requires reading the actual code (or
running an accessibility audit), not just the git log. **Not verified in this pass** — flagged
for the eventual VS-030 Completion Report, not resolved here.

**Addendum — a frozen plan does exist for VS-025 through VS-030:**
`docs/03-architecture/adr_014_activity_history_recommendations.md`, §6 ("Estrategia de Entrega"),
approved and marked "DOCUMENTO CONGELADO OFICIALMENTE," defines acceptance-level scope for each
of VS-025–VS-030, including VS-029 ("Motion System: animaciones de entrada compartidas,
transiciones de widgets y microinteracciones") and VS-030 ("soporte avanzado de lectores de
pantalla, fuentes dinámicas avanzadas y optimización final de UX"). This was missed in the first
pass of this report — §1 above only checked `ROADMAP.md`/`PROJECT_STATUS.md`, not
`docs/03-architecture/`. **ADR-014 does not mention VS-031** at all; its transition roadmap stops
at VS-030, so it has no bearing on the VS-031 collision in §3. It does, however, raise "Sprint
scope" confidence in §5 from Medium to **High** for VS-025–VS-030 specifically — a real spec
exists to check against, even though nobody has done that check yet (which is why "Sprint
completion" stays Low/Unknown).

---

## 3. The VS-031 Collision

- `ROADMAP.md` reserves **VS-031 = Search / Filters**, status "Planned" — never started per any
  commit evidence found.
- Commit `7a49e0d` labels itself **VS-031 = Dashboard Engine, Block A** (`DashboardLayoutEngine`,
  `RecommendationEngine`, integration layer, i18n, tests).
- **No document anywhere in the repository** (`ROADMAP.md`, `PROJECT_STATUS.md`,
  `ENGINEERING_BOARD.md`, `engineering/specifications/`, `engineering/tasks/`, `docs/`) records a
  decision to reassign the VS-031 slot. The only trace of "Block A" is the commit message itself
  and two code comments that reference it.
- **No evidence of a Block B, C, or later** exists anywhere in git history (`git log --all` finds
  no further commits referencing VS-031 besides `7a49e0d` and the CI-fix commit `0f53f92`, which
  doesn't add scope).

This is a genuine numbering collision, not a documentation typo — two unrelated feature sets
currently claim the same sprint number.

---

## 4. Documentation Staleness

All three governance docs were last edited on **2026-07-08**, the same day `cc8b6ed` (VS-025)
landed — and have not been touched since, despite five more labeled sprints' worth of commits
(VS-026 through VS-031, spanning 2026-07-09 to 2026-07-12). None of VS-025 through VS-031 are
marked "Completed" anywhere in governance docs; all still read "Active Sprint: VS-025."

---

## 5. Repository Confidence

How much weight each section of this report can bear, so the reader can tell evidence apart from
inference:

| Area                                                                                  | Confidence | Basis                                                                                                 |
| :------------------------------------------------------------------------------------ | :--------- | :---------------------------------------------------------------------------------------------------- |
| Git history                                                                           | High       | `git log` is authoritative and was queried directly                                                   |
| Commit chronology                                                                     | High       | Commit dates are recorded by git, not self-reported                                                   |
| Roadmap state (as written)                                                            | High       | Direct read of `ROADMAP.md`/`PROJECT_STATUS.md`/`ENGINEERING_BOARD.md`                                |
| Sprint scope — VS-025–VS-030                                                          | High       | A frozen spec exists (ADR-014, §6) to check against                                                   |
| Sprint scope — VS-031                                                                 | Medium     | No frozen spec exists; inferred from commit message and diffs only                                    |
| Sprint completion (fitness for the roadmap's stated goals)                            | Low        | Commit self-labeling is not verification (see §2 VS-030 note)                                         |
| Product planning intent (why VS-031 was reused)                                       | Unknown    | No document or ADR records this decision anywhere                                                     |
| Implementation completeness (does the code satisfy the roadmap's acceptance criteria) | Unknown    | Not yet audited — distinct from "Low": this hasn't been checked at all, not checked-and-found-wanting |

---

## 6. Decision — Route B Adopted (ADR-015)

Two routes were discussed:

**Route A:** Preserve the original roadmap numbering. `VS-031` stays reserved for Search / Filters
(untouched, still Planned). The Dashboard Engine work gets renumbered outside the regular VS
sequence — e.g. `VS-030.1` or a labeled technical/architecture sprint — so the public roadmap
sequence never had a collision in the first place.

**Route B:** Formally reprioritize. Write an ADR stating VS-031 is reassigned from Search/Filters
to "Product Experience Foundation" (Dashboard Engine), and Search/Filters moves to a later slot.
This must be written down explicitly in `DECISION_LOG.md` as a new ADR — not left implicit.

**Decision: Route B.** Formalized in
[ADR-015](../../docs/03-architecture/adr_015_roadmap_reprioritization.md): `VS-031` is
reassigned to "Product Experience Foundation"; Search / Filters is reprogrammed to **VS-036**
(after VS-035, rather than displacing VS-032–VS-035). Rationale: the repository already contains
work developed, tested, and committed under the VS-031 label — renumbering it retroactively would
create a permanent mismatch between commits, task files, and walkthroughs, requiring equivalences
to be maintained indefinitely. A single ADR is cheaper than that ongoing cost.

---

## 7. What Happened Next

1. ✅ `ROADMAP.md`, `PROJECT_STATUS.md`, `ENGINEERING_BOARD.md` updated to mark VS-025–VS-028 and
   VS-030 as Completed (self-labeled), leave VS-029 Planned, and set VS-031 (Product Experience
   Foundation) as the Active priority, per ADR-015.
2. ✅ ADR-015 (Roadmap Reprioritization) and ADR-016 (Sprint Governance Rules) logged in
   `DECISION_LOG.md`.
3. ⏳ Completion Report for VS-031 — see `engineering/governance/vs031_completion_report.md`,
   generated using `engineering/templates/slice-closure.md`, explicitly noting per §3 that no
   frozen specification for "Block A" (or any further block) was found in the repository.

---

## 8. Standing Governance Rules — Adopted (ADR-016)

Discovered during this reconciliation: the architecture and code have been evolving faster than
the governance documents that are supposed to track them. Three standing rules were proposed to
prevent this specific failure mode from recurring, and were formally adopted in
[ADR-016](../../docs/03-architecture/adr_016_sprint_governance_rules.md):

1. **No sprint may be considered closed until, in the same change, at least these documents are
   updated:** `ROADMAP.md`, `PROJECT_STATUS.md`, `ENGINEERING_BOARD.md`, `walkthrough.md`,
   the sprint's task file, and `slice-closure.md`-derived completion report (when applicable).
2. **A sprint number may not be reused or reassigned without a recorded ADR or governance
   decision.** This single rule would have prevented the VS-031 collision documented in §3.
3. **Sprint Freeze.** A sprint enters the **Frozen** state once its scope, identifier, and
   acceptance criteria have been approved. After that point, its identifier and scope may only
   change through a recorded ADR or equivalent governance decision.

Rule 3 implies a fuller sprint lifecycle than the current three states (`Planned` / `Active` /
`Completed` used in `ROADMAP.md`):

| State      | Meaning                                                                         |
| :--------- | :------------------------------------------------------------------------------ |
| Proposed   | Initial idea; scope can still change freely.                                    |
| Planned    | A preliminary plan exists, but scope can still be adjusted.                     |
| **Frozen** | Scope, numbering, and acceptance criteria approved; any change requires an ADR. |
| Active     | Implementation in progress.                                                     |
| Completed  | Implementation finished and verified.                                           |
| Closed     | Completion Report approved, documentation synchronized, governance updated.     |

Separating **Completed** from **Closed** matters: this reconciliation exists precisely because
VS-025–VS-031 have code that was self-labeled complete (arguably `Completed`) while never having
been `Closed` — governance was never synchronized. Under this model, that gap becomes visible
instead of silent.

Logged as their own ADR in `DECISION_LOG.md` (ADR-016), not left as a paragraph in this
reconciliation report.

---

## 9. Outstanding Decisions

1. ✅ **Resolved.** Route A vs Route B for the VS-031 numbering conflict (§6) — Route B adopted
   via ADR-015. Search/Filters reprogrammed to VS-036.
2. ⏳ **Still open.** Whether VS-030 satisfies the roadmap's acceptance criteria (§2, VS-030 scope
   check) — requires source inspection or an accessibility audit, not just git log evidence.
3. ✅ **Resolved.** Governance documents were reconciled immediately (§7) rather than waiting for
   the VS-031 Completion Report, since ADR-015 made the numbering decision independent of whether
   VS-031's scope is itself complete.

---

## 📜 Change History

- **v1.5.0 (2026-07-12):** Decision made — Route B adopted via ADR-015 (VS-031 → Product
  Experience Foundation; Search/Filters → VS-036). ADR-016 adopted the three standing rules from
  §8. `ROADMAP.md`, `PROJECT_STATUS.md`, `ENGINEERING_BOARD.md` updated accordingly. §6, §7, §8,
  §9 updated to reflect the decisions made; item 2 of §9 (VS-030 acceptance criteria) remains
  open pending a source-level audit.
- **v1.3.0 (2026-07-12):** Added addendum to §2 noting `ADR-014` is a frozen, approved plan for
  VS-025–VS-030 (missed in the original pass, which only checked `ROADMAP.md`/`PROJECT_STATUS.md`
  and not `docs/03-architecture/`); split §5's "Sprint scope" row by sprint range accordingly;
  added the Sprint Freeze rule and the Proposed→Planned→Frozen→Active→Completed→Closed lifecycle
  to §8.
- **v1.2.0 (2026-07-12):** Renamed §2 to "Git History Evidence" to distinguish it from future
  source-inspection evidence; added "Implementation completeness = Unknown" to §5 (distinct from
  "Low" — not yet audited, not audited-and-found-wanting); added §9 Outstanding Decisions.
- **v1.1.0 (2026-07-12):** Precision pass — replaced "shipped"/"done" language with
  "self-labeled as complete" to avoid implying official closure; added explicit caveat that the
  VS-030 commit messages don't use the roadmap's own accessibility vocabulary; neutralized the
  Route A/B recommendation into a governance decision; added §5 Repository Confidence and §8
  Proposed Standing Governance Rules.
- **v1.0.0 (2026-07-12):** Initial reconciliation report — documents the VS-025–VS-031
  discrepancy between `ROADMAP.md` and actual commit history, and the VS-031 numbering collision
  with Search/Filters. No decision made yet.
