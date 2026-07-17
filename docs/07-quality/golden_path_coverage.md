# Golden Path Coverage

A governance indicator, not a QA metric. Tracks how much of the product's core experience has a
living, executable specification (a Golden Path — see `docs/07-quality/golden_path_*.md`) proving
the primary flow still works — independent of whether that spec is run manually or automated.

Established 2026-07-17, closing the ADR-019 / Product Polish "Commitment vs. Task" arc, on the
observation that this project had never tracked "does the primary experience still work" as its
own explicit, visible thing — only implied it via ad hoc audits.

## How to read this table

- **Status** — does a Golden Path doc exist for this flow, and has it last run clean?
  - ☐ — no Golden Path doc yet.
  - ⏳ — doc exists, implemented, pending its first end-to-end run (manual or automated).
  - ✅ — last run completed with no findings.
- **Execution** — how the walkthrough is currently run. Starts at `Manual` for every entry; moves
  to `Automated` once converted to a real spec (Playwright or equivalent), then to `CI` once that
  spec runs on every relevant PR. This column is expected to evolve independently of Status — a
  path can be ✅ and still `Manual` for a long time before anyone automates it.

| Golden Path         | Doc                                  | Status               | Execution |
| ------------------- | ------------------------------------ | -------------------- | --------- |
| Commitment Creation | `golden_path_commitment_creation.md` | ✅ PASS (2026-07-17) | Manual¹   |
| Goal Creation       | _(not yet written)_                  | ☐                    | —         |
| Task Completion     | _(not yet written)_                  | ☐                    | —         |
| Habit Check-in      | _(not yet written)_                  | ☐                    | —         |
| Quick Capture       | _(not yet written)_                  | ☐                    | —         |

¹ Last run used an ad hoc Playwright/Chromium script (installed on the fly, not committed to the
repo) rather than a manual click-through or a checked-in spec. Kept as `Manual` under this table's
strict definition of `Automated` (a real spec living in the repo), but worth noting Playwright
_is_ viable in this environment — installing it for real (`@playwright/test` as a dependency, a
committed spec, optionally CI) is now a concretely lower-effort option than it looked before this
run, should the project want to graduate this entry to `Automated`.

## Maintenance rule

Update this table in the same change that adds, runs, or automates a Golden Path — never let it
drift out of sync with the actual docs in this folder. When a new `golden_path_*.md` is written,
add its row here immediately, even if its Status starts at ☐/⏳. When
`golden_path_commitment_creation.md` (or any other) runs clean for the first time, flip its Status
to ✅ and cross-reference the run in the relevant `TECH_DEBT.md` item's change history.
