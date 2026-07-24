# AR-047 — Axioma "la IA propone, nunca ejecuta" sin enforcement estructural

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (test de 3 preguntas, aplicado programáticamente sobre las 39 AR pendientes)

Parseadas todas las filas `⬜ Pendiente` de `REMEDIATION_ROADMAP_V1.md` (39 de 54; 14 cerradas, AR-052
en análisis/pausada). Filtradas por dependencias resueltas, ordenadas por (Impacto desc, Esfuerzo asc,
Riesgo asc). Empate en el tier superior (Impacto Alto/Esfuerzo Medio/Riesgo Medio) entre **AR-003** y
**AR-047**: mismo Owner (Ambos), mismo Bloquea (1 AR cada una). Desempatada por **Dependencias**:
AR-003 declara `AR-001 (parcial — determina si los 3 docs de persistencia se archivan o se reactivan)`,
una condición sin resolver todavía; AR-047 declara `Ninguna`, sin matices. Se elige AR-047 — la misma
candidata que ya había quedado empatada con AR-030 en su propia Fase 1 (`AR-030/ANALISIS.md`, mismo
tier, "desempatada por Owner" en aquel momento). Con AR-030 ya cerrada, AR-047 queda como siguiente
candidata natural de ese mismo tier.

### Corrección propia registrada antes de continuar

Al cerrar AR-030 se propagó un conteo incorrecto: "15 ARs cerradas" en vez de 14. El error se originó en
una descripción de memoria previa a esta sesión que ya decía "14 ARs cerradas" citando solo 13 nombres
— un desajuste preexistente que no se verificó antes de sumarle 1. Verificado directamente contra
`REMEDIATION_ROADMAP_V1.md` (fuente de verdad, parseado programáticamente): 14 filas `✅ Cerrada`
(incluyendo AR-043 "Cerrada (backend)"), 39 `⬜ Pendiente`, 1 `🟦 En análisis` (AR-052) — suma 54,
exacto. Corregido en `REMEDIATION_DASHBOARD.md`, `project-architecture-remediation-status.md` y
`MEMORY.md` antes de abrir esta AR. La tabla "Progreso por Wave" del Dashboard arrastra un desajuste
propio y preexistente (ya documentado como tal al cerrar AR-004/AR-024) entre su fila `Total` y el
conteo real — no se corrige aquí, por el mismo criterio ya aplicado: no expandir el alcance de esta AR
para reparar un defecto de bookkeeping no relacionado.

### Pregunta de framing que gobierna esta fase

> **¿Sigue sin existir ningún mecanismo estructural que impida que un futuro componente de IA emita un
> Comando de Dominio directamente, o algo ha cambiado desde la auditoría (2026-07-20) que ya lo
> garantice o que haya alterado el alcance del hallazgo?**

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-3-escalabilidad/13-ai-platform.md`, línea 24-38,
citado íntegro por ser inusualmente preciso): el axioma del Framework Capítulo 5 ("The AI proposes; it
does not enact") **no tiene ningún enforcement estructural** — la propia auditoría ya verificó
explícitamente si la capa de despacho de comandos garantiza estructuralmente que solo una acción humana
explícita puede ejecutar un comando, y confirmó que no: `RecurringCommitmentSaga`,
`task-dependency-cascade.saga.ts` y `cancel-tasks-on-commitment-completed.saga.ts` ya hacen que el
propio sistema llame a `this.commandBus.execute(...)` automáticamente en reacción a eventos de dominio,
sin ningún humano en el bucle para esa acción concreta. La propia auditoría ya aclaraba: **"esto es
legítimo y correcto para esos casos... pero demuestra que la arquitectura no tiene ninguna barrera que
impida 'el sistema reacciona a un evento ejecutando un comando automáticamente'."** Si una futura
integración de IA se implementara como un listener de eventos que llama a `commandBus.execute()`
directamente — en vez de devolver siempre un `Recommendation` para que un humano lo acepte vía UI —
nada en la arquitectura actual lo detectaría ni lo impediría. Recomendación #2 original (condicional,
no inmediata): _"si/cuando se diseñe alguna capacidad impulsada por IA, convertir la frontera 'propone,
no ejecuta' en una costura arquitectónica explícita y verificada... escribirlo como regla antes de
escribir la primera línea de integración de IA."_

**Verificado hoy, directamente en el código:**

- **Los 3 Sagas citados siguen exactamente igual.** `git log --oneline` sobre los 3 archivos confirma
  que ninguno ha cambiado desde su commit original (`2fe2947` y `1ead830`, ambos anteriores a la
  auditoría del 2026-07-20) — cero commits nuevos.
- **Grep exhaustivo (`commandBus.execute` en todo `apps/backend/src`, excluyendo controllers/specs):**
  exactamente los mismos 3 Sagas, más 2 servicios de aplicación (`HabitApplicationService`,
  `TaskApplicationService`) que despachan comandos — pero ninguno de los dos es un `@EventsHandler`;
  ambos se invocan directamente desde controllers en respuesta a una petición HTTP explícita, es decir,
  acción humana directa, no ejecución autónoma. No ha aparecido ningún Saga ni listener nuevo desde la
  auditoría.
- **Coach/IA sigue sin tocar `CommandBus` en absoluto:** grep en `apps/mobile/src/features/coach/` y
  `apps/mobile/src/features/dashboard/engine/` (los mismos motores de recomendación tocados
  extensamente en AR-036) — cero resultados para `CommandBus`/`commandBus`. Confirma lo que la propia
  auditoría decía: _"el único código adyacente a IA, Coach, solo devuelve datos."_
- **No existe ningún módulo `Coach` en el backend** (`find apps/backend/src -iname "*coach*"` → cero
  resultados) — el axioma no tiene ni siquiera una superficie de ataque real todavía, porque no hay
  ningún componente de IA con acceso al `CommandBus`.
- **AR-050 (AI Platform), la AR que este hallazgo pretende condicionar, no ha comenzado** — confirmado
  independientemente en la Fase 1 de AR-030 (`AR-030/ANALISIS.md`), misma sesión anterior.

### Respuesta a la pregunta de framing

> **El hallazgo sigue completamente vigente, sin ningún cambio desde la auditoría.** Los 3 Sagas que lo
> evidencian no se han modificado; no ha aparecido ningún componente nuevo que despache comandos de
> forma autónoma; Coach sigue sin poder violar el axioma porque no tiene acceso al mecanismo que lo
> haría posible; el trabajo de IA real (AR-050) que activaría el riesgo todavía no ha comenzado. El
> axioma se cumple hoy **por convención y por ausencia de un consumidor de IA real**, no por ninguna
> barrera arquitectónica — exactamente el diagnóstico original.

**Matiz que Fase 1 deja explícitamente registrado para Fase 2A, sin resolverlo aquí:** la propia
recomendación original de la auditoría es **condicional, no inmediata** — dice "si/cuando se diseñe
alguna capacidad de IA," no "ahora." Esto plantea una pregunta de framing genuina para la siguiente
fase: ¿debe AR-047 construir ya una barrera técnica (`enforcement` en tiempo de ejecución) para un
consumidor de IA que todavía no existe, o debe limitarse a formalizar el axioma como una regla
arquitectónica explícita y verificable — dejando el mecanismo concreto de enforcement para cuando AR-050
introduzca el primer componente real de IA? El patrón ya establecido en el programa (H-GOV-01: "no
perseguir una propiedad de diseño más fuerte de la que la evidencia justifica," aplicado en AR-023/
AR-043/AR-054) sugiere que construir un mecanismo técnico completo hoy, sin ningún consumidor real que
lo ejercite, sería anticipar una necesidad futura — pero esta es una pregunta de Fase 2A/Decisión, no
algo que Fase 1 deba precipitar.

**Consecuencia para el alcance de AR-047:** ninguna reducción ni ampliación — el hallazgo es exactamente
el que describía la auditoría, con la misma precisión inusual que ya tenía en origen (la auditoría ya
había hecho ella misma buena parte del trabajo de verificación que otras ARs de este programa tuvieron
que rehacer). A diferencia de AR-030 (ausencia total de un concepto de dominio) o AR-024 (decisión ya
operativa sin formalizar), aquí la ausencia es de una **barrera estructural para un riesgo todavía no
materializado** — un patrón distinto a los 14 casos previos.

---

## Estado

**Fase 1 cerrada.** El hallazgo se confirma completamente vigente, sin cambios desde la auditoría —
ni las 3 Sagas que lo evidencian ni el estado de Coach/IA se han modificado, y AR-050 (el trabajo que
activaría el riesgo real) sigue sin empezar. Pendiente: **Fase 2A (Hipótesis)** — el usuario decide si
continúa directamente. Estado: ⬜ → 🟦 En análisis. Decisión: 💭 Pendiente de análisis (Owner=Ambos,
decisión de diseño).
