# AR-022 — TD-003: chequeos de idempotencia redundantes en handlers Activate/Pause

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 33 AR pendientes)

Parseadas todas las filas no cerradas de `REMEDIATION_ROADMAP_V1.md` tras el cierre de AR-049 (33 de
54; 21 cerradas, AR-052 en análisis/pausada). Filtradas por dependencias resueltas, ordenadas por
(Impacto desc, Esfuerzo asc, Riesgo asc). **Por primera vez desde AR-045, no queda ninguna candidata
con Impacto Alto entre las de dependencias resueltas** — la franja más alta disponible es Impacto
Medio. Dentro de ella, **AR-022 es la única con Esfuerzo XS** (todas las demás candidatas de Impacto
Medio son Esfuerzo S o superior), Riesgo Bajo, cero dependencias. Owner=Claude, Decisión=N/A
(ejecución directa).

### Pregunta de framing que gobierna esta fase

> **¿Sigue existiendo exactamente la misma duplicación de lógica de idempotencia entre los handlers
> de aplicación y el aggregate de dominio, sin ningún cambio desde que TD-003 se diagnosticó por
> primera vez?**

Se formula así porque el hallazgo original ya llegó con un diagnóstico y una corrección
completamente especificados (`docs/ARCHITECTURE_REVIEW/fase-1-nucleo/04-cqrs.md`) — la única
pregunta real de Fase 1 es si ese diagnóstico sigue siendo exacto hoy.

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-1-nucleo/04-cqrs.md`, It.4; registrado también
en `TECH_DEBT.md` Item 2 desde el commit `043ae59`, el mismo que implementó VS-004): _"La lógica de
idempotencia se ha filtrado a la capa de handler, pero solo en los handlers Activate/Pause de
`Commitment`, no en los de `Task`."_ `ActivateCommitmentCommandHandlerCore.handle()` y
`PauseCommitmentCommandHandlerCore.handle()` pre-verifican el estado objetivo y retornan
anticipadamente antes de invocar al aggregate — pero `Commitment.activate()`/`.pause()` ya realizan
exactamente el mismo chequeo internamente (Regla #77, "No Meaningless Events"). Comparado
directamente contra `CompleteTaskCommandHandlerCore`, que no tiene ningún pre-check y simplemente
confía en el aggregate — la auditoría lo cita como el patrón de referencia sin redundancia.
**Prioridad: Quick Win** (`PROJECT_HEALTH_DASHBOARD.md`: Impacto Alto, Esfuerzo XS).

**Verificado hoy, línea por línea, sin cambios:**

1. **`ActivateCommitmentCommandHandlerCore.handle()`** (líneas 55-63 actuales): pre-check idéntico —
   `if (commitment.state === CommitmentState.Active) { ...return early... }`, incluyendo una llamada
   extra a `this.commitmentRepository.save(commitment)` en el camino idempotente (el "round-trip
   extra" ya señalado por la auditoría).
2. **`Commitment.activate()`** (`packages/domain/src/commitment/aggregate/commitment.ts`, líneas
   143-147): mismo chequeo exacto — `if (this._state === CommitmentState.Active) { /* Idempotent:
already active, no state change or event */ return; }`. Números de línea casi idénticos a los
   citados por la auditoría original — el código no se ha movido.
3. **`PauseCommitmentCommandHandlerCore.handle()`** (líneas 52-60): mismo patrón exacto de
   pre-check + `save()` extra en el camino idempotente.
4. **`Commitment.pause()`** (líneas 171-175): mismo chequeo exacto duplicado.
5. **`CompleteTaskCommandHandlerCore.handle()`**: confirmado, sigue sin ningún pre-check de estado —
   sigue siendo el patrón de referencia limpio.
6. **Precedente interno adicional, no citado por la auditoría original:** los handlers de `Habit`
   tampoco tienen ningún pre-check de estado (grep exhaustivo, cero coincidencias de `state ===` en
   `apps/backend/src/habit/application/commands/`) — un segundo bounded context, además de `Task`,
   que confirma que el patrón redundante no es necesario en ningún otro lugar del código.
7. **Git history confirma cero AR ha tocado estos archivos:** el último commit que modificó
   `activate-commitment.handler.ts`/`pause-commitment.handler.ts` es `043ae59` (VS-004, el commit
   original que registró TD-003) — ninguna remediación de este programa los ha tocado desde entonces.

### 2. Evidencia corroborante fuera de `docs/ARCHITECTURE_REVIEW/` (no autoritativa para este programa, pero consistente)

`engineering/governance/architecture_product_audit_2026Q3.md` (auditoría independiente, 2026-07-15,
un día antes de ADR-019, fuera del corpus `docs/ARCHITECTURE_REVIEW/` en el que se basa este
programa) vuelve a mencionar TD-003 como no resuelto y sugiere explícitamente usar los handlers de
`Habit` como patrón de referencia — coincide de forma independiente con el punto 6 de arriba, sin
haber sido buscado para confirmarlo. No se trata como fuente autoritativa de esta AR (pertenece a un
corpus de auditoría distinto), solo se registra como corroboración adicional.

### 3. La suite de tests existente ya protege la corrección de la solución

`activate-commitment.handler.spec.ts:83` ("should be idempotent — activating three times returns
same version with one event total") y el test equivalente en `pause-commitment.handler.spec.ts`
verifican **comportamiento observable** (versión sin cambios, cero eventos en llamadas repetidas) —
no verifican dónde vive el chequeo. Eliminar el pre-check del handler y confiar en el idempotent
no-op del aggregate produce el mismo resultado observable, sin el `save()` extra — estos tests deben
seguir pasando sin modificarse, y sirven como protección de regresión directa para la corrección.

### Respuesta a la pregunta de framing

> **El hallazgo original se confirma vigente en su totalidad, sin ningún cambio.** La duplicación
> exacta que la auditoría diagnosticó sigue presente, en las mismas líneas de código, con la misma
> extensión (solo Commitment, no Task ni Habit). La corrección ya estaba completamente especificada
> por la propia auditoría: eliminar el pre-check de nivel handler, invocar el método del aggregate
> incondicionalmente, dejar que su propio no-op idempotente maneje el caso de repetición.

**Consecuencia para el alcance de AR-022:** a diferencia de AR-048/AR-049 (arquitectura nueva) o
AR-045 (infraestructura), esta AR es una corrección puntual y acotada — Owner=Claude, Decisión=N/A,
exactamente como la clasifica el Roadmap. No hay hipótesis que plantear ni decisión arquitectónica
que congelar: el hallazgo, el diagnóstico y la corrección ya vienen dados por la evidencia. Procede
directamente a Fase 4B (Implementación), sin Fase 2/2B/4A — mismo patrón de "ejecución directa" ya
usado en AR-008/AR-044/otras ARs con Owner=Claude y hallazgo ya completamente diagnosticado.

---

## Fase 4B — Implementación

**Estado: ✅ Cerrada.**

Remediación de implementación, no de arquitectura — el dominio ya expresaba correctamente la regla
(Regla #77); los handlers simplemente la duplicaban. Objetivo estricto: eliminar la redundancia,
preservando exactamente el comportamiento observable.

**Implementado — 2 archivos de producción modificados, ambos en `apps/backend/src/commitment/application/commands/`:**

- **`activate-commitment.handler.ts`** — eliminado el bloque `if (commitment.state ===
CommitmentState.Active) { ...return early... }` (incluida su llamada extra a
  `commitmentRepository.save()`); eliminado el import ahora no usado de `CommitmentState`. La
  secuencia queda: cargar aggregate → resolver `hasExecutionPlan` → `commitment.activate(...)` →
  `save()` → `dispatch(events)`. Toda la lógica de idempotencia permanece exclusivamente dentro de
  `Commitment.activate()`.
- **`pause-commitment.handler.ts`** — mismo cambio exacto: eliminado el pre-check
  `commitment.state === CommitmentState.Paused` (con su `save()` extra) e import no usado de
  `CommitmentState`. Comentarios renumerados (1-5) para reflejar la secuencia real.

**No modificado, tal como se acordó:** `Commitment.activate()`, `Commitment.pause()`, eventos de
dominio, repositorios, contratos, casos de uso, excepciones, persistencia.

**Un archivo de test ajustado, no de producción — hallazgo real encontrado al ejecutar la suite:**
`pause-commitment.handler.spec.ts`'s test `"idempotent when already paused"` fallaba tras el cambio:
afirmaba `expect(dispatcher.dispatch).not.toHaveBeenCalled()` — una aserción que codificaba el
detalle de implementación exacto de la redundancia (el camino idempotente antiguo retornaba antes de
llegar nunca a `dispatch()`), no comportamiento verdaderamente observable. Tras el fix,
`dispatch()` se invoca igual que en el camino normal, pero con un array vacío de eventos — el mismo
efecto observable neto (cero eventos entregados), exactamente el "sin cambio funcional observable"
que fija el criterio de cierre de esta AR. Ajustada la aserción a
`expect(dispatcher.dispatch).toHaveBeenCalledWith([])`, que verifica el comportamiento real (cero
eventos) en vez de un detalle de invocación. El equivalente test de `activate` no necesitó cambios —
usa un dispatcher-fake que acumula eventos en un array y verifica su longitud, no si `dispatch()` fue
invocado, por lo que ya toleraba correctamente el nuevo camino.

**Validación real ejecutada:**

- `pnpm --filter backend test` → **34 suites, 148/148 tests pasando**, cero regresión.
- `pnpm --filter backend exec tsc --noEmit` → mismos 2 errores preexistentes de siempre (verificado
  con `git stash`, idénticos con y sin este cambio) — cero error nuevo.
- `pnpm --filter backend exec eslint` sobre los 4 archivos tocados → limpio, cero problemas.
- `git diff --stat` → exactamente 3 archivos (`activate-commitment.handler.ts`,
  `pause-commitment.handler.ts`, `pause-commitment.handler.spec.ts`), ningún otro archivo afectado.

**Verificaciones objetivas pedidas explícitamente para el cierre:**

1. **Único punto de decisión:** `grep "commitment.state ==="` sobre
   `apps/backend/src/commitment/application/commands/` → cero coincidencias. Solo
   `Commitment.activate()`/`.pause()` deciden idempotencia.
2. **Consistencia entre bounded contexts:** repetido el análisis de Fase 1 — `Commitment` (ahora),
   `Task` (`CompleteTaskCommandHandlerCore`) y `Habit` (sus handlers) comparten el mismo patrón: cero
   pre-check de estado en el handler, delegación total al aggregate.
3. **Eliminación del `save()` redundante:** confirmado por conteo — exactamente 1 llamada a
   `commitmentRepository.save()` por handler (antes: 2, una en el pre-check y otra en el camino
   normal).
4. **Regresiones:** 148/148 tests, `tsc --noEmit` sin errores nuevos, `eslint` limpio.

---

## Fase 5 — Validación

**Estado: ✅ Cerrada.**

Las 5 condiciones del criterio de cierre, verificadas con evidencia real:

1. **¿La idempotencia se evalúa exclusivamente dentro del Aggregate?** Sí — grep-confirmado, cero
   pre-checks de estado en los handlers.
2. **¿Los handlers dejan de contener lógica de negocio duplicada?** Sí — la única lógica que queda en
   los handlers es orquestación (cargar, invocar, persistir, despachar), ninguna decisión de estado.
3. **¿Desaparece el `save()` redundante del camino idempotente?** Sí — verificado por conteo, 1 sola
   llamada a `save()` por handler.
4. **¿Commitment, Task y Habit siguen un patrón homogéneo de delegación al Aggregate?** Sí —
   confirmado en los 3 bounded contexts.
5. **¿No existe ningún cambio funcional observable más allá de eliminar la redundancia?** Sí — 148/148
   tests pasando (incluida la suite de idempotencia de ambos handlers), la única modificación de test
   necesaria corrigió una aserción que verificaba un detalle de invocación interno, no comportamiento
   observable real; el resultado externo (versión sin cambios, estado correcto, cero eventos
   efectivos) es idéntico al de antes del fix.

---

## Estado

**AR-022 CERRADA.** TD-003 resuelto — la idempotencia de `Commitment.activate()`/`.pause()` ahora
vive exclusivamente en el aggregate, igual que en `Task`/`Habit`. Cero cambio funcional observable
más allá de eliminar la redundancia y el `save()` extra en el camino idempotente. Un hallazgo real de
implementación (aserción de test acoplada al detalle de implementación de la redundancia) corregido
sin reabrir ninguna decisión — mismo patrón que AR-028/AR-009 con bugs reales encontrados durante la
implementación. Estado: 🟦 → ✅ Cerrada. Decisión: se mantiene N/A (ejecución directa) → ✅ N/A
(ejecución directa, validada).
