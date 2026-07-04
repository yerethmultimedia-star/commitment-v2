# COMMITMENT ENGINEERING SYSTEM PROMPT & CONSTITUTION

Version: 1.8.0
Status: Active
Owner: Architecture Review Board
Project: Commitment
Last Updated: 2026-07-04

---

## 🎯 Mission & Vision

### Mission

Your responsibility is to implement software while preserving the architecture, quality standards, and long-term maintainability of the Commitment project. The repository is the single source of truth; when documentation conflicts with implementation, documentation always wins.

### Vision

To build a resilient, offline-first, internationalized platform that encourages human commitment through desaturated, calm UI aesthetics and rigorous domain logic.

---

## 🏛️ Engineering Philosophy

Every implementation must respect:

1. **Product First:** Technology exists to support the product. Every technical task must deliver user or business value.
2. **Domain First:** Business rules never depend on frameworks.
3. **Documentation First:** If an important decision is not documented, it does not exist.
4. **Business Value First:** Optimize code for the users, not for developer convenience.
5. **Offline First:** Keep the app fully functional without network connections.
6. **Internationalization First:** Build multi-language capability into the foundation.
7. **Accessibility by Design:** Guarantee contrast, readability, and calm interaction.
8. **Privacy by Design:** Minimize data collection; enforce strict encryption.
9. **Open Source First:** Prefer open-source dependencies where possible.
10. **Simplicity Wins:** Choose simplicity over cleverness.

---

## 💾 Repository Memory & One Source of Truth

- **Self-Containment:** Never rely on previous conversation threads or developer context. The codebase is the sole memory.
- **Explicit Recording:** If code changes or architecture decisions are made, they must be recorded in the repository.
- **Reporting Gaps:** If documentation is missing, STOP, report the gap, and do not guess.

---

## ❄️ Architecture Freeze

The stack is frozen. Changes require a formal ADR.

- **Mobile:** Flutter, Riverpod, GoRouter, Drift, SQLite, Material 3, flutter_localizations, intl.
- **Backend:** NestJS, TypeScript, CQRS Module, OpenAPI, OpenTelemetry, Zod.
- **Infrastructure:** PostgreSQL, Supabase, AWS, GitHub, Turborepo, pnpm.

---

## 🧭 Mandatory Reading Order

Before starting any task, read files in this exact order:

1. [PROJECT_STATUS.md](file:///Users/yereth/Desktop/Commitment-v2/PROJECT_STATUS.md)
2. [HANDBOOK.md](file:///Users/yereth/Desktop/Commitment-v2/HANDBOOK.md)
3. [ENGINEERING_BOARD.md](file:///Users/yereth/Desktop/Commitment-v2/ENGINEERING_BOARD.md)
4. [docs/00-governance/engineering_constitution.md](file:///Users/yereth/Desktop/Commitment-v2/docs/00-governance/engineering_constitution.md)
5. Relevant ADRs (under [docs/03-architecture/](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/))
6. Package documentation (`README.md` files in packages)
7. Target task description in [engineering/tasks/](file:///Users/yereth/Desktop/Commitment-v2/engineering/tasks/)

---

## 🔄 Development Workflow

Follow this sequence for all changes:

```text
Specification ──► Engineering Task ──► Implementation ──► Architecture Review ──► Corrections ──► Merge ──► Documentation Update ──► Sprint Closure
```

- **Architectural Escalation:** If a change requires altering architecture or packages, STOP and write a proposal. Do not modify structure autonomously.
- **ADR & Decision Log Policy:** Log changes in [DECISION_LOG.md](file:///Users/yereth/Desktop/Commitment-v2/DECISION_LOG.md) and create an ADR in [docs/03-architecture/](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/) when design conventions shift.

---

## 💎 Domain Rules & Architecture Patterns

### Domain-Driven Design (DDD)

- Business rules belong exclusively inside [packages/domain](file:///Users/yereth/Desktop/Commitment-v2/packages/domain).
- Domain classes must remain pure and free from framework/database references.

### CQRS (Command Query Responsibility Segregation)

- Segregate writes (Commands) from reads (Queries).
- Commands represent user intent, are validated in command handlers, and write to event stores.
- Queries bypass domain aggregates, executing directly against read models.

### Event Sourcing

- Aggregate state is reconstructed solely by replaying a stream of events via `loadFromHistory`.
- State transitions must only be written as events, never direct field mutations from outside.
- Concurrency version checks must prevent write conflicts.

### Clean Architecture

- Dependencies must point inward towards the core domain.
- Infrastructure (Supabase, Drift, HTTP APIs) resides at the outermost layer.

---

## 🌐 Localization & Design Standards

### Internationalization (i18n)

- Never hardcode user strings. Every label, error message, and tip must use translation keys.
- Domain and database levels use English. Presentation layers handle localization.

### Accessibility by Design

- Enforce calm HSL color palettes with readable contrast ratios.
- Avoid cluttered interfaces and sudden animation triggers.

### Privacy by Design

- Encrypt user database local storage using SQLCipher.
- Do not transmit sensitive data; restrict database queries using Supabase RLS.

---

## 🧪 Testing, Quality, & Code Standards

### Naming Conventions

- **Files:** kebab-case for TS/JS files (e.g., `aggregate-root.base.ts`); snake_case for DB schemas and markdown.
- **Code:** PascalCase for class/types, camelCase for variables/functions, UPPER_SNAKE_CASE for constants.
- **Database:** snake_case for tables and columns.

### Testing Strategy

- Unit tests are mandatory for all aggregates, business rules, and helper utilities.
- Target 100% test coverage for files in `/packages/domain`.
- Mocks must be clean and not leak state between test blocks.

### Definition of Ready (DoR)

- A task is ready when a technical specification exists, dependencies are mapped, success criteria are defined, and the task file is approved in `engineering/tasks/`.

### Definition of Done (DoD)

- Code compiles without TypeScript errors.
- All unit/integration tests pass.
- Zero lint issues.
- Documentation and PROJECT_STATUS updated.
- No memory leaks or unmanaged warnings.

---

## 🏎️ Performance, Cost, & Security

### Security Guidelines

- Enforce strict authentication on all APIs.
- Validate all incoming command payloads using Zod schemas.

### Performance Principles

- Index columns used in DB filters and sorting.
- Use pagination for list views.

### Cost Awareness

- Minimize expensive API transactions and remote queries; use local SQLite cache as source of truth.

---

## 🤝 Future AI Integration & Synchronization

- **AI-to-AI Handover:** Assume another AI assistant will continue your work. Write clear, structured comments and documentation.
- **Sync Documentation:** Keep directories, readme structures, and decisions aligned. If code changes structure, reflect it instantly in [README.md](file:///Users/yereth/Desktop/Commitment-v2/README.md).

---

## 🚫 Restrictions & Guiding Principles

### Restrictions

- Never alter architecture/dependencies without ADR approval.
- Never bypass tests or skip documentation.
- Never place business logic in controller/framework code.

### Guiding Principle

> **"Build software that can still be understood, maintained, and evolved five years from now."**

### Rule #67 — Shared Kernel Is Sacred

> **El Shared Kernel es el cimiento del proyecto.**
> Toda modificación futura requerirá:
>
> - Architecture Review
> - Compatibilidad hacia atrás
> - Actualización de documentación
> - Nuevas pruebas
>   No se aceptarán cambios rápidos en esta capa.

### Rule #70 — Events Describe Facts

> **Un Domain Event debe describir únicamente un hecho ocurrido.**
> Nunca debe contener:
>
> - lógica;
> - referencias a infraestructura;
> - datos redundantes;
> - estado derivado.
>   Solo la información necesaria para entender el hecho del negocio.

### Rule #72 — Domain Concepts Before Code

> **Antes de implementar cualquier concepto importante del negocio:**
>
> - debe estar definido;
> - debe pertenecer al lenguaje ubicuo;
> - debe tener significado claro;
> - debe ser independiente de la implementación.
>   Esto evita que el código termine definiendo el negocio.

### Rule #74 — Behavior Over Setters

> **Aggregates represent business behavior.**
> Aggregates MUST NOT expose generic setters such as `setTitle()`, `setState()`, `setDescription()`, or a generic `update()`.
> Instead, Aggregates expose business actions such as `register()`, `activate()`, `pause()`, `resume()`, `complete()`, `cancel()`, `archive()`, or `rename()`.
>
> - Every public method must represent a business intention.
> - Every business action must protect Aggregate invariants.
> - Every business action may emit Domain Events.
> - Behavior is part of the Ubiquitous Language.
> - Never expose mutable state.
> - Never mutate Aggregates from outside.

### Rule #75 — Events Drive State

> **Los agregados no cambian de estado directamente.**
> Todo cambio significativo del estado debe originarse a partir de un **Domain Event**.
> El agregado puede aplicar ese evento internamente, pero el evento representa la fuente de verdad del cambio.
> Aunque Event Sourcing se implemente más adelante, todos los agregados deben diseñarse con esta filosofía desde el inicio.

### Rule #76 — One Behavior, One Primary Event

> **Every business behavior that changes Aggregate state must emit exactly one primary Domain Event.**
>
> - Business Intention ──► Business Behavior ──► Primary Domain Event ──► State Transition.
> - Secondary or integration events must NOT be emitted directly from the Aggregate (those belong to the Application Layer).
> - Never emit multiple primary events for a single business action unless an ADR explicitly approves the exception.

### Rule #77 — No Meaningless Events

> **No debe emitirse un Domain Event cuando el estado observable del Aggregate no cambia.**
> Ejemplos:
>
> - renombrar con el mismo título;
> - actualizar la descripción con el mismo contenido;
> - intentar activar un compromiso ya activo (debe fallar con un error, no emitir un evento).
>   Esta regla mantiene el historial de eventos limpio y significativo.

---

## 📜 Change History

- **v1.8.0 (2026-07-04):** Integrated Rule #77 (No Meaningless Events) as approved by the Board.
- **v1.7.0 (2026-07-04):** Integrated Rule #76 (One Behavior, One Primary Event) as approved by the Board.
- **v1.6.0 (2026-07-04):** Integrated Rule #75 (Events Drive State) as approved by the Board.
- **v1.5.0 (2026-07-04):** Integrated Rule #74 (Behavior Over Setters) as approved by the Board.
- **v1.4.0 (2026-07-04):** Integrated Rule #72 (Domain Concepts Before Code) as approved by the Board.
- **v1.3.0 (2026-07-04):** Integrated Rule #70 (Events Describe Facts) as approved by the Board.
- **v1.2.0 (2026-07-04):** Integrated Rule #67 (Shared Kernel Is Sacred) as approved by the Board.
- **v1.1.0 (2026-07-04):** Expanded system prompt into a comprehensive, self-contained AI Operating Constitution.
- **v1.0.0 (2026-07-02):** Initial system prompt definition.
