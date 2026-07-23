# AR-053 — 409 reproducible en el primer comando sobre una entidad recién creada

**Estado final: ✅ Cerrada como falso positivo de remediación (2026-07-23).** La Fase 1 refutó la
hipótesis de apertura (interacción Saga/OCC) con evidencia directa: el sistema aplica correctamente
dos invariantes de negocio ya documentados y deliberados (ADR-022 §3.1; "Decisión B, Goal Lifecycle").
No existe ningún defecto arquitectónico ni de implementación que remediar — por eso esta AR no continúa
por Modelo arquitectónico / Alternativas / Decisión / Diseño técnico. Se cierra directamente tras la
Fase 1, sin pasar por el resto del ciclo, porque no hay nada que esas fases evaluarían.

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.** Alcance explícitamente acotado por el usuario a 4 pasos, sin depurar ni
proponer soluciones: (1) reproducir de forma determinista, (2) localizar el primer punto donde aparece
el 409, (3) identificar qué componente lo devuelve realmente, (4) construir la línea temporal completa.

### Pregunta de framing que gobierna esta fase

> **¿El 409 es un defecto del comportamiento del sistema o un defecto de la expectativa del test?**

### 1. Reproducción determinista

Aislado a un único test por ejecución, sin ningún otro archivo/test corriendo en el mismo proceso
(elimina cualquier duda sobre contaminación cruzada, incluida la fuga de BullMQ de AR-054):

```
pnpm exec jest --config ./test/jest-e2e.json commitments.e2e-spec.ts \
  -t "should activate a registered commitment"
```

Resultado: **100% reproducible.** `POST /commitments` → 200. `POST /commitments/:id/activate`
(inmediatamente después, mismo test, mismo `AppModule` fresco) → **409**, no 200. Redis verificado
accesible de antemano (`docker exec commitment-redis redis-cli ping` → `PONG`) — descartado como
causa. El mismo patrón se confirma en `goals.e2e-spec.ts` para `POST /goals/:id/complete`.

### 2 y 3. Punto exacto de origen y componente que lo produce

**Caso Commitment** — `apps/backend/src/commitment/api/commitments.controller.ts`, endpoint
`activate()`: captura la excepción de `ActivateCommitmentCommandHandlerCore.handle()` y mapea
`CommitmentStateConflictError` → `ConflictException` (409). Rastreado hasta
`activate-commitment.handler.ts` líneas 90-96:

```ts
if (error instanceof CommitmentActivationRequirementsNotMetError) {
  throw new CommitmentStateConflictError(...);
}
```

`CommitmentActivationRequirementsNotMetError` se origina en el propio aggregate `Commitment`, a
través de `commitment.activate(hasExecutionPlan)` (línea 73) — `hasExecutionPlan` viene de
`TaskBasedCommitmentActivationPreconditions.hasExecutionPlan()`
(`apps/backend/src/task/application/preconditions/commitment-activation.preconditions.ts`), que
consulta si existe al menos un `Task` no cancelado enlazado a ese `Commitment` (ADR-022 §3.1, "Command
Preconditions"). **No es `OptimisticConcurrencyError` (AR-028), no es una Saga — es un invariante de
negocio deliberado y ya implementado: un Commitment no puede activarse sin un plan de ejecución
(Task) enlazado.**

**Caso Goal** — mismo patrón, invariante distinto: `packages/domain/src/goal/aggregate/goal.ts`,
método `complete()` (línea 207-215):

```ts
// Decisión B, Goal Lifecycle: Draft can no longer complete directly —
// it must go through Active first (activate()).
if (this._state !== GoalState.Active) {
  throw new InvalidGoalStateTransitionError(...);
}
```

Un `Goal` recién registrado nace en estado `Draft` (línea 257 del mismo archivo). `complete()` exige
estado `Active`. `InvalidGoalStateTransitionError` se envuelve como `GoalStateConflictError` en
`complete-goal.handler.ts`, mapeado a 409 en `goals.controller.ts`. **Tampoco es OCC ni una Saga — es
la máquina de estados documentada del propio agregado ("Decisión B, Goal Lifecycle").**

**Ninguno de los dos casos tiene relación con AR-028 (concurrencia optimista) ni con ninguna Saga** —
la hipótesis registrada al cerrar AR-008 (interacción `eventDispatcher`/Saga) queda descartada por
evidencia directa, no confirmada.

### 4. Línea temporal completa, reconstruida con `git log` sobre los archivos reales

**Caso Commitment:**

| Fecha      | Commit    | Evento                                                                                                                                                                                                                                                                          |
| ---------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-04 | `6d220fd` | `POST /commitments` implementado (vertical slice de registro)                                                                                                                                                                                                                   |
| 2026-07-04 | `4c6ec14` | `POST /commitments/:id/activate` implementado — **sin** precondición de execution-plan. El test e2e "should activate a registered commitment" se escribe aquí, correctamente, para el comportamiento de ese momento (activar sin Task enlazado = válido)                        |
| 2026-07-18 | `1ead830` | ADR-022 (Task Lifecycle & Execution Model) implementado — introduce la precondición `hasExecutionPlan` en `ActivateCommitmentCommandHandlerCore`. **Este commit no modifica `commitments.e2e-spec.ts`** (confirmado: `git show --stat` sobre este commit no incluye el archivo) |

**Caso Goal:**

| Fecha                      | Commit                        | Evento                                                                                                                                                                    |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-17                 | `e45c722`/`00915d8`/`aa8c8ab` | Goal backend implementado — `goals.e2e-spec.ts` escrito, con tests que llaman `/complete` directamente tras `/register`, sin `/activate` intermedio                       |
| 2026-07-18 (día siguiente) | `b35021b`                     | _"feat(goal): implement Goal Lifecycle (Decisión B) and Draft Editing"_ — introduce la regla _"Draft can no longer complete directly — it must go through Active first."_ |

**Patrón idéntico en ambos casos, con un día de diferencia entre sí:** el test e2e se escribió cuando
el comportamiento todavía lo permitía; **al día siguiente** una decisión de dominio ya documentada
(ADR-022 §3.1 / "Decisión B, Goal Lifecycle") cambió las reglas de activación/completado, y el test
nunca se actualizó — porque nada lo iba a ejecutar de nuevo para avisar (la historia completa de
AR-008: e2e nunca corrió en CI).

### Respuesta a la pregunta de framing

> **El 409 es, en ambos casos, un defecto de la expectativa del test — no del comportamiento del
> sistema.** El sistema aplica correctamente dos invariantes de negocio ya documentados y deliberados
> (ADR-022 §3.1; "Decisión B, Goal Lifecycle"). Los tests e2e quedaron desactualizados el día siguiente
> a escribirse, y la ausencia de ejecución en CI (AR-008) es la razón por la que nadie lo notó durante
> semanas.

**Consecuencia directa para el alcance de AR-053:** no hay ningún hallazgo de dominio, concurrencia, ni
Sagas que corregir. El "defecto" real — si existe uno — es que dos e2e tests no reflejan el contrato
actual del sistema. Esto reduce drásticamente la complejidad de esta AR frente a la hipótesis con la
que se abrió (interacción Saga/OCC).

---

## Decisión de cierre (2026-07-23)

**AR-053 se cierra como falso positivo de remediación** — hipótesis refutada por evidencia directa, sin
ningún defecto arquitectónico ni de implementación. El sistema cumple correctamente el contrato de
dominio actual (ADR-022 §3.1 para Commitment; "Decisión B, Goal Lifecycle" para Goal).

La corrección de los dos tests e2e desactualizados **no se ejecuta como parte de esta AR** — es trabajo
ordinario de mantenimiento, fuera del programa de remediación formal, porque no corrige ningún defecto
del sistema, solo actualiza una expectativa de test que había quedado desincronizada del contrato real.
Realizado y verificado el mismo día, fuera de este documento:

- `apps/backend/test/commitments.e2e-spec.ts` — añadida `description` y un `Task` enlazado antes de
  `activate()` en los 2 tests afectados. **9/9 tests pasando.**
- `apps/backend/test/goals.e2e-spec.ts` — añadidos `description` + enlace de `Commitment` + `activate()`
  antes de `complete()` en los 3 tests afectados (incluida la actualización de las aserciones de
  `GET /goals/:id/history`, que ahora incluye los eventos `goal.commitment_linked` y `goal.activated`
  introducidos por el propio fix). **19/19 tests pasando en aislamiento; 17-18/19 en ejecución conjunta
  del archivo**, con el resto fallando por un error no relacionado (ver nota AR-054 abajo).
- Suite completa (`pnpm test:e2e`, los 3 archivos): **26-29/29 tests pasando** según la ejecución —
  variación explicada íntegramente por AR-054, no por AR-053 (ver nota).

**Nota sobre AR-054 (no es un hallazgo nuevo):** al ejecutar los archivos completos (no un test aislado),
aparecen entre 1 y 3 fallos adicionales, siempre con la misma firma exacta: `Unhandled error. (Error:
Connection is closed.)` desde `ioredis`/`bullmq`, nunca una aserción del test. El test que "recibe" el
error cambia de una ejecución a otra (confirmado corriendo la suite completa 2 veces: primero afectó a
"should complete a goal idempotently", después a "should rename a goal" y "should return 404 for unknown
goal id") — consistente con una conexión Redis/BullMQ que queda abierta tras el `afterEach` de un test
anterior y se cierra de forma asíncrona en medio de la ejecución del siguiente. Esto es exactamente el
defecto ya registrado como **AR-054** (fuga de recursos en el teardown del Worker de BullMQ), no una
nueva investigación — se documenta aquí solo como evidencia adicional de reproducción, no como hallazgo
nuevo. Confirmado además que cada uno de los 3 tests afectados **pasa limpiamente en aislamiento**
(`-t "..."`), aislando la causa al teardown cruzado entre tests, no al contenido de ningún test individual.

**Consecuencia para el criterio de cierre:** siguiendo la instrucción explícita del usuario — "si tras
actualizar los tests sigue apareciendo algún fallo, ese sí sería el nuevo punto de partida para una
investigación" — se verificó que el/los fallo(s) residual(es) no son nuevos: coinciden en firma, origen
y comportamiento no determinista con AR-054, ya creada y ya pendiente en el Roadmap. No se abre una
tercera AR ni se reabre AR-053.

**Hipótesis en observación registrada (ver README.md):** _"Antes de atribuir un fallo e2e al sistema,
verificar si el contrato del test sigue siendo contemporáneo al contrato del dominio."_ Un punto de dato.
