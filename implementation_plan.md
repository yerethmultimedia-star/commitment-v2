# Plan de Implementación: Sprint 0 — Foundation

Este plan establece los cimientos para el desarrollo de **Commitment v2** según las directrices operativas y la arquitectura definida. El objetivo del Sprint 0 es configurar el Monorepo, inicializar los proyectos de NestJS y Flutter, configurar la infraestructura local en Docker Compose (incluyendo telemetría) y establecer la estructura oficial de documentación.

---

## User Review Required

> [!IMPORTANT]
> **Flexibilidad Tecnológica y ADRs:**  
> Como sugeriste, actualizaremos las directivas arquitectónicas para indicar que herramientas como **Drizzle** y **NATS** son las **tecnologías preferidas** y no definitivas. Cualquier cambio futuro requerirá de un _Architecture Decision Record (ADR)_ con su debida justificación técnica.

> [!NOTE]
> **Estructura del Monorepo:**  
> Usaremos una estructura basada en `pnpm` y `Turborepo` con la siguiente organización:
>
> - `apps/backend/` - Servidor NestJS
> - `apps/mobile/` - Aplicación Flutter
> - `packages/` - Configuraciones compartidas (tsconfig, eslint, etc.)

---

## Open Questions

1. **Entorno Supabase Local:**  
   ¿Prefieres que configuremos el entorno local de Supabase utilizando la herramienta oficial `supabase-cli` (que corre mediante docker internamente y maneja migraciones de forma automática) o prefieres un contenedor PostgreSQL con extensiones configuradas directamente en nuestro `docker-compose.yml`? _(Recomendamos `supabase-cli` por su fidelidad con producción)._
2. **Versión de Flutter:**  
   ¿Hay alguna versión específica de Flutter (o canal de SDK) que desees utilizar para inicializar la app móvil, o procedemos con el SDK de Flutter instalado por defecto en tu máquina?

---

## Proposed Changes

### 1. Reestructuración de Documentación

Moveremos la documentación actual para cumplir con el estándar definido de tener la carpeta `docs` en la raíz del repositorio.

#### [NEW] [docs/](file:///Users/yereth/Desktop/Commitment-v2/docs)

Creación de la estructura oficial:

- `docs/01-product/`: Moveremos `Documentation/docs/01-product/*` y los documentos de UX/filosofía.
- `docs/02-domain/`: Moveremos `Documentation/docs/02-domain/*`.
- `docs/03-architecture/`: Creación de directrices de flexibilidad tecnológica (ADR-011) y patrones arquitectónicos.
- `docs/04-backend/`: Estándares de backend (NestJS, Zod, CQRS).
- `docs/05-mobile/`: Estándares móviles (Flutter, Riverpod, Drift).
- `docs/06-devops/`: Configuración de docker-compose, CI/CD, telemetría.
- `docs/07-quality/`: Estrategias de QA y DoD.
- `docs/08-operations/`: Documentación de onboarding y guías para desarrolladores.

#### [DELETE] [Documentation/](file:///Users/yereth/Desktop/Commitment-v2/Documentation)

Eliminación de la carpeta temporal una vez reubicados y organizados los archivos.

---

### 2. Configuración del Monorepo (pnpm + Turborepo)

#### [NEW] [pnpm-workspace.yaml](file:///Users/yereth/Desktop/Commitment-v2/pnpm-workspace.yaml)

Definición de espacios de trabajo:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### [MODIFY] [package.json](file:///Users/yereth/Desktop/Commitment-v2/package.json)

Agregar scripts para Turbo:

- Configurar turbo como dependencia de desarrollo en la raíz.
- Agregar pipelines para `build`, `lint`, `test` y `dev`.

#### [NEW] [turbo.json](file:///Users/yereth/Desktop/Commitment-v2/turbo.json)

Configuración de tareas de Turborepo para orquestar la compilación y pruebas de `apps/backend` y otros paquetes compartidos.

---

### 3. Backend Foundation (NestJS)

#### [NEW] [apps/backend/](file:///Users/yereth/Desktop/Commitment-v2/apps/backend)

Inicialización de la aplicación de NestJS:

- Integración del módulo `@nestjs/cqrs` para arquitectura CQRS.
- Configuración de Zod para la validación del esquema de variables de entorno al iniciar.
- Configuración de Swagger para generación automática de OpenAPI.
- Configuración del SDK de OpenTelemetry para tracing y métricas de Prometheus.

---

### 4. Mobile Foundation (Flutter)

#### [NEW] [apps/mobile/](file:///Users/yereth/Desktop/Commitment-v2/apps/mobile)

Inicialización del proyecto Flutter:

- Configuración de dependencias en `pubspec.yaml` (flutter_riverpod, go_router, drift, sqlcipher_flutter_libs).
- Configuración del theme Material 3 base y esquema de navegación inicial con GoRouter.

---

### 5. Infraestructura Local & Observabilidad (Docker Compose)

#### [NEW] [docker-compose.yml](file:///Users/yereth/Desktop/Commitment-v2/docker-compose.yml)

Configuración de servicios de soporte:

- **Redis:** Caché y almacén temporal.
- **NATS:** Servidor de mensajería ligero.
- **OTel Collector:** Recepción de trazas y métricas.
- **Prometheus:** Almacenamiento de métricas.
- **Grafana / Loki / Tempo:** Visualización de logs, trazas y métricas.

---

### 6. Integración Continua (GitHub Actions)

#### [NEW] [.github/workflows/ci.yml](file:///Users/yereth/Desktop/Commitment-v2/.github/workflows/ci.yml)

Configuración de CI básica:

- Validación de sintaxis, linting y compilación automática del Backend y del Frontend en cada Pull Request a `main`.

---

## Verification Plan

### Automated Tests

- Validar que `pnpm run build` y `pnpm run lint` pasen con éxito en todo el monorepo.
- Validar el inicio correcto del backend de NestJS con validación estricta de variables de entorno.
- Validar que la compilación de la app Flutter (`flutter build` o análisis estático `flutter analyze`) se ejecute sin errores.

### Manual Verification

- Levantar la infraestructura mediante `docker-compose up -d`.
- Verificar acceso a los paneles:
  - Grafana: `http://localhost:3000`
  - Prometheus: `http://localhost:9090`
  - Swagger UI: `http://localhost:4000/api/docs`
