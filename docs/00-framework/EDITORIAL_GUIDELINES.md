# Editorial Guidelines — THE_COMMITMENT_FRAMEWORK.md

These are the permanent rules for reviewing `THE_COMMITMENT_FRAMEWORK.md`. They exist so the review process survives loss of conversational context — read this file before resuming any chapter review.

## Structural constraints

- The document is frozen as **Draft v0.1**: no reorganizing chapters, no adding chapters, no reordering, no changing the table of contents.
- Every chapter must answer exactly one question (e.g. Chapter 0 — _why does this document exist?_; Chapter 1 — _what is Commitment?_; Chapter 2 — _how does transformation happen?_).
- The Appendix stays frozen until it is formally reviewed on its own pass.

## Review criteria (apply to every chapter)

1. **Correctness** — does it accurately describe the product's actual philosophy?
2. **Consistency** — does it agree with every other approved chapter?
3. **Longevity** — will it still be true in ten years, independent of current tech/UI?
4. **Operational Value** — does it actually constrain real decisions, or is it decoration?

## Editorial tests (apply in addition to the four criteria above)

- **Provenance Test** — every strong claim (a Law, a Principle, an Axiom) must trace back to an argument already made earlier in the document. If a Law/Principle introduces a genuinely new idea instead of compressing one already argued, it fails.
- **Compression Test** — if you expand a Law or Principle back out, do you recover the original argument? A Law is a compression of reasoning, not a new assertion.
- **Independence Test** — does the statement still hold if the AI, the architecture, the domain's vocabulary, or the underlying technology changes?
- **Substitutability Test** — if a concrete example is swapped for an equivalent one, does the argument still hold? If not, the example is too tightly coupled to the current domain and should be generalized or flagged.

## Conceptual hierarchy

Maintain exactly three levels. Never promote a lower level into a higher one without explicit, deliberate justification.

**Level 1 — Axioms.** Very few, cross-cutting, load-bearing everywhere. Current axioms:

- _The user owns the intention. The system owns the representation._ (Chapter 4)
- _The AI proposes; it does not enact._ (Chapter 5)
- _A Blueprint is intentionally independent of its implementation._ (Chapter 3)

Do not add new axioms except by explicit, deliberate decision — the bar is intentionally high.

**Level 2 — Principles.** Develop and argue for the axioms (e.g. Chapter 7's Laws, Chapter 8's capability test).

**Level 3 — Operational Consequences.** Practical criteria for UX, product, and architecture decisions. Never let an operational consequence get promoted to axiom status just because it's frequently cited — if it can be derived from an existing axiom/principle, it stays a consequence.

## Framework vs. architecture

This document defines **purpose, philosophy, principles, and boundaries only.**

It must never contain: storage decisions, embeddings, databases, specific models, or any other implementation detail. All of that belongs in ADRs (`docs/03-architecture/`), not here. When a review surfaces an implementation question, defer it explicitly to architecture rather than answering it in this document.

## Standing philosophy (do not relitigate without cause)

The system translates, designs, explains, and maintains continuity of understanding. It never substitutes for the user's own agency. See Chapter 5 ("AI proposes; it does not enact") and Chapter 4 (membrane, not bridge).

## Deferred items

Content that fails the Provenance Test (or otherwise doesn't survive review) is not deleted outright — it is moved to a **Deferred v1.1** list in `REVIEW_STATUS.md`, as a candidate for a future revision, with a note on why it was deferred. Do not silently drop reviewed-out content without recording it there.
