# Core Domain Concepts (Ontología del Dominio)

Version: 1.0.0
Status: Historical (Superseded)
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

> **AR-003, D-003.1 — Clasificación: Histórico (íntegro).** El vocabulario de este documento
> (Fricción, Momentum, Recuperación, "Social Context") fue reemplazado por
> `docs/00-framework/THE_COMMITMENT_FRAMEWORK.md` y por el dominio realmente enviado (Task/Habit/Goal).
> Corregido aquí el campo `Status` (decía "Active" de forma incorrecta) — el contenido original no se
> reescribe. Ver `docs/02-domain/CLASSIFICATION_STATUS.md` para el registro completo de clasificación.

---

This document defines the core conceptual pillars of the Commitment Domain, ensuring consistent vocabulary and purpose across all Bounded Contexts.

---

## 🧭 Master Concepts Reference

### 1. Commitment (Compromiso)

- **Definition:** A solemn promise of personal transformation bound to the user's core identity and values. It is the living root entity of the execution domain.
- **Purpose:** Unlike generic task managers or productivity metrics, a Commitment models intent and values rather than simple completion logs.

### 2. Friction (Fricción)

- **Definition:** The fatigue, cognitive resistance, or contextual obstacles detected or declared during the execution of a commitment.
- **Nature:** In Commitment, friction is not just a "task overdue" status; it is a critical domain phenomenon modeled from activity latencies (>48h) or consecutive micro-action reschedules.
- **Evolutionary Path:** In future architectural phases, **Friction** is planned to spin off into its own Bounded Context (_Resilience & Inactivity Context_).

### 3. Momentum (Impulso)

- **Definition:** The measure of consistency and velocity accumulated by the user over time through constant daily execution.
- **Purpose:** High momentum temporarily buffers the user from minor interruptions, whereas dropping momentum acts as the primary telemetry signal for the adaptation engine.

### 4. Recovery (Recuperación)

- **Definition:** The transitional process where a user rebuilds execution consistency after recovering from a friction event.
- **Rule:** Requires a consecutive 3-day consistency run of atomic actions to restore fully active status.

### 5. Resilience (Resiliencia)

- **Definition:** The capacity of the system and the user to adapt behavior in response to friction accumulation without losing sight of identity transformation values.

### 6. Reflection (Reflexión)

- **Definition:** The meta-cognitive learning review conducted by the user at the completion or conscious cancellation of a commitment.
- **Result:** Produces a permanent Learning Capsule in the Wisdom context.

### 7. Identity Anchor (Ancla de Identidad)

- **Definition:** The articulation of the user's deep "why" behind a commitment, connecting it to personal values.
- **Status:** Positioned as an optional value object candidate, deferred from early aggregate invariants until its context-bound integration is finalized.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial definitions of core domain concepts.
