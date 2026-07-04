# Commitment v2

> **"Frameworks are replaceable. Business rules are not."**

Bienvenido a **Commitment v2**, una plataforma de software profesional diseñada para guiar el compromiso humano con un enfoque de alta calidad técnica, resiliencia offline-first y diseño calmo.

---

## 🧭 START HERE

### Reading Order

1. [PROJECT_STATUS.md](file:///Users/yereth/Desktop/Commitment-v2/PROJECT_STATUS.md)
2. [HANDBOOK.md](file:///Users/yereth/Desktop/Commitment-v2/HANDBOOK.md)
3. [ENGINEERING_BOARD.md](file:///Users/yereth/Desktop/Commitment-v2/ENGINEERING_BOARD.md)
4. [ARCHITECTURE.md](file:///Users/yereth/Desktop/Commitment-v2/ARCHITECTURE.md)
5. [ROADMAP.md](file:///Users/yereth/Desktop/Commitment-v2/ROADMAP.md)

---

## 🏛️ Filosofía de Arquitectura

El núcleo de Commitment v2 está construido bajo principios de ingeniería sólidos:

- **Independencia del Dominio:** Las reglas de negocio (Domain) son puras y no dependen de ningún framework (NestJS, Flutter, Supabase, etc.). Toda interacción externa se realiza mediante puertos y adaptadores (Arquitectura Hexagonal).
- **Event Sourcing & CQRS:** El estado del Compromiso se deriva de un historial inmutable de eventos.
- **Offline-First:** La aplicación móvil debe ser completamente funcional sin conexión a internet, sincronizándose de forma transparente.
- **Diseño Calmo:** Interfaz centrada en reducir la fatiga de decisión y fomentar la motivación intrínseca.

---

## 📂 Estructura del Proyecto (Monorepo)

Este repositorio está organizado como un Monorepo utilizando `pnpm` y `Turborepo`:

```text
.
├── apps/
│   ├── backend/               # API NestJS (Node.js + TypeScript)
│   └── mobile/                # Aplicación Móvil (Flutter con FVM)
├── docs/                      # Documentación técnica y de producto (Fuente de verdad)
│   ├── 00-governance/         # Modelos de gobierno, principios y prompts
│   ├── 01-product/            # Visión del producto, UX y ADRs del producto
│   ├── 02-domain/             # Modelo de dominio, catálogo de comandos y eventos
│   ├── 03-architecture/       # ADRs técnicos y patrones de arquitectura global
│   ├── 04-backend/            # Arquitectura del backend, guías y especificaciones
│   ├── 05-mobile/             # Guías de desarrollo móvil y sistema de UI
│   ├── 06-devops/             # Infraestructura local, monitoreo y CI/CD
│   ├── 07-quality/            # Criterios de QA y Definition of Done
│   ├── 08-operations/         # Manuales de onboarding y mantenimiento
│   └── G0.2-Project-Backbone/ # Documentación histórica de Project Backbone
├── engineering/               # Infraestructura de ingeniería y gobernanza activa
│   ├── tasks/                 # Especificaciones de tareas (por ejemplo, TASK-001)
│   ├── reviews/               # Revisiones de arquitectura
│   ├── specifications/        # Especificaciones técnicas
│   ├── playbooks/             # Guías de acción paso a paso
│   ├── templates/             # Plantillas para tareas, revisiones y especificaciones
│   ├── system-prompt.md       # Contrato operativo permanente para Inteligencias Artificiales
│   ├── WORKFLOW.md            # Ciclo de vida oficial de ingeniería
│   └── ARCHITECTURE_CHECKLIST.md # Puntos de control y validación de arquitectura
├── packages/                  # Paquetes y configuraciones compartidas
│   ├── api-contracts/         # Esquemas de API y contratos Zod
│   ├── config/                # Configuraciones base de TypeScript/Linters
│   ├── design-system/         # Tokens de diseño calmo (colores HSL, etc.)
│   ├── domain/                # Dominio puro y CQRS base (sin frameworks)
│   └── shared/                # Utilidades e interfaces comunes
├── ARCHITECTURE.md            # Resumen de arquitectura del proyecto
├── DECISION_LOG.md            # Registro de decisiones de arquitectura
├── ENGINEERING_BOARD.md       # Tablero de prioridades de desarrollo
├── HANDBOOK.md                # Manual principal y punto de entrada de lectura
├── PROJECT_STATUS.md          # Estado actual del proyecto y sprints
├── RISK_REGISTER.md           # Registro de riesgos y mitigaciones
├── ROADMAP.md                 # Plan de hitos y sprints futuros
├── TECH_DEBT.md               # Registro de deuda técnica identificada
├── docker-compose.yml         # Entorno local de soporte (Redis, Prometheus, Grafana)
└── package.json
```

---

## 📁 Repository Structure

To ensure codebase organization remains clean and intuitive, the repository is divided into specific logical domains:

- **Governance:** The core models, constitutions, and alignment prompts that guide AI and human behavior are stored in [docs/00-governance/](file:///Users/yereth/Desktop/Commitment-v2/docs/00-governance/) and root-level entry files (e.g. [HANDBOOK.md](file:///Users/yereth/Desktop/Commitment-v2/HANDBOOK.md), [PROJECT_STATUS.md](file:///Users/yereth/Desktop/Commitment-v2/PROJECT_STATUS.md)).
- **Engineering:** The operational scripts, checklists, templates, tasks, and playbooks that developers use on a day-to-day basis reside inside [engineering/](file:///Users/yereth/Desktop/Commitment-v2/engineering/).
- **Product:** Vision docs, calm design token foundations, ftue diagrams, microcopy guides, and product ADRs live under [docs/01-product/](file:///Users/yereth/Desktop/Commitment-v2/docs/01-product/).
- **Domain:** Pure business logic rules, catalogues of commands/events, bounded contexts, and conceptual domain schemas are defined under [docs/02-domain/](file:///Users/yereth/Desktop/Commitment-v2/docs/02-domain/) and implemented strictly inside [packages/domain/](file:///Users/yereth/Desktop/Commitment-v2/packages/domain/).
- **Architecture:** Formal Architecture Decision Records (ADRs) that document technology selections and patterns reside in [docs/03-architecture/](file:///Users/yereth/Desktop/Commitment-v2/docs/03-architecture/).
- **Backend:** Technical standards for backend servers live in [docs/04-backend/](file:///Users/yereth/Desktop/Commitment-v2/docs/04-backend/), while the NestJS API application is implemented inside [apps/backend/](file:///Users/yereth/Desktop/Commitment-v2/apps/backend/).
- **Mobile:** Technical standards for presentation and client states live in [docs/05-mobile/](file:///Users/yereth/Desktop/Commitment-v2/docs/05-mobile/), while the Flutter codebase is located inside [apps/mobile/](file:///Users/yereth/Desktop/Commitment-v2/apps/mobile/).
- **Operations:** Guides for developer onboarding, support, and manual playbooks are located in [docs/08-operations/](file:///Users/yereth/Desktop/Commitment-v2/docs/08-operations/).

---

## 🚀 Roadmap de Desarrollo

1.  **Sprint 0 — Foundation** (Sprint Actual) - Configuración del monorepo, convenciones y pipelines.
2.  **Sprint 1 — Identity** - Autenticación y registro seguro.
3.  **Sprint 2 — Commitment** - Core del dominio del Compromiso.
4.  **Sprint 3 — Daily Execution** - Registro de acciones y microacciones.
5.  **Sprint 4 — Resilience Engine** - Recuperación, victorias de regreso e índices.
6.  **Sprint 5 — Library of Life** - Historial adaptativo del usuario.
7.  **Sprint 6 — Support Network** - Conectividad social y apoyo.
8.  **Sprint 7 — AI Gateway** - Triggers y análisis adaptativo.
9.  **Sprint 8 — Insights** - Métricas avanzadas y reportería.

---

## 🛠️ Tecnologías Preferidas

- **Frontend:** Flutter (anclado con FVM en `stable`), Riverpod, GoRouter, Drift + SQLCipher.
- **Backend:** NestJS (Node.js / TypeScript), CQRS, Zod, Drizzle (para Read Models), PostgreSQL.
- **Infraestructura:** Supabase CLI para desarrollo local, Supabase Cloud en producción, AWS para servicios adicionales.
- **Observabilidad:** OpenTelemetry, Prometheus, Grafana.
