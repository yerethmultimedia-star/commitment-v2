# The Commitment Framework

**Status:** Draft v0.1 — Editorial Review Complete. Not yet frozen as v1.0 pending resolution of the Deferred v1.1 items recorded in `REVIEW_STATUS.md`.
**Scope:** This document is the highest-level statement of what Commitment is and why it exists. Once frozen at v1.0, nothing in this repository — brand, architecture decisions, product requirements, or code — should contradict it. Where something does, the contradiction is the thing that must change.

---

## 0. Why This Document Exists

A product accumulates decisions faster than it accumulates clarity about why those decisions were made. Left alone, this produces drift: each choice reasonable on its own, the sum incoherent. The way to prevent drift is not to write more rules — it is to write down, once, in language stable enough to survive changes of technology, interface, and team, what the product is _for_. Every other document in this repository answers a narrower question. This one answers the question underneath all of them.

This document does not describe features. It describes the belief system a feature must be consistent with in order to belong here.

It is written to still be true in ten years, regardless of what AI models, interfaces, or platforms exist by then.

---

## 1. What Commitment Is

Commitment is not a task manager. It is not a habit tracker. It is not a goal tracker. It is not a conversational assistant.

Each of those is a tool for managing a list. Commitment is not in the business of managing lists. It is in the business of helping a person become someone they are not yet.

**Commitment is a Personal Growth Operating System.**

An operating system does not perform the work itself; it provides the structure inside which work can happen reliably, and it stays out of the way when it isn't needed. That is the right model here. Commitment does not live a person's life for them. It gives their intentions a durable, adaptive structure to live inside — one that bends under real-world pressure instead of breaking, and that remembers what was learned instead of discarding it.

**The system is the product. The interface is only one way to interact with it.** Today that interface is largely conversational; tomorrow it may be voice, or something not yet invented. None of that changes what Commitment is — it only changes how a person reaches it.

Most software in this category asks, every day: _"What should I do today?"_ That is a scheduling question, and answering it well produces, at best, an efficient person. Commitment asks a different question, and treats the scheduling question as subordinate to it:

**"Who do I want to become?"**

Everything else in this document follows from taking that question seriously as the actual product.

---

## 2. The Transformation Model

Personal transformation is not a single event; it is a journey with a repeatable shape. Commitment models that journey explicitly, as eight stages. A person — or a single intention — moves through this journey more than once over a lifetime; the model is a loop with an exit, not a line with an end.

```
Intention
   ↓
Understanding
   ↓
Blueprint
   ↓
Commitment
   ↓
Execution
   ↓
Observation
   │
   ├─ plan still fits ─────────────→ back to Execution
   ├─ plan no longer fits ─→ Adaptation ─→ back to Execution
   └─ intention fulfilled ─────────→ Transformation
```

This shape does not change with scale. It is the same journey whether the intention is small — _"send the difficult email I've been avoiding"_ — or large — _"become a physician,"_ _"build a company that outlives me."_ A small intention can move through all eight stages in days. A large one may take years, with many smaller loops of Execution, Observation, and Adaptation nested inside a single pass through Commitment. The stages don't change. Only their duration does.

### 2.1 Intention

**Purpose.** Capture the raw impulse toward change before it is judged, structured, or lost.

**Why it exists.** Most tools demand structure at the exact moment a person is least able to provide it — the moment an intention first forms. Demanding a title, a deadline, and a category from a half-formed wish kills more intentions than any lack of willpower does.

**Expected outcome.** An intention that has been heard and held, in whatever words the person used for it, unaltered and unjudged.

**Transition.** An intention becomes worth exploring the moment it has been acknowledged. It moves to Understanding.

### 2.2 Understanding

**Purpose.** Replace assumption with comprehension. Find out what this intention actually means for this specific person, given their history, their constraints, and who they are already trying to become.

**Why it exists.** Generic advice fails predictably, not randomly — it fails because it was built for nobody in particular. An intention like "get healthier" means something different for someone recovering from illness than for someone training for a competition. Skipping this stage is the single most common reason plans don't survive contact with a real life.

**Expected outcome.** A clear, examined articulation of what change actually means here — not yet a plan, but a plan can now be built on it honestly.

**Transition.** Once an intention is understood, it is ready to be given an executable shape. It moves to Blueprint.

### 2.3 Blueprint

**Purpose.** The design of the system: a proposed structure of aims, a suggested rhythm, a first set of practices. A Blueprint can be changed freely, discarded entirely, or rebuilt from scratch — because nothing about it is real yet, and revising it costs nothing.

**Why it exists.** A system must first be designed before it can be consciously adopted — design and adoption are different kinds of acts, and collapsing them denies a person the chance to react to the whole plan before any part of it binds them. Chapter 3 expands on why Blueprint must precede Commitment.

**Expected outcome.** A complete, legible, adjustable proposal the person can see in full — still only a design, not yet a decision.

**Transition.** The person reviews the design and decides whether to adopt it. If they approve, it moves to Commitment.

### 2.4 Commitment

**Purpose.** The decision to adopt the system: the moment a design stops being a hypothesis and starts being a promise. This is where the psychological weight enters — not before.

**Why it exists.** A promise made consciously is kept differently than a default accepted passively. This stage exists so that becoming real is always a deliberate decision, never a side effect of having answered enough onboarding questions — and so the responsibility of holding a promise is never confused with the reversible work of designing one.

**Expected outcome.** A live system, instantiated from the approved Blueprint, that the person now owns and is accountable to.

**Transition.** A system that has been adopted must be lived inside. It moves to Execution.

### 2.5 Execution

**Purpose.** The ordinary, daily reality of acting inside the system — doing the things, marking them done, making progress.

**Why it exists.** This is where a plan meets a life. No plan survives that contact unchanged; execution is not a formality between planning and success, it is the test the rest of the model exists to support.

**Expected outcome.** Real behavior. Real data. Real friction, where it happens.

**Transition.** Execution produces signal, and signal must be noticed. It moves to Observation.

### 2.6 Observation

**Purpose.** Notice, without judgment, what is actually happening: completion patterns, friction, momentum, silence, and the gap — if any — between the plan and the behavior. Observation is a point of evaluation, not a single fixed path forward — what it finds determines which of several things happens next.

**Why it exists.** Adaptation without observation is guesswork. Intervention without evidence is nagging. This stage exists specifically to make sure neither happens.

**Expected outcome.** An accurate, evidence-grounded picture of how the system is actually going, distinct from how it was assumed to be going.

**Transition.**

- If the plan still fits and progress is ongoing, execution simply continues.
- If the plan no longer fits the person's present reality, it moves to Adaptation.
- If the underlying intention has genuinely been fulfilled, it moves directly to Transformation — there is nothing left to adapt.

### 2.7 Adaptation

**Purpose.** Reshape the system to fit the person's present reality, without discarding the underlying intention or the commitment already made.

**Why it exists.** Rigid plans break. When a plan is rigid, the alternative to a plan that bends is a person who breaks instead. This stage exists so the system is always the thing that gives way first.

**Expected outcome.** A revised system, still owned by the person, that actually fits where they are now.

**Transition.** Once reshaped, the system returns to Execution — the loop continues, sometimes several times, until Observation finds either a plan that holds or an intention that has run its course.

### 2.8 Transformation

**Purpose.** This is not a feature. It is the actual outcome the entire model exists to produce: the intention from stage one has become durable change in who the person is.

**Why it exists.** Because it is the point. Every other stage is instrumental to this one.

**Expected outcome.** Evidence — accumulated over time, not asserted once — that the person is different than they were. Sometimes this means the person no longer needs Commitment for this particular intention. Sometimes it means the intention itself has evolved into a new one, and the journey begins again, at a higher level than before.

---

## 3. The Blueprint

The Blueprint deserves its own chapter because the decision it encodes is easy to get backward.

The intuitive design is: a person expresses an intention, and the system immediately turns it into concrete structures that can be executed and tracked. This is backward. It treats designing and materializing as the same act. They are not.

**A Blueprint is a proposed, executable personal system that does not yet exist as anything the person is bound to.** It is a design, not a decision. Only after the person reviews and approves a Blueprint does the system decide how to materialize it into whatever it actually needs to track and execute.

This separation exists for three reasons:

1. **Design should be reversible; commitment should not be casual.** If the plan is materialized immediately, "adjusting the plan" means editing or removing things that already claim to be real. If the plan is a proposal first, adjusting it before commitment is just — revising a draft.
2. **A person needs to react to the whole plan, not approve it one piece at a time.** A Blueprint is legible as a single, complete object: a person can look at the whole shape of what's being proposed and say "that's not quite right" before any part of it is real, instead of discovering after the fact that the pieces don't add up to what they meant.
3. **The moment something becomes real should be a deliberate moment, not a side effect.** Chapter 2.4 depends on this. If Commitment is to mean anything, the transition into it has to be visible and chosen, not something that already happened three screens ago without anyone noticing.

A Blueprint that is never approved is not a failure. It is the system working correctly — a plan the person didn't actually want was caught before it could cost them anything.

**A Blueprint is intentionally independent of its implementation.** Only after it has been consciously adopted does the system decide how to materialize it. What it is called is Chapter 4's question, not this one.

---

## 4. User Language vs. Domain Language

Users do not think in the vocabulary of a data model. Nobody, describing what they want out of their own life, says "I'd like to create a Goal with two linked Habits and a Commitment." They say things like _"I want to finally get in shape,"_ or _"I want to stop feeling behind on my own life,"_ or _"I want to become the kind of person who finishes what they start."_

This is not a copywriting detail. It is a structural fact about where two different vocabularies belong, and who speaks which one.

**Users speak in aspirations. That is the only language Commitment should ever require of them.**

The current domain expresses that structure through concepts such as Goal, Commitment, Habit, and Task. Those concepts are implementation choices, not part of the user's mental model. A domain model earns its right to use precise, stable, technical nouns internally precisely _because_ it is not the surface the person interacts with. Vocabulary that needs to be unambiguous for a system to reason about correctly, and vocabulary that needs to feel natural for a person describing their own life, are different jobs. They do not need to be done by the same words.

**The user owns the intention. The system owns the representation.**

Between the two sits a membrane, not a bridge. A bridge assumes both sides should eventually behave as one. A membrane assumes both sides remain fundamentally different while allowing meaningful exchange — each keeps its own nature intact, and only what matters actually crosses. The AI is that membrane. Working through Understanding and Blueprint (Chapters 2.2–2.3), it is the AI's job to take an aspiration and translate it into a structure the system can hold — and, just as importantly, to translate the system's state back into language a person would actually use, never surfacing raw domain vocabulary as something the user is expected to understand or manage directly.

If a person ever has to learn what a "Goal" is, as distinct from a "Commitment," in order to use the product — the membrane has failed at that point, regardless of how correct the underlying model is.

---

## 5. The Role of AI

**AI is not the product. AI is the architect.**

This distinction matters more than it sounds. A product built _around_ an AI treats the AI as the main event — the thing the person is there to talk to. Commitment is not that. The person is there to change. The AI's job is to make that change more achievable, by doing the structural work a good architect does for a client: understanding the brief, proposing a design, explaining the reasoning, and revising when circumstances change — while the client decides what actually gets built.

The membrane described in Chapter 4 and the architect described here are the same intelligence, viewed through different responsibilities. One preserves the boundary between human language and system language; the other designs the system that bridges intention and transformation.

The AI's responsibilities:

- **Understanding** — doing the work of Chapter 2.2, genuinely, not performing comprehension while running a fixed script.
- **Reasoning** — connecting an intention to a workable structure using the specifics of this person's situation, not a generic template.
- **Proposing** — producing Blueprints (Chapter 3) and, later, adaptations, as concrete, inspectable proposals.
- **Explaining** — see Chapter 6. Every proposal comes with its reasoning attached, not just its conclusion.
- **Adapting** — doing the work of Chapter 2.7 when observation shows the plan no longer fits.
- **Learning** — accumulating understanding of this person across their whole history with the system, not re-deriving it from zero each time. Commitment learns only what helps it design better systems for this person: never to profile them, never out of curiosity, never simply because it can. This is continuity of understanding, not model training — how that continuity is stored or implemented is a question for architecture, not for this document.

**The user always retains final authority.** The AI proposes; it does not enact. Every Blueprint, every adaptation, every structural change to a person's system requires that person's approval before it becomes real. This is not a permissions setting that could someday be relaxed for convenience — it is the boundary that keeps the AI an architect instead of an occupant of someone else's life.

---

## 6. Explainability

An unexplained recommendation is an instruction. An explained one is an offer. Commitment only ever makes offers.

Every recommendation the AI produces — a Blueprint, an adaptation, a suggested next step — must be traceable to observable evidence: what the person did, didn't do, said, or asked for. Not to an implicit assumption about what the AI thinks the person should want. If the reasoning behind a recommendation cannot be stated plainly, the recommendation should not be made yet.

This is a stronger commitment than "the AI should be able to answer if asked." The reasoning should be available _by default_, as part of the offer itself — a person should never have to interrogate the system to find out why it suggested something.

---

## 7. The Laws of Commitment

These are the immutable principles. Everything else in this document, and everything built on top of it, is negotiable in its specifics. These are not.

**Law 0 — Technology is never the product.**
Whatever technology Commitment is built on today will be replaced. The transformation it enables is what must survive that replacement. Chapter 5 makes this concrete for AI specifically — "AI is not the product" — and this law generalizes it to whatever technology comes next. Any decision justified primarily by "because the technology makes it easy" rather than "because it serves transformation" should be treated with suspicion.

**Law 1 — Every aspiration must become a system before it becomes actions.**
Jumping straight from intention to a list of things to do skips the work that makes the list survive contact with a real life. Chapters 2 and 3 exist to enforce this law structurally, not just as a suggestion.

**Law 2 — Users express intentions. Commitment designs strategies. Users decide. Users execute, supported by the system.**
Two parties, four distinct roles, and neither may absorb the other's. Chapters 2, 4, and 5 establish this together: the AI proposes but does not decide (Chapter 5), the system holds the representation but never the intention itself (Chapter 4), and execution belongs to the person — never taken over on their behalf (Chapter 2.5).

**Law 3 — The plan is never the objective. Transformation is.**
A completed plan that produced no lasting change is not a success story. An abandoned plan that left the person meaningfully different is not a failure. Chapter 9 exists because most software gets this law backward by default.

**Law 4 — AI amplifies human judgment. It never replaces it.**
Amplification means the person ends up more capable of deciding well than they were alone. Replacement means they end up dependent on the system to decide for them. Only the first is acceptable, in any circumstance. Chapter 5 exists to argue this in full.

**Law 5 — Every recommendation must be explainable through observable evidence.**
See Chapter 6. This law has no exceptions for convenience, speed, or a recommendation that "obviously" makes sense.

**Law 6 — Systems evolve.**
A Blueprint approved once is not a life sentence. The specific structure serving a person today is expected to change as they do; what must not change is the underlying commitment to who they are becoming. Chapter 2.7 exists to make evolution a normal, expected event rather than a sign that something went wrong.

**Law 7 — Clarity precedes action.**
A person should never be asked to act on a plan they don't understand, or to trust a recommendation they can't see the reasoning for. If clarity and momentum are ever in tension, resolve it in favor of clarity — false momentum is not real progress. Chapters 3 and 6 exist to guarantee both halves of this: a legible plan before commitment, and a visible reason behind every recommendation.

---

## 8. Principles — The Test Every Capability Must Pass

Before any capability is added to Commitment, it should be able to answer these questions clearly:

1. **Does this help the user understand what they truly want?** (Chapter 2.2 — Understanding.)
2. **Does it help design a better personal system?** (Chapter 3 — The Blueprint.)
3. **Does it strengthen a person's follow-through on the promises they've already made?** (Chapter 2.4 — Commitment.)
4. **Does it improve the system's ability to design better systems for this specific person?** (Chapter 5 — The Role of AI.)
5. **Does it move the user closer to becoming who they want to become?** (Chapter 1 — What Commitment Is.)

If a proposed capability cannot answer at least one of these with a genuine, specific yes — not a vague, aspirational one — it probably does not belong in Commitment, regardless of how well-built or how technically impressive it is.

---

## 9. Success Metrics

Commitment explicitly rejects treating completed tasks, unbroken streaks, or habit-tracking consistency as the primary measure of its own success. These are useful signals of activity. They are not evidence of transformation, and a product that optimizes for them will, predictably, produce more activity and no more transformation than before.

**Transformation is the real measure of success**, and it is necessarily slower and harder to observe than a completion count. In practice, this means watching for:

- Whether a person's Blueprints, over time, increasingly reflect their own stated values rather than generic defaults.
- Whether adaptation (Chapter 2.7) is something people use readily, rather than something they avoid out of guilt.
- Whether the system's presence in a person's life shrinks as their capability grows — a person needing Commitment less over time, for a specific intention, is the system succeeding at that intention, not losing a user.
- Whether the person's own account of who they are becoming, examined over a long horizon, actually changed.

A single number cannot capture this well, and the temptation to substitute one that can — a streak, a completion rate, a score — should be treated as exactly that: a temptation, not a solution. Where operational metrics like completion rates are genuinely useful (and they are, for diagnosing where a specific plan is struggling), they belong at the Execution and Observation stages of Chapter 2, as instruments — never at the top of this document, as the goal.

---

## 10. How This Document Should Be Used

This is not a checklist to consult occasionally. It is the standard against which every other document — brand, architecture decisions, product requirements, and code — should be judged, once this draft is frozen at v1.0.

When a lower-level document and this one appear to conflict, the conflict is a signal, not a technicality to route around. Either the lower-level document is wrong and should change, or this document has missed something real about what Commitment has become, and this document should change — deliberately, in the open, through the same review process that produced it, not by quiet drift.

This document is expected to be revisited. It is not expected to be revisited casually.

---

## Appendix — Migration From Prior Foundational Documents

Before this draft was written, four earlier documents were read in full: `commitment_constitution.md`, `commitment_behavioral_principles.md`, `commitment_navigation_philosophy.md`, and `commitment_experience_principles.md` (all in `docs/01-product/`), along with `north_star.md`, `docs/02-domain/canonical_dictionary.md`, and `docs/02-domain/UBIQUITOUS_LANGUAGE.md`. All were committed within the project's first three days (2026-07-02 to 2026-07-04), before almost any of the domain that actually shipped — Task's full lifecycle, Habit, the Reminder Engine, Insights, Quick Capture — existed. They were treated as historical design inputs, not as authoritative specifications, per instruction. This appendix records what happened to their content.

### Retained

- Reconstructing self-trust as the actual product, not productivity (`commitment_behavioral_principles.md` §1) — this is essentially Chapter 1's reframe.
- Silence as a deliberate design tool, not an absence of feature (`commitment_behavioral_principles.md` §7, `commitment_navigation_philosophy.md`) — Deferred v1.1 (no chapter in this draft currently argues for it independently; see `REVIEW_STATUS.md`).
- The anti-nagging principle: intervention requires evidence, not just low activity (`commitment_behavioral_principles.md` §6) — folded into Chapter 6 and Law 5.
- Context as a permanent modifier of behavior that never touches identity (`commitment_behavioral_principles.md` §5) — Deferred v1.1 (no chapter in this draft currently develops this distinction; see `REVIEW_STATUS.md`).
- The "imperfect user" principle: minimal, shallow usage over years is a success case, not a shortfall (`commitment_behavioral_principles.md` §3) — reflected in Chapter 9's success definition.
- A commitment is never deleted for failing, only adapted, paused, or archived with its learning intact (`commitment_constitution.md` Ch. 6, invariant 1–2) — Deferred v1.1; adjacent to Law 6 / Chapter 2.7 but not yet independently argued (see `REVIEW_STATUS.md`).
- Mandatory user approval before the AI enacts any structural change (`commitment_constitution.md` Ch. 7, "Escenario 2") — Law 2 and Law 4.
- User sovereignty over their own data and pace (`commitment_constitution.md` Ch. 8, `north_star.md` §6) — implicit throughout Chapters 5 and 7.
- Rejection of manipulative gamification mechanics (`north_star.md` §4) — implicit in Chapter 9's rejection of streaks/completion-count as success metrics.
- The Blueprint as a named, central concept sitting between intention and execution (`commitment_constitution.md` Ch. 1–2) — Chapter 3, substantially narrowed (see Evolved, below).

### Evolved

- **Blueprint.** The original Constitution's Blueprint was a publishable, versioned artifact with three authorship tiers (Personal / Shared / Verified-Expert) — closer to a recipe others could clone. This draft narrows Blueprint to the single-user, AI-proposed staging step described in Chapter 3. The shareable/marketplace dimension is not rejected outright — `docs/01-product/PRODUCT_VISION.md` already lists "Marketplace" as out of scope for v1 — but it is not carried into this document as a defining property of what a Blueprint _is_. It could return later as a capability built on top of the same concept.
- **Identity Anchor.** The Constitution modeled this as a discrete, structured, largely immutable entity (Declaration, Value, Desired Emotion) owned by the user. This draft keeps the underlying concern — a Commitment's "why" should surface and matter — but relocates it into the ongoing dialogue of Understanding (Chapter 2.2) rather than mandating it as a one-time, formal, persisted field. See Unresolved Conflicts, below.
- **The domain's humanized vocabulary.** The Constitution and its companion glossaries mandated that the domain model itself use humanized, Spanish-first names (Compromiso, Microacción, Rescate Resiliente) and formally prohibited English operational terms like Task, Habit, Streak, and Reminder. The shipped domain uses exactly those prohibited English terms, as precise technical nouns. Chapter 4 (User Language vs. Domain Language) is this document's resolution: the humanizing intent survives, relocated from the data model to the AI's conversational surface, where it was arguably always better suited to live.
- **The Commitment resilience state machine.** The Constitution specified a detailed named state machine (`EnFriccion`, `EnAdaptacion`, `Recuperandose`, and others) as literal, persisted domain states, alongside a formal `RescateResiliente` event. The emotional intent behind it — never punish, always offer a smaller next step — is retained, but relocated: it now lives as the psychological throughline of Chapter 2 (the Transformation Model) and the behavioral scale it draws from, rather than as a mandated set of persisted domain states. The actually-shipped lifecycles (Commitment's Draft→Active model, Task's independent lifecycle) are simpler than this and were arrived at deliberately through real product decisions, not by omission.
- **The decision filter.** The Constitution's six-question "Filtro de Hierro" (Ch. 10) evolves into this document's five-question test (Chapter 8) — same function, rephrased around the Transformation Model's vocabulary instead of the original entity catalog.

### Intentionally Removed

- **Microacción as the sole, atomic, sub-30-minute unit of execution**, with a hard rule against more than three visible at once (`commitment_constitution.md`, entity catalog and "Regla de Oro"). The shipped domain has Task as a materially richer entity — its own lifecycle, arbitrary estimated duration, scheduling, and reminders — coexisting with Habit as a distinct concept for recurring identity practices. Neither collapses into a single atomic unit. The density guidance behind the original rule is not lost; it already lives, independently, in `COMMITMENT_EXPERIENCE_GUIDE.md`'s density rules, at the right layer of the document hierarchy for that kind of concern.
- **"AI has no navigable space; there is no chat with AI"** (`commitment_navigation_philosophy.md` §3). This is directly contradicted by the product as shipped, which has a dedicated Coach surface. Removed as a hard constraint. The underlying spirit — AI should show up where it's useful, not become the default destination — is preserved differently, in Chapter 5's "architect, not the product" framing, which constrains AI's _role_ rather than its _location_.
- **The specific named psychological state machine as literal domain states** — see Evolved, above, for what replaced it. Listed again here because the removal (of the states as domain-level, persisted facts) is as significant as the evolution (of the intent behind them).
- **"Cero Deuda de Dominio" — zero domain debt — as a literal ten-year success metric** (`north_star.md` §5). This is already false of the current product: the domain has evolved substantially, and appropriately, through real architecture decisions since these documents were written. Chapter 9 replaces it with a success definition that does not require the domain model to stay frozen to be considered a success.
- **The Support Network subsystem** (Red de Apoyo, Miembro de Apoyo, Invitado, Mensaje Empático — `commitment_constitution.md` §1.5). Not contradicted by anything shipped — simply never built, and explicitly out of scope in `PRODUCT_VISION.md` v1. Removed from this document because a philosophy-level framework should not assume subsystems that don't exist and aren't scheduled. It can return through a future ADR if the product decides to build it, without requiring a revision to this document first.

### Unresolved Conflicts Requiring Human Review

- **Should Identity Anchor become a real, persisted domain field** — a structured "why" statement attached to a Commitment — or remain purely conversational, surfaced through the AI's dialogue rather than stored as its own entity? The original Constitution mandated the former; nothing in the shipped domain has it today in any form.
- **Should Blueprint's shareable dimension (other users cloning a proven plan, verified experts publishing methodologies) be reintroduced as a future capability**, or was excluding it from v1 scope meant to be a permanent product decision rather than a temporary one? This affects whether Blueprint should be modeled today with room to grow into a shareable artifact, or kept deliberately single-user.
- **This document is written in English only, by instruction.** The product's actual interface is already bilingual (English/Spanish) through its existing localization system, independent of this document. Nothing here should be read as implying the product itself should become English-only — but this is worth confirming explicitly rather than leaving it to inference.
- **What should formally happen to the seven documents this appendix draws from** — archive them in place with a superseded notice, move them to a dedicated archive location, or delete them outright? This document does not resolve that question. It is the first decision to make once this draft is reviewed and frozen at v1.0.
