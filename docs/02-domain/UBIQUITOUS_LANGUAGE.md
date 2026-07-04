# Ubiquitous Language Glossary (Lenguaje Ubicuo)

Version: 1.1.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

This document represents the official and single source of truth for terms and definitions used across Bounded Contexts.

---

## 🔑 Core Domain Terms

### 1. Identity (Identidad)

- **Definition:** The business representation of the user, capturing identity details (emails, preferred language, preferred timezone). Completely decoupled from authentication or authorizations.
- **Aggregates:** `Identity` (Aggregate Root).
- **Identifier:** `IdentityId`.
- **Prohibited Synonyms:** User, Account, UserProfile.

### 2. Commitment (Compromiso)

- **Definition:** A solemn promise of personal transformation bound to the user's core identity and values. It is the root entity of the Commitment Lifecycle context.
- **Aggregates:** `Commitment` (Aggregate Root).
- **Identifier:** `CommitmentId`.
- **Prohibited Synonyms:** Task, Todo, Project, Habit Tracker, Goal (when used as synonym).

### 3. Identity Anchor (Ancla de Identidad)

- **Definition:** The deep-seated motivation or statement of personal value associated with a specific commitment. (Deferred from strict aggregate invariants).
- **Value Object:** `IdentityAnchor`.
- **Prohibited Synonyms:** Description, Category, Tag.

### 4. Goal (Objetivo)

- **Definition:** A tactical, measurable checkpoint that breaks down a commitment into achievable execution phases.
- **Entities/Aggregates:** `Goal` (Aggregate Candidate).
- **Prohibited Synonyms:** Task, Milestone.

### 5. Microaction (Microacción)

- **Definition:** The daily, atomic unit of execution (duration < 30 minutes) designed to fit the present context.
- **Entities/Aggregates:** `Microaction` (Aggregate Candidate).
- **Prohibited Synonyms:** Task, Subtask, To-Do item.

### 6. Pause (Pausa Consciente)

- **Definition:** A planned temporary suspension of actions and notifications declared by the user without penalty.
- **Prohibited Synonyms:** Cancellation, Inactivity.

### 7. Rescue (Rescate Resiliente)

- **Definition:** An intervention triggered during friction that scales down a micro-action to an atomic 60-second execution to preserve momentum.
- **Prohibited Synonyms:** Delay notification, Reminder.

### 8. Recovery (Recuperación)

- **Definition:** A transitional state where the user rebuilds consistency following a friction rescue event.
- **Prohibited Synonyms:** Restart.

### 9. Victory of Return (Victoria de Regreso)

- **Definition:** An immutable resilience record generated when a user executes a rescue action to recover from friction.
- **Prohibited Synonyms:** Streak point, Check-in.

### 10. Active Plan (Plan Activo)

- **Definition:** The currently active tactical structure (goals and daily actions) of a commitment.
- **Prohibited Synonyms:** Backlog, Timeline.

### 11. BCP-47 Locale

- **Definition:** BCP-47 standard for language and country tags (e.g. `en-US`, `es-CR`, `pt-BR`) used for regional localization.

---

## 🔄 Commitment States (Finite State Machine)

- **Draft:** Initial status before activation.
- **Active:** Standard execution state where daily micro-actions are scheduled.
- **Paused:** Conscientious pause declared by the user.
- **InFriction:** Triggered automatically upon 48 hours of inactivity.
- **Recovering:** Transitional state following a rescue action.
- **Completed:** Reached when all goals and milestones are completed.
- **Archived:** Final state where learning capsules are immortalized and updates are locked.

---

## 📜 Change History

- **v1.1.0 (2026-07-04):** Integrated FSM state definitions and English domain terms.
- **v1.0.0 (2026-07-04):** Initial Ubiquitous Language glossary definition.
