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

## Estado

**Fase 1 cerrada.** El hallazgo original se confirma vigente sin cambios desde la auditoría: cero
caching de build persiste entre ejecuciones de CI. Existe una bifurcación real de mecanismo
(`actions/cache` local vs. Turbo Remote Cache de proveedor externo) que amerita Fase 2. Ninguna de las
hipótesis fuertes en observación (H9, H-GOV-01) aplica a este caso. Estado: ⬜ → 🟦 En análisis.
Decisión: pendiente.
