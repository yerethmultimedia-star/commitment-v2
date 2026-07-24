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

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**Matiz que gobierna el framing de esta fase, distinto a AR-004/AR-030:** en esas dos ARs el riesgo ya
estaba materializado en el sistema. En AR-047, según la evidencia de Fase 1, el riesgo **todavía no
existe operacionalmente** — no hay `CoachModule` en backend, Coach no puede ejecutar comandos, no existe
acceso al `CommandBus`, y AR-050 aún no ha comenzado. La auditoría identifica una **propiedad
arquitectónica futura**, no una vulnerabilidad presente.

**H1 (principal):** _"La arquitectura debe garantizar que cualquier capacidad de IA conserve una
separación estructural entre propuesta y ejecución, de forma que la IA no pueda producir efectos sobre
el dominio sin mediación explícita del flujo de aplicación autorizado, independientemente de cuándo se
implemente dicha capacidad."_ Respaldada por la evidencia: hoy ya se cumple de facto; la auditoría
identifica una propiedad que debe seguir cumpliéndose; el riesgo aparece cuando AR-050 introduzca IA con
capacidad operativa.

**Hipótesis alternativas descartadas:**

- **H2** — debe implementarse inmediatamente un mecanismo de enforcement. Descartada: no hay
  actualmente un consumidor que pueda violar la propiedad; construir infraestructura sin un punto de
  integración concreto puede introducir complejidad innecesaria.
- **H3** — basta con documentar el principio. Descartada: cuando AR-050 llegue, una regla puramente
  documental será insuficiente para impedir regresiones.
- **H4** — la separación propuesta/ejecución puede dejarse al criterio de futuras implementaciones.
  Descartada: eso convertiría una propiedad arquitectónica en una convención — exactamente lo que la
  auditoría intenta evitar.

**H1 sobrevive.** El problema no es "la IA" — es preservar una propiedad arquitectónica antes de que
aparezca el primer consumidor capaz de romperla.

## Fase 2B — Decisión

**Estado: ✅ Decisión aprobada.**

Cuidado explícito de no convertir una decisión de arquitectura en una decisión temporal: no se decide
"implementar ahora" ni "esperar a AR-050" — eso pertenece al diseño y a la planificación (Fase 4A). Se
congela únicamente la propiedad.

**D-047.1:** _"Toda capacidad de inteligencia artificial que genere recomendaciones o planes debe
permanecer estructuralmente separada de la ejecución de comandos sobre el dominio, de modo que cualquier
modificación del estado del sistema requiera atravesar los límites de aplicación autorizados,
independientemente de la implementación concreta de la IA."_

**No fija deliberadamente:** cuándo construir el enforcement, cómo implementarlo, ni si será mediante
módulos, interfaces, políticas o validaciones — solo la propiedad arquitectónica. Mismo patrón que
D-002.1/D-009.1/D-036.1/D-004.1/D-024.1/D-030.1/D-043.1/D-054.1/D-044.1-3.

**El matiz de Fase 1 (¿el enforcement debe existir antes del primer consumidor o puede introducirse
junto con él?) no se resuelve aquí — pertenece a Fase 4A.** Ahí se compararán alternativas de diseño
(enforcement preventivo vs. just-in-time con AR-050) con criterios de coste/simplicidad/riesgo de
regresión, no con criterios arquitectónicos. Fase 2B mantiene la decisión al nivel de propiedad y deja
que Fase 4A determine el momento y el mecanismo.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

**AR-047 tiene una característica distinta a casi todas las anteriores: la decisión arquitectónica ya
define qué propiedad debe preservarse, pero todavía no existe un consumidor capaz de violarla.** Esto
convierte el diseño en un ejercicio de **preparación arquitectónica**, no de corrección.

**Pregunta que gobierna esta fase (deliberadamente no formulada como "¿cómo impedimos que la IA ejecute
comandos hoy?"):**

> **¿Cuál es el mecanismo que hará imposible romper D-047.1 cuando AR-050 introduzca IA real?**

### Alternativas evaluadas

- **A — Enforcement inmediato (construir ahora toda la infraestructura).** Descartada: la evidencia de
  Fase 1 confirma que hoy no existe ningún camino que permita a la IA ejecutar comandos — introducir
  infraestructura sin un consumidor concreto aumenta complejidad y superficie de mantenimiento sin
  aportar protección efectiva adicional en el estado actual.
- **B — Esperar completamente a AR-050 (no diseñar nada ahora).** Descartada: el riesgo es que el
  primer diseño de IA llegue sin una restricción arquitectónica previamente pensada, y el mecanismo
  termine condicionado por la implementación en lugar de por la arquitectura.
- **C — Contrato arquitectónico ahora, implementación con el primer consumidor (elegida).** Se congela
  el **punto de integración**, no el mecanismo concreto: queda definido hoy el único lugar por el que
  una IA podrá interactuar con el sistema; el enforcement se materializa cuando exista el primer
  consumidor real (AR-050). Así, la primera implementación de IA nace ya dentro del límite correcto.

### Diseño congelado

No se congelan clases, interfaces ni tecnologías — se congela una regla de interacción:

> **Toda capacidad de IA debe terminar su responsabilidad en la generación de una propuesta. La
> transición desde propuesta a ejecución pertenece exclusivamente a un flujo de aplicación explícito y
> ajeno al componente de IA.**

Esto preserva D-047.1 independientemente de si en el futuro se utilizan LLMs, motores de reglas,
modelos locales o proveedores externos.

### Separación de responsabilidades

Tres actores claramente diferenciados, ninguno absorbe la responsabilidad del otro:

- **IA** → propone.
- **Aplicación** → decide si una propuesta puede convertirse en acción.
- **Dominio** → ejecuta únicamente comandos válidos.

### Expectativa fijada para Fase 4B

Implementación deliberadamente pequeña — no un framework de IA. Únicamente lo necesario para que AR-050
no pueda introducir un camino alternativo de ejecución: definir el contrato de entrada/salida del
componente de IA, documentar el límite arquitectónico, preparar el punto de integración — sin introducir
todavía un consumidor inexistente.

### Criterio de validación para Fase 5

No se valida que "la IA no ejecuta" (hoy no existe IA con capacidad de hacerlo) — se valida la
arquitectura:

1. ¿Existe un único límite arquitectónico previsto para la interacción entre IA y la aplicación?
2. ¿Ese límite termina siempre en una propuesta y nunca en una ejecución?
3. ¿La ejecución continúa dependiendo exclusivamente de los flujos de aplicación autorizados?
4. ¿Podrá AR-050 reutilizar ese límite sin redefinir la arquitectura?
5. ¿No se introdujo infraestructura cuyo único propósito sea anticipar un consumidor todavía
   inexistente?

Si las cinco respuestas son afirmativas, D-047.1 queda preparada para materializarse cuando aparezca el
primer consumidor real.

### Observación registrada (no promovida)

AR-047 cambia el momento en que se toma una decisión arquitectónica. En las AR anteriores, la
arquitectura respondía a una realidad ya existente. Aquí la arquitectura establece una restricción antes
de que exista el riesgo. Si esa disciplina se mantiene, AR-050 no debería preguntarse cómo evitar que la
IA ejecute comandos — debería encontrar esa respuesta ya incorporada en la arquitectura y limitarse a
implementarla dentro de ese marco.

---

## Estado

**Fase 1, Fase 2A, Fase 2B y Fase 4A cerradas.** El hallazgo se confirma vigente como una propiedad
arquitectónica futura, no una vulnerabilidad presente. D-047.1 aprobada. **Diseño técnico congelado
(Fase 4A):** contrato arquitectónico ahora (punto único de integración IA↔aplicación, terminando
siempre en una propuesta), implementación diferida al primer consumidor real (AR-050) — Alternativa C.
Regla de interacción congelada: toda capacidad de IA termina su responsabilidad en generar una
propuesta; la transición a ejecución pertenece exclusivamente a un flujo de aplicación explícito ajeno
al componente de IA. Tres actores separados (IA propone / Aplicación decide / Dominio ejecuta).
Implementación esperada en Fase 4B: deliberadamente pequeña (contrato de entrada/salida, límite
documentado, punto de integración preparado — sin consumidor todavía). Pendiente: **Fase 4B
(Implementación)**. Estado: se mantiene 🟦 En análisis (no salta a 🟨 hasta Fase 4B). Decisión: se
mantiene ✅ Decisión aprobada.
