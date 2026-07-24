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

## Estado

**Fase 1, Fase 2A y Fase 2B cerradas.** D-045.1 aprobada: la plataforma deberá disponer de una
capacidad de despliegue reproducible, consistente con la arquitectura vigente y desacoplada de
decisiones ya resueltas o de restricciones operativas de otras remediaciones. Pendiente: **Fase 4A
(Diseño técnico)** — comparar alternativas concretas de mecanismo de despliegue sin reabrir ninguna
de las 4 propiedades congeladas. Estado: se mantiene 🟦 En análisis. Decisión: 💭 → ✅ Decisión
aprobada.
