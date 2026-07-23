# 🏛️ ADR-021: Goal Backend y infraestructura común de historial de dominio

**Estado:** ✅ Aprobada (2026-07-17).

---

## Contexto

Con ADR-019 (modelo de dominio visible) y ADR-020 (Universal Capture) cerradas y adoptadas como
línea base, el roadmap retomó la siguiente iniciativa estratégica: **Goal Backend / CQRS / Event
Store**. Siguiendo el mismo proceso validado dos veces (Investigación → Alternativas → Decisión →
Implementación), la investigación empezó definiendo el problema, no la solución.

**Paso 1 — Assessment** (`docs/03-architecture/goal_backend_current_assessment.md`), evidencia
verificada leyendo el código directamente:

- **El problema inmediato no es CQRS ni Event Store — es que Goal no tiene backend en absoluto.**
  `packages/domain/src/goal/` es un Aggregate Root completo; `apps/backend/src/` no tiene ningún
  módulo `goal/`. El propio código lo documenta: `goals.api.ts` enruta _todo_ al repositorio demo,
  "regardless of Demo Mode" — hoy, para cualquier usuario real, los Goals no sobreviven ni un
  refresh.
- **Commitment, Task y Habit ya usan, con éxito, el mismo patrón:** CQRS parcial (comandos,
  handlers, projectors, query services) con **estado versionado como fuente de verdad** — no
  Event Sourcing. Los eventos de dominio se despachan solo para efectos secundarios.
- **Un `InMemoryEventStore` completo ya existe** (concurrencia optimista real, streams por
  agregado) — registrado en DI (`task.module.ts`) pero **nunca invocado** en ningún punto del
  código (verificado por búsqueda exhaustiva de `saveEvents()`/`getEvents()`). Su existencia no
  constituye evidencia de que haga falta usarlo.
- **El historial ya se resuelve, para Commitment, sin Event Sourcing.** ADR-014 (Activity History
  Recommendations, aprobada previamente) estableció el contrato `ActivityRecord`/`ActivityType`
  con metadata versionada y paginación por cursor. La implementación (`ActivityLoggerHandler` →
  `InMemoryActivityRepository`) funciona en producción hoy — es un contraejemplo directo a
  "necesitamos Event Sourcing para tener historial". Task y Habit no tienen ningún mecanismo
  equivalente.
- **El único dolor técnico medido, no hipotético:** ~7 archivos por comando backend (command,
  handler, nestjs-handler, result, DTO, 2 tests); 41-64 archivos por módulo de agregado. Es
  independiente de la estrategia de persistencia — Event Sourcing no lo reduciría por sí solo.

**Paso 2/3 — Alternativas** (`docs/03-architecture/goal_backend_alternatives_evaluation.md`)
comparó tres estrategias de persistencia (deliberadamente sin titular la investigación "CQRS vs.
Event Store", para no presuponer la respuesta) contra siete criterios derivados directamente del
Assessment. Resultado, con razonamiento explícito, no solo preferencia:

- **Extender el patrón actual sin más** resuelve el problema inmediato con el menor riesgo, pero
  deja a Goal sin historial — la misma situación que Task/Habit tienen hoy.
- **Migrar a Event Sourcing real** (el Event Store como fuente de verdad, con replay) es la opción
  de mayor riesgo medido contra las restricciones del propio Assessment (migración gradual, sin
  precedente de Event Sourcing funcionando en este backend) y sin que ninguna necesidad de
  producto confirmada lo exija específicamente. Sigue siendo válida a más largo plazo, pero la
  carga de la prueba no está satisfecha todavía.
- **Generalizar el mecanismo de historial de dominio, usando el Event Store existente como
  implementación** resultó la mejor evaluada — no porque "haya que usar lo que ya existe", sino
  porque el producto ya necesita una infraestructura común de historial (ADR-014 la estableció
  solo para Commitment; Task/Habit no la tienen), y el Event Store ya construido provee
  exactamente lo que esa infraestructura necesita (streams por agregado, concurrencia optimista,
  persistencia append-only) sin reimplementarlo desde cero.

## Decisión

**1. Construir `apps/backend/src/goal/`** siguiendo el patrón CQRS + estado versionado ya usado
por Commitment/Task/Habit — mismo tipo de repositorio en memoria (`Map` + contador de versión),
mismos comandos derivados de los métodos ya definidos en el agregado de dominio
(`register`/`rename`/`linkCommitment`/`linkHabit`/`complete`/`archive`). El estado
versionado del agregado sigue siendo, sin excepción, la fuente de verdad.

> **Corrección (2026-07-20, AR-028):** esta ADR describía el patrón `Map + versión` de
> Commitment/Task/Habit como concurrencia optimista "ya probada". No lo era — el contador de
> versión existía, pero ningún repositorio comparaba/rechazaba en `save()` (compare-and-swap real).
> El diseño de estado-como-fuente-de-verdad y Event Store-como-auditoría descritos en esta ADR
> siguen siendo correctos y no cambian; **AR-028** (`docs/ARCHITECTURE_REMEDIATION/AR-028/ANALISIS.md`)
> completa la concurrencia optimista que aquí se asumió prematuramente como ya lograda.

**2. Persistir eventos de dominio como infraestructura común de historial, manteniendo el estado
versionado como fuente de verdad.** Se conecta el `InMemoryEventStore` ya existente (hoy sin uso)
como bitácora duradera de eventos de dominio, generalizando el patrón que ADR-014 estableció
específicamente para Commitment. **Goal es el primer consumidor** de esta infraestructura común
desde su construcción.

## Aclaración arquitectónica — B no introduce Event Sourcing

El backend mantiene dos responsabilidades ya existentes, sin fusionarlas:

```text
Command → Aggregate → Current State Repository   (fuente de verdad — sin cambios)
Domain Events → Event Store → Consumers          (bitácora duradera — no reconstrucción de estado)
```

El Event Store pasa de "construido y sin uso" a "bitácora duradera de eventos de dominio para
quien los consuma" (hoy: historial; potencialmente después: el candidato de roadmap Analytics
Engine) — **no** al mecanismo para reconstruir el estado de un agregado. Esta distinción es la que
separa esta decisión de una migración a Event Sourcing real, y es la razón por la que no se
requiere una migración de los tres módulos existentes para adoptarla.

## Alcance explícito

- **Solo la infraestructura, no la migración obligatoria de todos los agregados.** Esta ADR
  establece que existe una infraestructura común de historial disponible — no que todo agregado
  deba producirlo. Secuencia: ADR → Goal la usa → Commitment/Task/Habit migran después, **solo si
  aportan valor demostrado**, no como consecuencia automática de esta decisión. Task y Habit
  podrían generar un volumen de eventos diario mucho mayor que Commitment sin que esté demostrado
  que el producto quiera conservarlos todos — esa evaluación queda explícitamente abierta, por
  agregado, no resuelta de antemano.
- **Explícitamente fuera de esta ADR:** reducir el boilerplate por comando (~7 archivos/comando,
  el único dolor técnico medido en el Assessment). Es un eje ortogonal a la estrategia de
  persistencia, compatible con cualquiera de las alternativas evaluadas — no debe bloquear que
  Goal tenga backend. Registrada como iniciativa futura independiente, **"Backend Infrastructure
  Simplification"**, no como parte de esta decisión.
- **Explícitamente fuera de esta ADR:** migrar Commitment/Task/Habit a Event Sourcing real
  (Alternativa C evaluada y no elegida). Sigue siendo una dirección válida a largo plazo si en
  algún momento aparece evidencia de que reconstruir estado desde eventos aporta un beneficio
  real — no antes.

## Consecuencias

- **Positivas:** resuelve el problema real confirmado por el Assessment (Goal sin persistencia)
  con el patrón de menor riesgo ya probado en producción; convierte el Event Store de activo sin
  usar en infraestructura con propósito, sin comprometerse a Event Sourcing sin evidencia;
  generaliza (no duplica) el contrato ya aprobado en ADR-014.
- **Riesgo aceptado:** ninguno nuevo respecto al patrón ya en producción para los otros tres
  agregados — la única pieza genuinamente nueva es conectar el Event Store, ya probado en su
  propia lógica de concurrencia.
- **Deuda evitada:** no se repite el patrón de Commitment (`ActivityLogger` construido ad hoc,
  nunca replicado por Task/Habit) — la infraestructura queda disponible para cualquier agregado
  que la necesite, sin forzar su adopción.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS**
