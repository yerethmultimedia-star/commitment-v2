# AR-002 — Proceso de ADR-011 ("toda ADR de tecnología preferida requiere sustituta") sin enforcement

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Pregunta de framing que gobierna esta fase

> **¿Sigue siendo real este hallazgo, o quedó resuelto indirectamente por el cierre de AR-001?**

Se formula así porque el hallazgo original (Iteración 19, apoyado en Iteración 16) cita explícitamente
la contradicción ADR-004↔NestJS como su ejemplo — y esa contradicción exacta es lo que AR-001 resolvió.

### 1. Reproducción / verificación directa

- **`docs/03-architecture/adr_011_tech_stack_flexibility.md`** — confirmado, exige un ADR sustituta
  formal (con beneficios técnicos, impacto en costos, complejidad de mantenimiento, esfuerzo de
  migración) para cualquier cambio de "Tecnología Preferida" (Drizzle ORM, NATS en el texto original).
- **`docs/03-architecture/adr_024_official_technology_platform.md:41-43,92`** — confirmado: ADR-024
  (la resolución de AR-001) declara explícitamente _"Cumple el proceso que ADR-011 exige para cambiar
  Tecnologías Preferidas"_ y justifica el cambio de stack con los 4 puntos que ADR-011 pide.
- **Cero mecanismo de enforcement en el repositorio** — confirmado por búsqueda exhaustiva: `.github/`
  solo contiene `ci.yml` (sin plantilla de PR, sin checklist, sin check de CI relacionado con ADRs).
  `ci.yml` no menciona ADRs en ningún paso.

### 2. Línea temporal

| Fecha                   | Evento                                                                                                                                                                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-02              | ADR-011 se escribe el mismo día que se introduce NestJS (commit `8900fee`, según `AR-001/ANALISIS.md`) — el proceso que exige queda, desde el día 1, sin ningún mecanismo que lo haga cumplir.               |
| 2026-07-02 → 2026-07-20 | 18 días en los que la contradicción ADR-004↔NestJS existió sin ninguna ADR sustituta — nadie la detectó automáticamente; la detectó la auditoría original (Iteración 16), no ningún control del repositorio. |
| 2026-07-20              | AR-001 cierra, produce ADR-024 — la contradicción específica queda resuelta, retroactivamente y manualmente, no por ningún mecanismo de enforcement.                                                         |
| 2026-07-02 → hoy        | El enforcement en sí (lint/CI/plantilla) sigue sin existir — confirmado hoy, cero cambios desde entonces.                                                                                                    |

### Respuesta a la pregunta de framing

> **El hallazgo original describía dos cosas distintas que el framing de la auditoría no separaba
> explícitamente: (a) una violación histórica concreta (ADR-004 vs. NestJS) y (b) la ausencia de un
> mecanismo general que detecte futuras violaciones.** (a) **queda resuelta** — AR-001/ADR-024 la
> corrigió y además cumplió formalmente el propio proceso de ADR-011. (b) **sigue completamente sin
> resolver** — no existe ningún lint, check de CI, ni plantilla de PR que detecte una futura violación,
> exactamente como describía la auditoría original. Si hoy se introdujera una segunda "Tecnología
> Preferida" sin su ADR sustituta, nada en el repositorio lo detectaría — la única razón por la que no
> ha vuelto a ocurrir es la disciplina manual de este mismo programa, no un control estructural.

**Consecuencia para el alcance de AR-002:** el alcance se reduce y se precisa — no es "resolver la
contradicción ADR-004/ADR-011" (ya resuelta), es **"introducir el mecanismo de enforcement preventivo
que ADR-011 nunca tuvo."** La propia auditoría original ya lo acotó bien (Recomendación #3, It.19): no
hace falta un proceso nuevo, ADR-011 ya especifica el correcto — falta el mecanismo que lo haga cumplir.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**H1 (principal):** _"Las decisiones arquitectónicas sobre tecnologías preferidas deben estar
respaldadas por un mecanismo automático de enforcement que detecte desviaciones durante el ciclo de
desarrollo antes de que lleguen a la rama principal."_ Respaldada directamente por la evidencia de Fase
1: existe la política (ADR-011), existe la documentación, no existe ningún mecanismo que la haga
verificable.

**Hipótesis alternativas descartadas:**

- **H2** — la revisión manual de PR es suficiente. Descartada: depende de memoria y disciplina humana,
  no de un control reproducible — exactamente el mismo gap que ya describía la auditoría original.
- **H3** — la propia ADR ya constituye el mecanismo de enforcement. Descartada: una ADR documenta una
  decisión, no verifica su cumplimiento — son categorías distintas.
- **H4** — el enforcement debe materializarse únicamente vía CI. Descartada, pero no por estar mal
  encaminada — la evidencia exige que exista enforcement, no que se materialice exclusivamente en una
  capa concreta; restringiría prematuramente el diseño técnico (Fase 4A).

**H1 sobrevive.** Las demás o bien no automatizan el cumplimiento (H2/H3) o restringen prematuramente la
implementación (H4).

## Fase 3 — Decisión

**Estado: ✅ Decisión aprobada.**

**D-002.1:** _"Las decisiones clasificadas como 'Tecnología Preferida' deben disponer de un mecanismo de
enforcement verificable que detecte desviaciones antes de su integración en la rama principal."_
Formulada como propiedad — no nombra herramienta, capa, ni mecanismo concreto (nada de "usar GitHub
Actions", "usar Danger", "usar una plantilla de PR"). Mismo patrón exacto que D-043.1/D-054.1/D-044.1-3.

**Una sola decisión, no fragmentada en varias.** El hallazgo restante tras Fase 1 es único (ausencia de
enforcement) — una eventual combinación multicapa (plantilla de PR + lint + CI) pertenece al diseño
técnico de Fase 4A, si la evidencia allí la justifica, no a una fragmentación arquitectónica aquí.

**Explícitamente NO decidido en esta fase:** checklist documental vs. plantilla de PR vs. validación
automática en CI vs. combinación híbrida — las 4 alternativas de materialización quedan para Fase 4A,
junto con qué aspecto exacto cubre cada capa si se combinan.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

### Alternativas evaluadas

- **A — Solo plantilla de PR.** Muy simple, sin infraestructura adicional. Descartada como único
  mecanismo: sigue dependiendo de que el revisor detecte la violación, sin enforcement automático — no
  materializa D-002.1 por sí sola.
- **B — Solo CI.** Un job del pipeline analiza las decisiones marcadas como "Tecnología Preferida" y
  falla si detecta una desviación. Totalmente automático y reproducible, no depende del revisor.
  Descartada como único mecanismo: el desarrollador recibe el feedback tarde (después del push).
- **C — Solo lint local.** Feedback inmediato. Descartada: puede omitirse, depende del entorno local, no
  garantiza cumplimiento en la rama principal.
- **D — Enfoque multicapa (elegida).** No añade herramientas por acumulación — cada capa cubre una
  responsabilidad distinta, sin redundancia entre ellas:

  | Capa            | Responsabilidad                                                                            |
  | --------------- | ------------------------------------------------------------------------------------------ |
  | Plantilla de PR | Declarar conscientemente si se introduce una nueva tecnología o se modifica una preferida. |
  | CI              | Verificar automáticamente el cumplimiento de las reglas objetivas.                         |
  | ADR             | Documentar y justificar cualquier excepción aprobada.                                      |

  La plantilla recoge la intención del cambio; el CI verifica hechos; la ADR preserva la decisión
  arquitectónica. Cada pieza cumple una función diferente — ninguna sustituye a las otras.

### Precaución de diseño

El CI no debe "entender la arquitectura" — solo verificar reglas objetivas (aparición de un framework
prohibido, modificación de un archivo catalogado como tecnología preferida, incorporación de una
dependencia no permitida). La interpretación arquitectónica sigue siendo responsabilidad humana,
delegada a la plantilla de PR y a la ADR, no al CI.

### Criterio de validación para Fase 5

La pregunta de validación no es "¿existe una plantilla?" ni "¿existe un workflow?", sino:

> **¿Una futura desviación respecto a una Tecnología Preferida puede llegar a `main` sin ser detectada
> por ningún mecanismo del proyecto?**

Si la respuesta es **no**, D-002.1 queda materializada independientemente de las herramientas concretas
usadas. Este es el criterio que gobierna la aceptación de la implementación (Fase 4B) y el cierre de la
AR.

---

## Fase 4B — Implementación

**Estado: ✅ Implementada.**

**Capa 1 — Plantilla de PR (`.github/pull_request_template.md`):** 3 preguntas declarativas exactas a
D-002.1 (¿introduce tecnología nueva? ¿reemplaza/elimina una Tecnología Preferida? ¿requiere ADR
nueva/actualizada?), como checkboxes. Sin ningún script que las valide — su función es exclusivamente
declarativa, tal como fija Fase 4A. GitHub inyecta este archivo automáticamente en todo PR nuevo contra
este repositorio (comportamiento nativo de la plataforma, no requiere configuración adicional).

**Capa 2 — CI (`.github/scripts/check-preferred-tech.mjs` + job `preferred-tech-enforcement` en
`.github/workflows/ci.yml`):** reglas objetivas, sin interpretación arquitectónica. Lista de
Tecnologías Preferidas gobernadas, tomada directamente de ADR-024 (única fuente normativa vigente):
`@nestjs/core`/`bullmq` en `apps/backend/package.json`; `expo`/`react-native` en
`apps/mobile/package.json`. El script compara `package.json` entre la rama base y `HEAD` de un PR
(`git show <ref>:<archivo>`) y señala una violación solo en 2 casos objetivos: (a) una dependencia
gobernada existía en base y desaparece en `HEAD`; (b) su versión mayor cambia. Si detecta una
violación, revisa si el mismo diff modifica algún archivo `docs/03-architecture/adr_*.md` — de ser así,
la trata como excepción respaldada (D-002.1 cumplido) y no falla; si no, falla con código de salida 1 y
detalla exactamente qué dependencia y por qué. El job solo corre en eventos `pull_request` (no en
`push` a `main`, donde ya no aplica prevenir la integración).

**Capa 3 — ADR:** sin implementación nueva, tal como fijó Fase 4A — el script reutiliza el patrón ya
existente (`docs/03-architecture/adr_*.md`), no crea un proceso de ADR paralelo.

**Verificación de no-solapamiento (pedida en Fase 4A):** la plantilla no ejecuta ninguna lógica de
validación (grep exhaustivo del archivo: cero referencias a `github-script`, cero llamadas a APIs); el
CI no interpreta las respuestas de la plantilla ni ningún texto libre — solo diffs de `package.json` y
nombres de archivo. Cero solapamiento de responsabilidad entre capas.

## Fase 5 — Validación

**Estado: ✅ Validada, con un hallazgo residual documentado explícitamente (no oculto).**

**Prueba de extremo a extremo real, no solo inspección de archivos** (`.github/scripts/check-preferred-tech.e2e.test.mjs`, `node --test`, 4/4 passing): construye un repositorio git temporal real (no
mockeado) y ejecuta las funciones exactas que usa el job de CI contra refs reales:

1. **Sin desviación** → `findViolations` devuelve `[]`. ✅
2. **`bullmq` eliminado de `apps/backend/package.json`, sin ADR en el diff** → 1 violación detectada,
   `hasBackingAdrChange` = `false`. Replica el caso "CI debe fallar." ✅
3. **La misma eliminación, pero el mismo commit añade `docs/03-architecture/adr_099_....md`** → la
   violación se detecta igual, pero `hasBackingAdrChange` = `true` — el caso "excepción respaldada por
   ADR, D-002.1 cumplido." ✅
4. **Cambio de versión mayor de `@nestjs/core` (`^11.0.0` → `^12.0.0`), sin ADR** → 1 violación
   detectada con el mensaje correcto. ✅

Además, el script se ejecutó directamente contra este mismo repositorio (`HEAD~3` como base) para
confirmar que no falla por un error de entorno/ruta real, más allá de los repos sintéticos de la
prueba — exit code 0, sin excepciones.

**Hallazgo residual, verificado explícitamente vía `gh api`, no asumido:** el repositorio remoto
(`yerethmultimedia-star/commitment-v2`) **no tiene branch protection configurada en `main`**
(`gh api repos/.../branches/main/protection` → `404 Branch not protected`). Esto significa que, hoy,
aunque el job `preferred-tech-enforcement` detecte correctamente una violación y falle (demostrado
arriba), **nada en la configuración actual de GitHub impide fusionar el PR de todas formas** — un
mantenedor podría hacer merge ignorando un check en rojo. La pregunta de validación de Fase 4A
("¿puede una desviación llegar a `main` sin ser detectada?") tiene respuesta **no** — el mecanismo de
detección es real y demostrado. Pero la pregunta más fuerte, "¿puede llegar a `main` sin ser
**bloqueada**?", hoy tiene respuesta **sí**, porque el bloqueo depende de un ajuste de configuración del
repositorio (`Require status checks to pass before merging`) que vive fuera de este repositorio de
código y no puede activarse solo con cambios de archivos. **No se activó unilateralmente** — requiere
una decisión explícita del usuario, al ser un cambio de configuración de infraestructura compartida
(afecta a cualquier futuro PR de cualquier colaborador), no un cambio de código.

**Decisión del usuario (2026-07-23): activar branch protection en `main` exigiendo los 3 checks de CI
existentes, no solo el nuevo.** Razonamiento explícito del usuario: exigir únicamente
`preferred-tech-enforcement` habría creado una asimetría sin respaldo arquitectónico — declarar
obligatoria una sola propiedad de calidad mientras el resto de checks (`backend-ci`, `mobile-ci`)
seguían siendo opcionales para fusionar. Principio aplicado: _"todo check considerado parte del
pipeline oficial debe aprobarse antes de integrar cambios en `main`."_ La configuración forma parte de
la implementación de D-002.1, aunque viva fuera del código fuente versionado.

**Implementado vía `gh api PUT repos/.../branches/main/protection`** (`required_status_checks.strict:
true`; contexts: `"Backend Lint, Build & Test"`, `"Mobile Typecheck"`,
`"Preferred Technology Enforcement (D-002.1)"` — nombres exactos verificados contra los check-runs
reales del último commit en `main` antes de aplicar la configuración, no asumidos). Verificado tras
aplicar: `gh api .../branches/main/protection --jq '.required_status_checks.contexts'` devuelve los 3
nombres correctos. **La pregunta de validación queda respondida en su forma fuerte:** una desviación
objetiva de una Tecnología Preferida ya no solo se detecta — no puede integrarse en `main` sin superar
el control, porque GitHub ahora exige que el check correspondiente pase antes de permitir el merge.

---

## Estado

**AR-002 CERRADA (2026-07-23).** Las 9 fases aplicables completas: D-002.1 aprobada e implementada en
3 capas sin solapamiento — plantilla de PR (`.github/pull_request_template.md`, declarativa), CI
(`preferred-tech-enforcement` en `ci.yml` + `check-preferred-tech.mjs`, reglas objetivas sobre
`package.json` vs. la lista de Tecnologías Preferidas de ADR-024), ADR (proceso existente, sin
cambios). Fase 5 validada mediante prueba de extremo a extremo real (repo git temporal, 4/4 casos). El
hallazgo residual (ausencia de branch protection) no se ocultó ni se asumió resuelto — se documentó
explícitamente y se llevó al usuario como una decisión propia, distinta de la decisión arquitectónica
(D-002.1) y distinta también del diseño técnico (Fase 4A): **el usuario decidió activar branch
protection en `main` exigiendo los 3 checks de CI existentes** (no solo el nuevo), razonando que
exigir uno solo habría creado una asimetría sin respaldo arquitectónico. Implementado y verificado vía
`gh api`. La pregunta de validación queda respondida en su forma fuerte: una desviación objetiva de
una Tecnología Preferida no puede integrarse en `main` sin superar el control. Estado: 🟦 → ✅ Cerrada.
Decisión: ✅ Decisión aprobada → ✔️ Validada.
