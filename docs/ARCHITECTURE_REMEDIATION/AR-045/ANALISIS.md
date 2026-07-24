# AR-045 — Cero artefactos de despliegue para ambas apps

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 36 AR pendientes)

Parseadas todas las filas `⬜ Pendiente` de `REMEDIATION_ROADMAP_V1.md` tras el cierre de AR-003 (36 de
54; 17 cerradas, AR-052 en análisis/pausada). Filtradas por dependencias resueltas, ordenadas por
(Impacto desc, Esfuerzo asc, Riesgo asc). **AR-045 es la única candidata con Impacto Alto entre las
que tienen dependencias resueltas** — AR-048 empata en Impacto pero tiene Esfuerzo XL frente al
Esfuerzo L de AR-045. Sus 2 dependencias declaradas (AR-001, AR-043) están ambas cerradas. Owner=Ambos.

### Pregunta de framing que gobierna esta fase

> **¿Sigue el hallazgo original vigente en su totalidad, o alguna AR ya cerrada (en particular AR-001)
> resolvió parte de él?**

Se formula así porque el propio hallazgo original ya distinguía dos componentes de naturaleza distinta
y prioridad distinta — una contradicción de gobernanza (Prioridad Alta) y una ausencia de
infraestructura de despliegue (Prioridad Media) — y AR-001 tocó exactamente el tipo de contradicción
ADR↔Implementación que el primer componente describe.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-4-produccion/16-infraestructura.md`, It.16), con
dos componentes explícitamente separados por la propia auditoría:

1. **Cero artefactos de despliegue de cualquier tipo** — sin `Dockerfile`, sin `.dockerignore`, sin
   manifiestos de Kubernetes/Terraform/Pulumi, sin config de PaaS, sin `eas.json` para builds de
   producción de Expo, sin script `"deploy"` en ningún `package.json`. Prioridad: **Media** ("no hay
   usuarios reales todavía, la ausencia en sí no es urgente").
2. **Contradicción de gobernanza ADR-004↔ADR-011** — ADR-004 (aprobada) decidía Supabase; se construyó
   exactamente la alternativa que la propia ADR-004 rechazaba explícitamente (backend NestJS a medida);
   ADR-011 exige una ADR sustitutoria formal para cualquier cambio de Tecnología Preferida, y ninguna
   existía en el momento de la auditoría. Prioridad: **Alta** ("no es un problema de infraestructura
   faltante, es una violación en vivo del propio proceso de control de cambios del proyecto").

**Verificado hoy, componente por componente:**

1. **Artefactos de despliegue — confirmado, sin cambios.** Búsqueda exhaustiva, misma metodología que
   la auditoría: cero `Dockerfile` (raíz, `apps/backend/`, `apps/mobile/`), cero `eas.json`, cero
   script `"deploy"` en ningún `package.json`, cero paso de despliegue en `.github/workflows/ci.yml`.
   Solo existe `docker-compose.yml` (el stack local de Supabase, ya identificado por la auditoría como
   no usado por el backend, sin relación con el despliegue de producción).
2. **Contradicción ADR-004↔ADR-011 — completamente resuelta por AR-001, verificado, no asumido.**
   `docs/03-architecture/adr_024_official_technology_platform.md` se escribió explícitamente para
   satisfacer este requisito: cita literalmente _"Justificación (requerida por ADR-011 para cambiar
   una Tecnología Preferida)"_ y _"Cumple el proceso que **ADR-011** exige para cambiar Tecnologías
   Preferidas"_ — y reclasifica formalmente la autoridad normativa de ADR-004 (entre otras). La
   violación en vivo que la auditoría señaló como Prioridad Alta ya no existe.

### Hallazgo adicional: la dependencia con AR-043 no está explícita en el hallazgo original

El texto completo de `16-infraestructura.md` no menciona autenticación ni AR-043 en ningún punto —
la dependencia declarada en el Roadmap parece haberse asumido al redactar el borrador inicial ("no
desplegar antes de tener auth"), no derivarse de un requisito citado por la propia auditoría. No
cambia el resultado (AR-043 también está cerrada), pero se registra por la misma disciplina de
verificación que este programa ya aplica a toda dependencia declarada.

### Riesgo todavía vigente, no mencionado en el hallazgo pero relevante para el diseño

La auditoría señala explícitamente: escalar horizontalmente (más de una instancia del backend)
**rompería la corrección hoy**, porque cada instancia mantendría su propio estado en memoria
inconsistente con las demás (`InMemoryGoalRepository` y equivalentes). Verificado: AR-028 (cerrada)
introdujo concurrencia optimista sobre ese almacenamiento en memoria, pero no introdujo persistencia
real — los 7 aggregates reales siguen sobre repositorios en memoria, confirmado repetidamente a lo
largo de este programa (AR-043, AR-047, AR-050). Cualquier diseño de despliegue debe tratar esto como
una restricción real, no como un detalle a resolver más tarde.

### Respuesta a la pregunta de framing

> **El hallazgo original se confirma vigente solo parcialmente.** Su componente de mayor prioridad (la
> contradicción de gobernanza ADR-004↔ADR-011) está completamente resuelto por AR-001/ADR-024 — ya no
> existe ninguna violación en vivo del proceso de control de cambios. Su componente de menor prioridad
> declarada (cero artefactos de despliegue) sigue exactamente vigente, sin ningún cambio.

**Consecuencia para el alcance de AR-045:** el alcance se reduce al componente que sigue siendo real —
construir los artefactos de despliegue mínimos (Dockerfile, posiblemente `eas.json`, separación de
entornos) — no a resolver ninguna contradicción de gobernanza, que ya no existe. Mismo patrón de
"alcance reducido tras resolución parcial" que AR-002 (respecto a AR-001) y AR-009 (respecto a AR-002).
El riesgo de escalado horizontal (estado en memoria) debe tratarse como una restricción de diseño
explícita en Fase 2A/4A, no como un hallazgo nuevo.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**AR-045 vuelve a ser un caso donde conviene separar cuidadosamente los hallazgos originales.** La
evidencia de Fase 1 indica que uno de los dos componentes ya no existe, mientras que el otro
permanece intacto.

**H1 (principal):** _"AR-045 ya no trata sobre una contradicción arquitectónica de gobernanza; el
único problema arquitectónico vigente es la ausencia de una capacidad mínima de despliegue
reproducible para la plataforma."_ Explica toda la evidencia disponible: la contradicción
ADR-004↔ADR-011 fue absorbida y resuelta por AR-001 mediante ADR-024; el componente de despliegue
permanece exactamente igual que en la auditoría (cero `Dockerfile`, `eas.json`, scripts de despliegue,
pipeline de CI para despliegue); el riesgo de escalado horizontal no invalida el hallazgo — solo
introduce una restricción para el diseño posterior.

**Hipótesis alternativas descartadas:**

- **H2** — la AR sigue teniendo dos objetivos independientes. Descartada: la evidencia demuestra que
  uno de ellos desapareció; mantenerlo produciría una remediación artificialmente más grande de lo
  necesario.
- **H3** — la AR ya no es necesaria porque la contradicción principal fue resuelta. Descartada: el
  segundo hallazgo sigue existiendo íntegramente; la auditoría identificó dos problemas, uno fue
  absorbido, el otro no.
- **H4** — el problema real es la falta de escalado horizontal. Descartada como hipótesis principal:
  lo encontrado es una restricción arquitectónica, no el hallazgo auditado — la ausencia de despliegue
  reproducible existe incluso con una única instancia.

**H1 sobrevive**, formulada con mayor precisión: _"El alcance de AR-045 debe reducirse al
establecimiento de una capacidad de despliegue reproducible acorde con el estado actual de la
plataforma, eliminando del alcance cualquier contradicción de gobernanza ya resuelta por
remediaciones anteriores."_

**Tres conceptos distintos, registrados explícitamente para no confundirlos:**

1. **Hallazgo resuelto** — gobernanza ADR-004↔ADR-011, cerrado por AR-001/ADR-024.
2. **Hallazgo vigente** — no existe mecanismo de despliegue reproducible.
3. **Restricción arquitectónica** — mientras el estado permanezca en memoria, cualquier despliegue
   debe asumir una única instancia o un mecanismo equivalente de afinidad, hasta que otra AR modifique
   esa propiedad. Esta categoría no amplía el alcance de AR-045, pero condicionará las alternativas de
   Fase 4A.

**Expectativa registrada para Fase 2B, sin resolverla aquí:** si H1 se mantiene, D-045.1 debería
congelar propiedades como: la plataforma debe disponer de un proceso de despliegue reproducible; ese
proceso debe reflejar la arquitectura vigente, no la originalmente auditada; el mecanismo debe respetar
las limitaciones arquitectónicas actuales (el estado en memoria) sin intentar resolverlas dentro de
esta AR — sin convertir AR-045 en una remediación de infraestructura distribuida.

---

## Fase 2B — Decisión

**Estado: ✅ Cerrada. D-045.1 aprobada.**

La evidencia acumulada en Fase 1/2A ya no deja abierta la pregunta de **si** debe existir una
capacidad de despliegue — deja abierta únicamente **qué propiedad arquitectónica** debe congelarse
para cualquier mecanismo de despliegue futuro.

**D-045.1:**

> **La plataforma deberá disponer de una capacidad de despliegue reproducible, consistente con la
> arquitectura vigente y desacoplada de decisiones ya resueltas o de restricciones operativas que
> pertenezcan a otras remediaciones.**

Esta formulación mantiene el alcance exactamente donde H1 lo dejó: ni más amplio ni más estrecho.

**4 propiedades congeladas:**

1. **El despliegue es una capacidad arquitectónica.** La arquitectura deja de asumir despliegues
   manuales o implícitos; la reproducibilidad pasa a ser una propiedad del sistema. No congela
   **cómo** desplegar, solo que el despliegue debe ser repetible.
2. **Debe reflejar el estado arquitectónico actual.** El proceso de despliegue se construye sobre la
   arquitectura realmente vigente (ADR-024, AR-001, decisiones posteriores), nunca sobre
   contradicciones históricas ya resueltas — la antigua tensión ADR-004↔ADR-011 queda completamente
   fuera de D-045.1.
3. **Independencia de la infraestructura concreta.** La decisión no congela Docker, EAS, GitHub
   Actions, AWS, Amplify, Kubernetes, Railway ni Render — todos ellos son mecanismos posibles, no
   propiedades arquitectónicas.
4. **Respeto por las restricciones existentes.** El despliegue debe respetar las limitaciones
   actuales de la plataforma — en particular, si el estado continúa residente en memoria, el
   mecanismo de despliegue no debe asumir escalado horizontal que contradiga esa propiedad. Esto no
   convierte el estado en memoria en una decisión permanente; solo impide que AR-045 intente resolver
   un problema que pertenece a otra remediación.

**Deja deliberadamente abierto (Fase 4A):** contenedores, pipelines, imágenes, CI/CD, secretos,
registro de imágenes, estrategia blue/green, rolling updates, número de instancias, balanceadores,
proveedores cloud.

**Consistencia con el programa:** mismo patrón que AR-047 (congeló la separación
propuesta/ejecución, no el proveedor de IA), AR-050 (congeló la plataforma de IA, no el modelo LLM) y
AR-003 (congeló la clasificación del conocimiento, no la organización documental) — AR-045 congela la
reproducibilidad del despliegue, no la tecnología de despliegue. En todos los casos la decisión fija
una propiedad estable y deja los mecanismos para fases posteriores.

**Criterio de validación registrado para Fase 5** (5 preguntas): ¿existe un mecanismo de despliegue
reproducible?; ¿refleja la arquitectura vigente y no decisiones históricas ya superadas?; ¿es
independiente de un proveedor o tecnología concreta?; ¿respeta las restricciones arquitectónicas
actuales sin intentar resolverlas?; ¿sería posible sustituir la tecnología de despliegue sin
modificar D-045.1?

**Observación registrada, no promovida:** AR-045 marca una transición similar a la de otras
remediaciones recientes — el objetivo no es introducir una herramienta concreta, sino asegurar que la
plataforma posea una capacidad arquitectónica (despliegue reproducible) cuya implementación pueda
evolucionar con el tiempo, manteniendo la decisión estable incluso si cambian por completo las
tecnologías o la infraestructura utilizadas.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

Restricción fundamental que gobierna toda la fase: ninguna alternativa puede reabrir las 4
propiedades congeladas en D-045.1. La comparación se hace exclusivamente sobre el **mecanismo** de
despliegue.

**Alternativa A — Docker como artefacto principal de despliegue (elegida).** La plataforma define un
artefacto ejecutable y reproducible mediante contenedores; distintos mecanismos de despliegue (local,
CI, cloud) pueden construirse a partir de ese artefacto. Ventajas: desacopla el despliegue del
proveedor; produce un artefacto reproducible; compatible con la mayoría de plataformas de hosting
actuales; no presupone CI/CD concreto; respeta D-045.1 al centrarse en la capacidad de despliegue, no
en infraestructura específica. Limitación reconocida: no resuelve por sí mismo el escalado
horizontal, pero tampoco lo contradice — una única instancia sigue siendo una configuración válida
mientras exista estado en memoria.

**Alternativa B — Pipeline específico de un proveedor (descartada).** Amplify, Railway, Render,
Fly.io, Vercel u otro proveedor concreto. Descartada: liga el despliegue a una plataforma específica,
contradice directamente la 3ª propiedad de D-045.1 (independencia del mecanismo concreto).

**Alternativa C — CI/CD como punto de partida (descartada).** Comenzar por GitHub Actions, scripts de
release, automatización de despliegue. Descartada: la automatización presupone que ya existe un
artefacto reproducible; sin ese artefacto, el pipeline solo automatiza un proceso que sigue
dependiendo del entorno.

**Alternativa elegida: A.** Secuencia conceptual: (1) definir el artefacto reproducible; (2) validar
que puede ejecutarse de forma consistente; (3) incorporar automatización después; (4) integrar
proveedores de despliegue al final. Este orden mantiene las responsabilidades separadas.

**Explícitamente fuera de alcance de Fase 4A** (mecanismos posteriores construibles sobre el
artefacto reproducible, no decisiones de esta fase): GitHub Actions, EAS Build, Docker Compose,
Kubernetes, ECS, Helm, Terraform, secretos, balanceadores, múltiples entornos, blue/green, rolling
deployment.

**Criterio de validación fijado antes de Fase 4B** (5 preguntas): el despliegue puede reproducirse
sin depender del entorno del desarrollador; cambiar de proveedor no exige modificar D-045.1; la
solución no presupone escalado horizontal; la automatización puede añadirse después sin rediseñar el
mecanismo; el artefacto generado representa fielmente la arquitectura vigente.

**Observación registrada, no promovida:** AR-045 repite la misma secuencia de diseño que AR-050 en
otro dominio — primero estabilizar el contrato/artefacto independiente, después conectar
implementaciones concretas (en AR-050, el contrato de la plataforma de IA antes que
`LLMProposalAdapter`; aquí, el artefacto de despliegue —Docker— antes que automatización/CI-CD o un
proveedor cloud concreto). "Primero se estabiliza el punto de integración independiente; después se
conectan las implementaciones específicas."

---

## Fase 4B — Implementación

**Estado: ✅ Cerrada.**

Alcance deliberadamente pequeño: no construir una plataforma de despliegue completa, materializar
exactamente la capacidad arquitectónica congelada en D-045.1 mediante el artefacto mínimo
reproducible elegido en Fase 4A (Docker).

**Implementado — 2 archivos nuevos, ambos en la raíz del repositorio y `apps/backend/`:**

- **`apps/backend/Dockerfile`** — build multi-stage: etapa `builder` (`node:20-alpine`, `corepack
enable`, `python3`/`make`/`g++` para compilar el binario nativo de `argon2`) que copia el
  repositorio completo, ejecuta `pnpm install --frozen-lockfile` y construye explícitamente en el
  orden de dependencias real (`@commitment/shared` → `@commitment/domain` → `backend`); etapa
  `runner` (`node:20-alpine` limpia) que copia el árbol completo de `/app` ya construido desde
  `builder` y arranca `node apps/backend/dist/main.js`. `NODE_ENV=production` fijado en la etapa de
  ejecución; ninguna variable de entorno específica, secreto o URL queda fijada en el Dockerfile
  (Propiedad 4 del Diseño técnico).
- **`.dockerignore`** (raíz) — excluye `node_modules`, `dist`, `build`, `.turbo`, `coverage`, `.git`
  y directorios irrelevantes para el build (`docs`, `apps/mobile/ios`, `apps/mobile/android`),
  garantizando que la instalación de dependencias ocurra siempre dentro del contenedor, nunca
  reutilizando el estado de la máquina del desarrollador (Propiedad de "contexto de construcción").

**Dos hallazgos reales encontrados durante la implementación, ninguno reabre D-045.1 ni el diseño de
Fase 4A:**

1. **`argon2` (dependencia nativa de `Authentication`, AR-043) no compila en `node:20-alpine` sin
   herramientas de compilación.** `node-gyp` requiere Python y un compilador C/C++, ausentes en la
   imagen base mínima. Resuelto instalando `python3 make g++` únicamente en la etapa `builder` (no
   en `runner`) — un defecto de implementación esperado al compilar un binario nativo en Alpine, no
   una decisión de diseño nueva.
2. **`turbo run build --filter=backend` falla dentro del contenedor** con `unable to spawn child
process: No such file or directory (os error 2)`, reproducible incluso instalando `bash`/
   `libc6-compat`. Diagnóstico con `turbo run build --dry=json`: `@commitment/config` (dependencia
   de desarrollo de `@commitment/shared`/`@commitment/domain`, sin script `build` en su
   `package.json`) resuelve a un comando literal `"<NONEXISTENT>"` que turbo intenta ejecutar como
   proceso real — falla con el mismo `os error 2` observado. En el host (macOS, `turbo run build`
   sin `--filter`) este caso no produce error visible; con `--filter` dentro de un contenedor Linux
   sí lo hace. **No es un hallazgo de esta AR ni se corrige aquí** — evitado en la implementación sin
   tocar `packages/config` ni ningún paquete ajeno a AR-045: el Dockerfile invoca `pnpm --filter=<pkg>
run build` explícitamente en el orden de dependencias real (`shared` → `domain` → `backend`) en
   lugar de delegar en turbo. Registrado en `HALLAZGOS_PENDIENTES.md` como debt de tooling
   independiente, mismo criterio que AR-028 con `InMemoryEventStore.saveEvents()`.

**Validación real ejecutada (no solo `docker build`, el contenedor arrancado y consultado):**

- `docker build --no-cache -f apps/backend/Dockerfile .` — build completo desde cero, sin caché,
  éxito.
- `docker run` con el JWT_SECRET mínimo requerido — arranca, inicializa los 17 módulos de Nest
  (incluyendo `AuthenticationModule` de AR-043 y las cabeceras/CORS de AR-044), mapea todas las rutas
  HTTP reales.
- `curl /v1/health` → `200 {"status":"ok",...}` (outbox backlog y projection lag reales, no mocks).
- `curl /api/docs` (Swagger) → `200`.
- Los errores `ECONNREFUSED 127.0.0.1:6379` de BullMQ al arrancar son **esperados y fuera de
  alcance**: Redis no está expuesto dentro del contenedor de prueba — la integración con
  infraestructura de colas/mensajería pertenece a un mecanismo posterior (Fase 4A ya excluyó
  explícitamente `docker-compose.yml`/orquestación), no a este artefacto.
- Segundo build limpio (`--no-cache`, sin ninguna capa cacheada) reproduce exactamente el mismo
  resultado — confirma que el artefacto no depende de estado previo de la máquina.

**Explícitamente NO implementado, tal como fijó Fase 4A:** `docker-compose.yml` de aplicación,
GitHub Actions, `eas.json`, despliegue automático, múltiples imágenes, balanceadores, health checks
avanzados, escalado horizontal, observabilidad adicional, orquestadores. El `docker-compose.yml` ya
existente en el repo (Redis/OTel/Prometheus/Grafana, stack de observabilidad local) no se modificó —
sigue siendo un stack de desarrollo, no el mecanismo de despliegue de producción.

---

## Fase 5 — Validación

**Estado: ✅ Cerrada.**

Las 5 preguntas de Fase 4A, respondidas con evidencia real, no por inspección:

1. **¿Existe un `Dockerfile` reproducible para `apps/backend`?** Sí — `apps/backend/Dockerfile`,
   build multi-stage verificado dos veces (con y sin caché).
2. **¿La imagen puede construirse desde un entorno limpio sin depender de la máquina del
   desarrollador?** Sí — `docker build --no-cache` reprodujo el mismo resultado; `.dockerignore`
   excluye `node_modules`/`dist` del contexto, forzando instalación y build íntegros dentro del
   contenedor.
3. **¿El contenedor ejecuta exactamente el backend previsto por la arquitectura vigente?** Sí — los
   17 módulos de Nest se inicializan (incluidos `AuthenticationModule`/AR-043,
   cabeceras-CORS/AR-044), `/v1/health` y `/api/docs` responden 200 con datos reales.
4. **¿Cambiar de proveedor cloud no requiere modificar el Dockerfile?** Sí por construcción — el
   Dockerfile no referencia ningún proveedor, servicio gestionado, secreto ni URL; produce una
   imagen OCI estándar ejecutable en cualquier entorno compatible con contenedores.
5. **¿La implementación respeta la restricción actual de una única instancia derivada del estado en
   memoria, sin intentar resolverla?** Sí — el Dockerfile no asume ni configura múltiples réplicas,
   balanceador ni coordinación entre instancias; la restricción permanece explícita y sin alterar.

**Criterio de cierre de AR-045 (fijado en Fase 4A), verificado:** existe un artefacto Docker
reproducible; la capacidad de despliegue deja de depender de procesos manuales implícitos; el
artefacto es independiente del proveedor; las restricciones arquitectónicas actuales permanecen
explícitas y sin alteración; futuras automatizaciones (CI/CD, despliegues gestionados o proveedores
cloud) pueden añadirse sin modificar D-045.1 — el Dockerfile no presupone ninguna de ellas.

---

## Estado

**AR-045 CERRADA.** Fases 1, 2A, 2B, 4A, 4B y 5 completas. D-045.1 materializada mediante
`apps/backend/Dockerfile` + `.dockerignore` — artefacto Docker reproducible, independiente de
proveedor, que respeta la restricción de estado en memoria sin intentar resolverla. Un hallazgo de
tooling (turbo + Alpine + paquete sin script `build`) evitado sin tocar código ajeno a esta AR,
registrado como debt independiente en `HALLAZGOS_PENDIENTES.md`. Estado: 🟦 → ✅ Cerrada. Decisión:
✅ Decisión aprobada → ✔️ Validada.
