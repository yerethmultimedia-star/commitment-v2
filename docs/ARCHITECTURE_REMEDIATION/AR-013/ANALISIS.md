# AR-013 — Cero caching entre runs de CI

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Selección (filtro programático, aplicado sobre las 29 AR no cerradas tras AR-005)

Parseadas las 55 filas de `REMEDIATION_ROADMAP_V1.md` (25 cerradas). Filtradas por dependencias
resueltas (AR-052 excluida explícitamente, pausada). Ordenadas por (Impacto desc, Esfuerzo asc, Riesgo
asc, Bloquea desc). **AR-013 es la primera, por orden de ID, entre 5 candidatas empatadas exactamente en
Impacto Medio/Esfuerzo S/Riesgo Bajo/Bloquea Ninguna** (AR-013, AR-015, AR-033, AR-038, AR-041) — el
desempate final es alfanumérico por ID, sin ningún otro criterio adicional que lo altere. Owner=Claude,
Decisión=N/A (ejecución directa) según el Roadmap — a verificar, como en cada AR de este grupo, si la
evidencia sostiene esa etiqueta o si, como en AR-013/018/034/054, esconde una decisión real.

### Pregunta de framing que gobierna esta fase

> **¿Sigue existiendo la misma ausencia total de caching entre ejecuciones de CI, y la corrección es
> puramente mecánica (una sola forma correcta de resolverlo) o esconde una elección real entre
> mecanismos de caching con implicaciones distintas (coste, alcance, mantenimiento)?**

### 1. Reproducción / verificación directa

**Hallazgo original** (`docs/ARCHITECTURE_REVIEW/fase-4-produccion/17-cicd.md`, It.17): _"No cross-run
caching of any kind. `turbo.json` defines cacheable outputs (`dist/**`, `build/**`, `.next/**`) but
`ci.yml` has no `actions/cache` step for `.turbo` or Turbo remote-cache configuration (no
`TURBO_TOKEN`/`TURBO_TEAM` env vars referenced anywhere). Every CI run rebuilds the entire dependency
graph from a cold cache... a real, growing developer-feedback-speed cost with no offsetting benefit."_
Recomendación explícita: _"Add Turbo cache persistence (`actions/cache` keyed on lockfile hash, at
minimum, or a Turbo remote cache if budget allows) to `ci.yml`."_ Prioridad: **Medium** ("cheap,
unambiguous improvements with no tradeoff").

**Verificado hoy, con evidencia directa del workflow y de la configuración de Turbo, no solo lectura del
hallazgo:**

1. **`.github/workflows/ci.yml` no tiene ningún paso `actions/cache` para Turbo, hoy.** Los 3 jobs
   (`backend-ci`, `mobile-ci`, `preferred-tech-enforcement`) usan `cache: 'pnpm'` en
   `actions/setup-node@v4` — esto cachea únicamente el **store de pnpm** (paquetes de dependencias
   descargados), no la **caché de build de Turbo** (`.turbo/`, los outputs `dist/**`/`build/**`). Son
   dos cachés completamente distintas; el hallazgo original ya hacía esta distinción y sigue siendo
   exacta hoy.
2. **`turbo.json` sigue declarando outputs cacheables sin ningún mecanismo de persistencia entre runs.**
   `"build": {"dependsOn": ["^build"], "outputs": ["dist/**", "build/**", ".next/**"]}` — Turbo ya sabe
   qué cachear; nada en el repositorio (ni CI, ni variables de entorno) le dice dónde persistir esa
   caché entre ejecuciones.
3. **Cero referencia a `TURBO_TOKEN`/`TURBO_TEAM` en todo el repositorio** (`grep -rln
"TURBO_TOKEN\|TURBO_TEAM"` → ninguna coincidencia) — confirma que no existe ninguna configuración de
   Remote Cache (Vercel u otro proveedor), ni siquiera a medio configurar.
4. **La caché local de Turbo existe y es real localmente** — `.turbo/` aparece en la raíz y en cada uno
   de los 7 paquetes tras un build (`find . -iname ".turbo"`), correctamente excluida de git
   (`.gitignore` línea 11). Esto confirma que Turbo sí produce una caché de build real y sustancial —
   el problema no es que Turbo no cachee nada, es que esa caché nunca sobrevive entre ejecuciones de
   CI, que siempre arrancan en un runner efímero sin estado previo.
5. **El propio `ci.yml` fue modificado dos veces más después de la fecha de la auditoría original**
   (`668120a`, `330f3c2`, ambos 2026-07-23 según `git log`) — ninguno de esos cambios tocó el problema
   de caching; ambos ajustaron qué se construye (`turbo`, `theme-engine`, `domain`), no cómo persistir
   el resultado entre ejecuciones. El hallazgo no fue tocado por casualidad ni resuelto indirectamente
   por trabajo posterior, a diferencia de otros hallazgos de este programa (AR-002, AR-044).

### Respuesta a la pregunta de framing

> **El hallazgo se confirma vigente sin ningún cambio desde la auditoría original.** Cero caching de
> build persiste entre ejecuciones de CI hoy, exactamente como describió la auditoría — verificado
> directamente en el workflow, no inferido. **Sobre si esconde una decisión real:** sí, aunque acotada.
> La propia auditoría ya nombra dos mecanismos con implicaciones distintas: (a) `actions/cache` de
> GitHub, keyed sobre el lockfile — gratuito, nativo de GitHub Actions, con una tasa de aciertos menor
> (invalida toda la caché si cambia una sola dependencia) y (b) Turbo Remote Cache (Vercel u otro
> proveedor) — mayor tasa de aciertos (cachea por tarea/paquete, no por lockfile completo), pero
> introduce una dependencia de servicio externo y, en el caso de Vercel, un coste potencial. Esto no es
> "ejecución directa" sin elección — es una elección real de alcance y coste, aunque de magnitud mucho
> menor que las de AR-034/AR-054 (Esfuerzo S, Impacto Medio, un solo archivo de configuración
> involucrado).

**Consecuencia para el alcance de AR-013:** existe una bifurcación real (`actions/cache` local vs.
Remote Cache de proveedor externo) que amerita una Fase 2 breve, no una implementación directa — mismo
criterio de apertura que AR-013 comparte con AR-018/AR-034/AR-054 (Owner=Claude con una elección real
detrás), no con AR-022 (donde no había ninguna alternativa genuina). Dado el tamaño de la AR, se
anticipa que Fase 2A/2B sea corta y que Fase 4A pueda omitirse una vez fijada la política, si el
mecanismo resultante no tiene alternativas reales que comparar dentro de la opción elegida.

**Nota para la disciplina de la segunda mitad del programa (registrada explícitamente, no una
promoción):** esta Fase 1 buscó activamente, sin encontrarlo, un caso que tensionara alguna de las
hipótesis fuertes en observación (H9, H-GOV-01) — no aplica ninguna de las dos aquí: no hay ninguna
propiedad que "ya exista estructuralmente" sin reconocer (Turbo cachea localmente, pero la persistencia
entre runs de CI nunca existió, ni siquiera sin formalizar), y la decisión pendiente (elegir un
mecanismo de caching) no implica introducir una excepción tecnológica sin evidencia — ambas opciones
están ya nombradas y respaldadas por la propia auditoría. No es un contraejemplo; es un caso donde
ninguna de las dos hipótesis aplica, que es distinto.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

**H1 — Caché nativa de GitHub Actions.** El repositorio debe resolver el hallazgo con la capacidad
mínima suficiente (persistencia de `.turbo/` vía `actions/cache`, sin dependencias externas), sin
incorporar infraestructura adicional mientras la evidencia no demuestre que el rendimiento actual la
justifica.

**H2 — Turbo Remote Cache.** El repositorio debe tratar la caché de compilación como una capacidad
transversal del monorepo, compartida entre entornos (CI y desarrollo local), aceptando el coste y la
dependencia de un proveedor externo a cambio de una tasa de aciertos mayor.

### Evidencia real de telemetría de CI, no estimación

Se consultó el historial real de ejecuciones de `gh run list`/`gh run view` (no simulado) sobre los
últimos runs del workflow `CI - Commitment v2`:

1. **Duración total de un run completo hoy: 55-76 segundos**, medida sobre 9 ejecuciones reales
   consecutivas de esta misma sesión. No hay ningún indicio de que el tiempo total de CI sea un cuello
   de botella — un run completo (los 3 jobs) termina en poco más de un minuto.
2. **Desglose real por paso, job `Backend Lint, Build & Test`:** `Install Dependencies` 7s, `Build
Packages` (invocación de Turbo sobre todo el grafo) **15s**, `Lint Backend` 13s, `Build Backend`
   (segunda invocación directa, bypass de Turbo) 5s, `Test Backend` 7s, `Test Domain` 7s.
3. **Duplicación real confirmada, no solo teórica:** el paso `Build Packages` se ejecuta de forma
   idéntica en **ambos** jobs paralelos (`backend-ci`: 15s: `mobile-ci`: 14s) dentro del mismo run —
   exactamente la duplicación que el hallazgo original describía como "a real, growing
   developer-feedback-speed cost." Es un total de ~29s de trabajo redundante por run, no una suposición.
4. **Ninguna otra evidencia que respalde H2 apareció:** un único workflow existe en todo el repositorio
   (`ci.yml`; los otros 2 `.yml` del repo son `docker-compose.yml` y una config de Prometheus, sin
   relación); cero pipelines adicionales que reutilicen los mismos artefactos; cero mención de Vercel o
   remote cache en `turbo.json`/`package.json`/`ci.yml`; cero ADR o estrategia de escalabilidad aprobada
   que contemple caché distribuida entre CI y desarrollo local.

### Respuesta a la pregunta de framing de Fase 2A

> **El hallazgo requiere únicamente persistencia de caché entre ejecuciones de GitHub Actions, no una
> infraestructura de caché distribuida.** La evidencia real de telemetría muestra que el "problema" que
> motivó el hallazgo — recompilar todo el grafo en cada run — cuesta hoy ~15 segundos por job, duplicado
> una vez dentro del mismo run (~29s totales), sobre un run completo de ~70s. Ese es exactamente el
> tamaño del problema que `actions/cache` puede eliminar casi por completo (cachear `.turbo/` entre
> ejecuciones, con hit-rate alto porque el repositorio es pequeño — 8 paquetes, 2 apps — y el lockfile
> cambia con poca frecuencia). **H2 no encuentra ninguna de sus condiciones de supervivencia**: no hay
> builds excepcionalmente largos, no hay múltiples pipelines reutilizando artefactos, no hay necesidad
> documentada de caché compartida entre CI y desarrollo local, y no existe ninguna estrategia de
> escalabilidad aprobada que ya contemple Remote Cache. **H1 sobrevive con evidencia cuantitativa real,
> no solo por el principio de mínima capacidad necesaria.**

**Aplicación explícita de la disciplina de la segunda mitad:** se buscó activamente evidencia a favor de
H2 (duración de build, duplicación de pipelines, necesidad de caché compartida) en vez de asumir que H1
ganaba por default — la búsqueda no encontró nada que la respaldara. Esto no es lo mismo que "no se buscó
un contraejemplo"; aquí sí hubo una búsqueda activa y explícita de la hipótesis alternativa, con datos
reales de telemetría, no solo inferencia.

---

## Fase 2B — Decisión

**Estado: ✅ Cerrada. D-013.1 aprobada.**

**D-013.1:**

> **La caché de build de CI debe persistir entre ejecuciones utilizando la capacidad nativa de la
> plataforma (`actions/cache` sobre `.turbo/`), sin incorporar un proveedor de caché remota mientras no
> exista evidencia de que el tamaño o la frecuencia de los builds lo justifique.**

**2 propiedades congeladas:**

1. **Persistencia mínima suficiente.** La caché de Turbo debe sobrevivir entre ejecuciones del mismo
   workflow — no se exige que sobreviva entre CI y entornos de desarrollo local, ni entre proveedores.
2. **Proporcionalidad explícita frente a infraestructura futura.** Si en el futuro aparece evidencia real
   (builds que crecen significativamente, pipelines adicionales que dupliquen trabajo, necesidad de
   compartir caché entre CI y desarrollo local), esa evidencia justificaría una AR nueva para evaluar
   Remote Cache — no una ampliación silenciosa de esta decisión.

**Deja deliberadamente abierto (Fase 4A):** la clave exacta de `actions/cache` (qué archivos hashear:
`pnpm-lock.yaml`, `turbo.json`, o ambos), las rutas exactas a cachear (`.turbo/` en la raíz vs. por
paquete), y si se comparte una única entrada de caché entre `backend-ci` y `mobile-ci` o una por job.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

D-013.1 ya fijó la política (persistencia nativa, mínima suficiente); Fase 4A compara únicamente el
mecanismo concreto de `actions/cache`.

**Alternativa A — Una entrada de caché compartida entre ambos jobs, keyed sobre `pnpm-lock.yaml` +
`turbo.json` (elegida).** Un solo paso `actions/cache` con la misma clave en `backend-ci` y `mobile-ci`,
apuntando a `.turbo` (raíz) y `**/.turbo` (por paquete). Ventajas: el primer job que corre puebla la
caché; el segundo (ejecutándose en paralelo, sin garantía de orden) puede no beneficiarse en el mismo
run, pero todo run **posterior** sí, incluyendo el mismo tipo de duplicación intra-run detectada en
Fase 2A. Cubre exactamente la propiedad 1 de D-013.1.

**Alternativa B — Cachés separadas por job (descartada).** Misma mecánica, una entrada distinta por job.
Descartada: duplica el almacenamiento de caché de GitHub sin ningún beneficio adicional — ambos jobs
cachean exactamente el mismo grafo de build (`pnpm run build` en la raíz), no un subconjunto distinto.

**Alternativa C — Turbo Remote Cache (descartada, ya resuelta en Fase 2A/2B).** Contradice D-013.1
directamente — no hay evidencia que la justifique hoy.

**Alternativa elegida: A** — misma clave, un solo mecanismo, cubre la duplicación intra-run detectada en
Fase 2A para cualquier ejecución posterior a la primera.

---

## Fase 4B — Implementación

**Estado: ✅ Cerrada.**

**Cambio realizado:** añadido un paso `actions/cache@v4` a ambos jobs (`backend-ci`, `mobile-ci`) de
`.github/workflows/ci.yml`, inmediatamente después de `Install Dependencies` y antes de `Build
Packages`. Cachea `.turbo` (raíz) + `packages/*/.turbo` + `apps/*/.turbo`, con clave
`turbo-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml', 'turbo.json') }}` y `restore-keys:
turbo-${{ runner.os }}-` (permite un acierto parcial si el lockfile cambia pero `turbo.json` no).

**Validación real ejecutada contra CI real, no simulada — 2 ejecuciones observadas con `gh run
view`/`gh api`:**

1. **Primera ejecución tras el cambio (commit `98dda44`, run `30077980385`) — cache miss esperado,
   confirmado en el log:** `Cache not found for input keys: turbo-Linux-...` en ambos jobs. `Build
Packages` tardó 14s (`backend-ci`) y 14s (`mobile-ci`) — igual que la línea base de Fase 2A, como se
   esperaba en un cache miss. Duración total del run: **68s**, comparable a la línea base (~70-75s).
2. **Hallazgo real durante la primera ejecución, no anticipado en Fase 4A, documentado con transparencia
   en vez de ocultarlo:** `mobile-ci` guardó la caché correctamente (663 049 bytes, confirmado vía `gh
api repos/:owner/:repo/actions/caches`); `backend-ci` — que corre en paralelo con la misma clave —
   falló al guardar su copia: `"Failed to save: Unable to reserve cache with key turbo-Linux-..., another
job may be creating this cache."` **Esto no es un defecto: es el comportamiento documentado de
   `actions/cache` cuando dos jobs concurrentes comparten la misma clave** — la primera escritura gana,
   la segunda recibe un aviso no fatal y continúa sin error (ninguno de los dos jobs falló). No afecta la
   propiedad que D-013.1 exige (persistencia entre ejecuciones), porque la caché quedó guardada de todas
   formas.
3. **Segunda ejecución, commit vacío deliberado (`5a65dd6`, run `30078090184`) para forzar un segundo run
   real y observar el acierto de caché — acción transparente, registrada aquí, no ocultada:** ambos jobs
   confirman `Cache restored from key: turbo-Linux-...` en el log. **`Build Packages` pasó de 14-15s a
   0-1s en ambos jobs** — reducción medida, no estimada. Duración total del run: **55s**, un ~27% más
   rápido que la línea base de ~75s (Fase 1) y ~19% más rápido que la primera ejecución post-cambio
   (68s). Ambos jobs, en su paso `Post Cache Turbo build outputs`, confirman correctamente `"Cache hit
occurred on the primary key..., not saving cache"` — sin reintentos de guardado innecesarios ni
   conflictos en el hit.
4. **`git diff` limitado exclusivamente a `.github/workflows/ci.yml`** — 22 líneas añadidas, cero
   archivos de código de aplicación tocados.

**Criterio de cierre verificado:** la propiedad 1 de D-013.1 (persistencia mínima suficiente entre
ejecuciones del mismo workflow) queda demostrada con evidencia real, no solo con la configuración
correcta — un ciclo miss→hit completo, observado de principio a fin.

---

## Fase 5 — Cierre

**Estado: ✅ Cerrada.**

D-013.1 materializada e implementada íntegramente: caché de build persistida entre ejecuciones vía
`actions/cache`, sin incorporar Turbo Remote Cache. La reducción de tiempo observada (~20s por run, la
mayor parte del ahorro concentrado en `Build Packages`) es proporcional al tamaño real del problema
medido en Fase 2A (~15s de trabajo por job, ~29s duplicados por run) — ni más ni menos de lo que la
evidencia predijo, sin sobre-prometer un ahorro mayor del que el propio análisis de telemetría anticipó.

**Primer caso del segundo tramo del programa cerrado de principio a fin, con una aplicación explícita y
documentada de la nueva disciplina post-revisión-transversal:** se buscó activamente evidencia a favor
de la hipótesis descartada (H2) en dos momentos distintos — en Fase 2A (telemetría real) y de nuevo
implícitamente en Fase 4B (¿el mecanismo elegido resultó insuficiente, revelando que sí hacía falta
Remote Cache?) — la respuesta en ambos casos fue no: la solución mínima resolvió completamente el
problema medido, sin dejar un residuo que justificara escalar a infraestructura adicional.

---

## Estado

**Fase 1, Fase 2A, Fase 2B, Fase 4A, Fase 4B y Fase 5 cerradas. AR-013 CERRADA.** D-013.1 aprobada e
implementada: `actions/cache` sobre `.turbo/`, clave compartida entre `backend-ci`/`mobile-ci`. Validado
con 2 ejecuciones reales de CI (no simuladas): cache miss (68s, igual que la línea base) → cache hit
(55s, ~27% más rápido; `Build Packages` de 14-15s a 0-1s). Hallazgo transparente durante la validación
(condición de carrera no fatal entre jobs concurrentes con la misma clave, comportamiento documentado de
`actions/cache`, no un defecto) registrado sin ocultarlo. H2 (Turbo Remote Cache) descartada con
evidencia de telemetría real, no por default. `git diff` limitado a `.github/workflows/ci.yml`.
