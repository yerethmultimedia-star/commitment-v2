# Commitment Domain Model Specification

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 📖 1. Conceptual Framework: What is a Commitment?

A **Commitment (Compromiso)** is a solemn promise of personal transformation tied to the user's core identity and values. It is the living root entity of the Commitment Lifecycle bounded context.

### ❓ Core Business Questions

- **Why does it exist?**
  To channel human energy towards long-term values, systematically reducing friction, adapting dynamically to life burnout, and preventing identity-deficit failures.
- **Who owns it?**
  Exactly one **Identity** (identified by an `IdentityId`).
- **How is it created?**
  Conceived in a `Borrador` (Draft) state with an `IdentityAnchor` (Ancla de Identidad), then activated (`Activo`) upon scheduling the first micro-action.
- **How is it completed?**
  When all goals and milestones of the active plan are successfully met, transitioning to `Completado` and eventually `Archivado` after recording a learning reflection.
- **How is it cancelled?**
  Consciously desisted by the user, moving directly to `Archivado` (recording a meta-cognition capsule).
- **Can it expire?**
  No. Commitments are value-aligned promises; they do not simply time out, though inactive periods trigger friction transitions.
- **Can it pause and resume?**
  Yes, using the `DeclararPausa` command (Pausa Consciente) to suspend notifications and daily micro-actions without penalty, and `ReanudarCompromiso` to resume active status.
- **Can it fail?**
  No, the system is designed around recovery. When consecutive failures occur, it enters the `EnFriccion` and `EnAdaptacion` states to scale down micro-actions rather than declaring a hard failure.
- **Can it evolve, split, or merge?**
  It evolves via plan adjustments (`AprobarPlanAdaptado`). Splitting or merging commitments is excluded from this aggregate to maintain atomic execution boundaries.
- **How is it archived?**
  Following completion or conscious cancellation, the user immortalizes their learning in a meta-cognitive learning capsule, locking the commitment from further updates.

---

## 🔄 2. State Machine (Commitment FSM)

The Commitment FSM governs state transitions within the Aggregate:

```
                  [ Borrador ]
                       │
                       │ (ConcebirCompromiso / PactoActivado)
                       ▼
                  [ Activo ] ◄─────────────────────────┐
                   │  │  ▲                             │
 (FriccionDetectada)  │  │ (Reanudar)                  │
                   ▼  │  │                             │
          [ EnFriccion ] │                             │ (EjecutarMicroaccion
             │     │     │                             │  tras 3 días de constancia)
             │     │   [ EnPausa ]                     │
(Adaptar)    │     │     ▲                             │
             │     │     │ (DeclararPausa)             │
             ▼     ▼     │                             │
    [ EnAdaptacion ] ──► [ Recuperandose ] ────────────┘
             │                 │
             └────────┬────────┘
                      │ (CompletarCompromiso)
                      ▼
                 [ Completado ]
                      │ (RegistrarReflexion)
                      ▼
                 [ Archivado ]
```

### Transition Specifications

| Current State   | Command (Input)        | Preconditions                             | Emitted Event                   | Next State            |
| :-------------- | :--------------------- | :---------------------------------------- | :------------------------------ | :-------------------- |
| `Borrador`      | `ConcebirCompromiso`   | Anchor must be non-empty and valid.       | `CompromisoConcebido`           | `Borrador` (Hydrated) |
| `Borrador`      | `ActivarCompromiso`    | Initial micro-action scheduled (<2 mins). | `PactoActivado`                 | `Activo`              |
| `Activo`        | `RegistrarFriccion`    | System-triggered: >48h inactivity.        | `FriccionDetectada`             | `EnFriccion`          |
| `Activo`        | `DeclararPausa`        | User declares pause context.              | `PausaConscienteDeclarada`      | `EnPausa`             |
| `EnFriccion`    | `AdaptarCompromiso`    | Proposed adjustment plan is generated.    | `VelocidadAdaptada`             | `EnAdaptacion`        |
| `EnFriccion`    | `AceptarRescate`       | User completes atomic (60s) action.       | `VictoriaDeRegresoRegistrada`   | `Recuperandose`       |
| `EnAdaptacion`  | `AprobarPlanAdaptado`  | Plan respects Interaction Budget.         | `PlanAdaptadoAprobado`          | `Activo`              |
| `EnPausa`       | `ReanudarCompromiso`   | Pause duration ended or user resumes.     | `CompromisoReanudo`             | `Activo`              |
| `Recuperandose` | `RegistrarMicroaccion` | 3 consecutive days of micro-actions met.  | `ConsistenciaRecuperada`        | `Activo`              |
| `Activo`        | `CompletarCompromiso`  | All goals & milestones achieved.          | `CompromisoCompletado`          | `Completado`          |
| `Completado`    | `RegistrarReflexion`   | Reflection questions completed.           | `CapsulaInmortalizada`          | `Archivado`           |
| `Activo`        | `CancelarCompromiso`   | Conscious decision to desist.             | `CompromisoCanceladoConsciente` | `Archivado`           |

---

## 📥 3. Commands

Commands are classified into three strict operational types:

### A. Human Commands

- **`ConcebirCompromiso`:** Initializes the commitment details.
- **`ActivarCompromiso`:** Transitions the commitment into active daily scheduling.
- **`DeclararPausa`:** Pauses execution due to vacation or context shifts.
- **`ReanudarCompromiso`:** Restores active status.
- **`RegistrarMicroaccion`:** Completes a daily action.
- **`RegistrarReflexion`:** Submits meta-cognitive learning reflection.
- **`CancelarCompromiso`:** Desists from the commitment.

### B. System Commands

- **`RegistrarFriccion`:** Automatically triggered by the system evaluator after 48 hours of inactivity.

### C. AI Commands (Propuestas de IA)

- _Rule:_ **The AI never executes commands directly.** It generates proposals. If accepted by the user, it triggers `AprobarPlanAdaptado`.

---

## ✉️ 4. Domain Events (Rule #70 Compliant)

Domain events contain only business facts. Payload fields do not duplicate occurrence timestamps (`occurredAt` / `recordedAt` reside in the envelope).

- **`CompromisoConcebido`:** Emitted when draft is defined. Payload: `commitmentId`, `identityId`, `identityAnchor`.
- **`PactoActivado`:** Emitted when aggregate transitions to `Activo`. Payload: `commitmentId`, `initialMicroactionId`.
- **`FriccionDetectada`:** Emitted when inactivity threshold is hit. Payload: `commitmentId`, `inactivityHours`.
- **`PlanAdaptadoAprobado`:** Emitted on plan recalculation. Payload: `commitmentId`, `newScheduleBudget`.
- **`VictoriaDeRegresoRegistrada`:** Emitted when rescue action is executed. Payload: `commitmentId`, `rescueActionId`.
- **`CompromisoCompletado`:** Emitted when goals are met. Payload: `commitmentId`.
- **`CapsulaInmortalizada`:** Emitted upon final reflection registration. Payload: `commitmentId`, `capsuleSummary`.

---

## 🔒 5. Business Invariants (Inmutables)

1. **Identity Association:** A Commitment must always belong to exactly one valid `IdentityId`.
2. **Post-Completion Read-only:** An Archived/Completed Commitment cannot receive daily updates, executions, or pause activations.
3. **Pausa Bounds:** A conscious pause cannot exceed a maximum budget of 30 cumulative days per calendar year.
4. **Interaction Budget:** Any adapted plan must not exceed a maximum of 30 minutes of total daily micro-action effort.

---

## 🧩 6. Candidate Value Objects & Entities

### Candidate Value Objects

- **`IdentityAnchor`:** Immutable text stating the core personal reasoning.
- **`CommitmentTitle`:** Main heading representation (trimmed, length restricted).
- **`InteractionBudget`:** The daily time budget assigned for execution (<30 mins).
- **`BCP47Locale`:** Locale helper (reused from Shared Kernel).

### Candidate Entities

- **`Goal`:** Measurement checkpoint that maps to a specific milestone.
- **`Microaction`:** Atomic execution unit scheduled for daily completion.

---

## 🚧 7. Aggregate Boundary

- **Inside the Aggregate Boundary:** `Commitment` (Root), `IdentityAnchor`, `Goal`, `Microaction`.
- **Outside the Aggregate Boundary:** `Routine`, `Habit`, `Gamification` / `ExperiencePoints`, `NotificationEngine` (Infrastructure), `Coach` (Social/External Context).

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial Domain Modeling specification for Commitment Bounded Context.
