# Commitment v2

> **"Frameworks are replaceable. Business rules are not."**

Bienvenido a **Commitment v2**, una plataforma de software profesional diseñada para guiar el compromiso humano con un enfoque de alta calidad técnica, resiliencia offline-first y diseño calmo.

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
├── docs/                      # Documentación técnica y de producto (Fuente de verdad)
│   ├── 01-product/            # Visión del producto, UX y ADRs del producto
│   ├── 02-domain/             # Modelo de dominio, catálogo de comandos y eventos
│   ├── 03-architecture/       # ADRs técnicos y patrones de arquitectura global
│   ├── 04-backend/            # Arquitectura del backend, guías y especificaciones
│   ├── 05-mobile/             # Guías de desarrollo móvil y sistema de UI
│   ├── 06-devops/             # Infraestructura local, monitoreo y CI/CD
│   ├── 07-quality/            # Criterios de QA y Definition of Done
│   └── 08-operations/         # Manuales de onboarding y mantenimiento
├── apps/
│   ├── backend/               # API NestJS (Node.js + TypeScript)
│   └── mobile/                # Aplicación Móvil (Flutter con FVM)
├── packages/                  # Paquetes y configuraciones compartidas
│   ├── tsconfig/              # Configuraciones de TypeScript compartidas
│   └── eslint-config/         # Configuraciones de ESLint/Prettier compartidas
├── docker-compose.yml         # Entorno local de soporte (Redis, Prometheus, Grafana)
└── package.json
```

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
