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

## Estado

**Fase 1 cerrada.** Hallazgo original (TD-003) confirmado íntegramente vigente, sin ningún cambio
desde su diagnóstico original — mismas dos ubicaciones exactas, misma duplicación, misma corrección
ya especificada. Precedente interno ampliado (Task y Habit, no solo Task). Pendiente: **Fase 4B
(Implementación)** — eliminar los 2 pre-checks redundantes. Estado: ⬜ → 🟦 En análisis. Decisión: se
mantiene N/A (ejecución directa).
