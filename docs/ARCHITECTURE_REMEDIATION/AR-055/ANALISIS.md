# AR-055 — Habilitar el análisis de `.tsx` en el frontend de forma controlada

Spin-off de AR-034, creada 2026-07-24. A diferencia de AR-052/AR-053/AR-054 (que nacieron de una
separación de alcance dentro de un hallazgo de auditoría), AR-055 es la primera AR que nace de una
**precondición técnica descubierta durante la implementación** de otra AR (AR-034, Fase 4B).

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

Se aplica exactamente la misma disciplina que en las 21 AR cerradas: separar hechos comprobados de
inferencias, sin diseñar la solución todavía. El origen del hallazgo (Fase 4B de AR-034) ya estableció
4 hechos; esta fase responde las 4 preguntas que quedaban abiertas, con evidencia nueva, sin asumir
ninguna respuesta de antemano.

### Hechos ya conocidos al abrir esta AR (heredados de `AR-034/ANALISIS.md`)

1. `expo lint` no descubre archivos `.tsx` en el estado actual del repositorio.
2. La aparición de un patrón `.tsx` en `overrides[].files` cambia el conjunto de archivos analizados.
3. Ese cambio, tal como se probó en AR-034, expone del orden de 150 problemas.
4. AR-034 no puede validarse sin resolver antes esta situación.

### Pregunta 1 — ¿Es un comportamiento esperado de Expo+ESLint, o una limitación de versión?

**Respuesta, verificada directamente en el código fuente de la dependencia instalada, no en
documentación externa:** es un comportamiento **documentado y esperado de ESLint 8.x en modo de
configuración legacy**, no un defecto ni una particularidad de Expo. `node_modules/eslint/lib/cli-engine/file-enumerator.js`
(ESLint `8.57.1`, resuelto en este monorepo), método `isTargetPath()`:

```js
// If `--ext` option is present, use it.
if (extensionRegExp) {
    return extensionRegExp.test(filePath);
}
// `.js` file is target by default.
if (filePath.endsWith(".js")) {
    return true;
}
// use `overrides[].files` to check additional targets.
const config = providedConfig || configArrayFactory.getConfigArrayForFile(filePath, ...);
return config.isAdditionalTargetPath(filePath);
```

Sin `--ext` explícito, **solo `.js` es objetivo por defecto**; cualquier otra extensión únicamente se
descubre si algún patrón de `overrides[].files` ya presente en la configuración resuelta la cubre.
Verificado además en `@expo/cli@57.0.6` (`build/src/lint/lintAsync.js`): `expo lint` solo añade
`--ext` si el usuario lo pasa explícitamente (`options.ext.forEach(ext => eslintArgs.push('--ext',
ext))` — vacío por defecto). Hoy, el único patrón de `overrides[].files` en `.eslintrc.json` que
menciona una extensión es `**/*.ts` — de ahí que `.ts` sí se descubra y `.tsx` no. **No es una
limitación de versión de Expo ni de ESLint** — es que la configuración de este proyecto nunca declaró
un patrón que cubra `.tsx`.

### Pregunta 2 — ¿Todos los `.tsx` fallan por la misma causa, o existen varios grupos de errores?

**Respuesta, verificada con un experimento controlado y revertido (`git checkout` inmediato tras cada
prueba):** existen **dos grupos completamente independientes**, no uno:

- **Grupo A — bloqueo de parseo (100% de los archivos, mientras no se corrija).** Sin un parser
  consciente de JSX+TS para `.tsx`, cada uno de los 126 archivos falla con `Parsing error: Unexpected
token <` (o equivalente) — cero análisis real ocurre, solo un error de sintaxis.
- **Grupo B — hallazgos reales, preexistentes, independientes del bloqueo.** Corrigiendo únicamente el
  parser (ver Pregunta 4), el bloqueo de parseo desaparece por completo (0 errores de parseo en los
  126 archivos) y aparecen **93 problemas reales en solo 28 de los 126 archivos (22%)** — el 78%
  restante queda completamente limpio. Desglose por regla: `@typescript-eslint/no-explicit-any` (19,
  error), `no-undef` sobre `React` (8, error — código que referencia `React.algo` sin importar
  `React`), `react-hooks/exhaustive-deps` (2, error — "Definition for rule ... was not found", el
  plugin no está cargado), `no-console` (~26, warning), `@typescript-eslint/no-unused-vars` (~5,
  warning), `no-empty` (2, error), `@typescript-eslint/ban-ts-comment` (1, error).

**Los dos grupos no tienen la misma causa ni requieren la misma solución.** El Grupo A es
estrictamente un problema de configuración (parser ausente). El Grupo B es deuda real de código, ya
existente, simplemente invisible hasta ahora porque el Grupo A impedía llegar a analizarla.

### Pregunta 3 — ¿El problema es descubrimiento de archivos, configuración del parser, configuración de TypeScript, o una combinación?

**Respuesta, aislada experimentalmente en dos pasos independientes:**

1. **Descubrimiento de archivos** — un `overrides` que menciona `**/*.tsx` sin ninguna regla real
   (`"rules": {}`) ya es suficiente para que ESLint empiece a visitar los 126 archivos `.tsx` (efecto
   secundario del mecanismo de la Pregunta 1). Confirmado: este paso, por sí solo, no resuelve nada —
   sin parser, los 126 archivos fallan a parsear.
2. **Configuración del parser** — añadiendo únicamente `"parser": "@typescript-eslint/parser"` +
   `"parserOptions": {"ecmaFeatures": {"jsx": true}, "sourceType": "module", "ecmaVersion": "latest"}`
   al mismo `overrides`, sin `"extends"` ni `"rules"` adicionales, los 126 archivos parsean
   correctamente (0 errores de parseo).

**No es una cuestión de configuración de TypeScript** (`tsconfig.json`/`parserOptions.project`) — no
se necesitó para este nivel de análisis (parseo de sintaxis + reglas no-type-aware); ningún error
observado está relacionado con resolución de tipos o de módulos. Es la combinación mínima de
(1) descubrimiento + (2) parser — dos configuraciones independientes, ambas necesarias, ninguna
suficiente por sí sola.

### Pregunta 4 — ¿Cuál es el cambio mínimo que habilita el análisis de `.tsx` sin introducir alcance adicional?

**Respuesta, verificada empíricamente, no asumida:** un único `overrides` nuevo en `.eslintrc.json`:

```json
{
  "files": ["apps/mobile/src/**/*.tsx"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": { "jsx": true },
    "sourceType": "module",
    "ecmaVersion": "latest"
  }
}
```

Sin `"extends"` y sin `"rules"` propias. Este cambio, y ningún otro, resulta en: 126/126 archivos
`.tsx` parseando correctamente; el mismo conjunto de reglas que ya se aplica hoy al resto de la
aplicación (vía la configuración raíz + lo que sea que `expo lint` aporte de forma interna,
consistente en `.ts` y `.tsx` por igual) queda expuesto también en `.tsx`, sin activar ningún
conjunto de reglas nuevo (`plugin:@typescript-eslint/recommended` deliberadamente NO se añade a este
override — activarlo produjo 249 problemas en un experimento descartado, un conjunto de reglas que
hoy no se aplica a ningún archivo `.tsx` ni `.ts` fuera de lo ya vigente). El resultado neto —93
problemas reales en 28 archivos— es información nueva sobre deuda ya existente, no una ampliación de
alcance.

### Respuesta consolidada a la pregunta de framing de esta AR

> **El bloqueo es exactamente lo que las 4 preguntas de arriba describen: un comportamiento
> documentado de ESLint 8.x (no un defecto de Expo ni de versión), causado por la ausencia de un único
> patrón de configuración (`overrides` para `.tsx` con parser JSX+TS), separable en dos causas
> independientes (descubrimiento vs. parseo), con un cambio mínimo ya identificado y verificado que no
> introduce ningún alcance adicional — solo expone 93 problemas reales, preexistentes, en el 22% de
> los archivos `.tsx` del proyecto.**

**Consecuencia para el alcance de AR-055:** la causa mínima suficiente del bloqueo ya está identificada
y verificada con evidencia real, no solo teorizada. Lo que queda pendiente para fases posteriores no es
"encontrar la causa" — ya está encontrada — sino **decidir qué hacer con los 93 problemas reales que
la corrección del bloqueo expone** (corregirlos ahora, excluirlos temporalmente como hizo AR-034 con
sus 82 violaciones, o algún híbrido) y **cómo evitar reabrir accidentalmente el mismo tipo de brecha
para futuras extensiones de archivo** (`.jsx`, por ejemplo, tampoco está cubierto hoy). Esa es
exactamente la misma clase de decisión de transición que AR-034 ya resolvió en su propia Fase 2B — un
paralelismo que corresponde explorar en la Fase 2 de esta AR, no aquí.

---

## Fase 2A — Hipótesis

**Estado: ✅ Cerrada.**

La Fase 1 ya cambió el tipo de problema — la búsqueda de causa está terminada; la evidencia es
suficientemente específica y falsable como para no seguir investigando esa dimensión. La tensión real
pasa a ser otra: **¿cuál es la política de adopción una vez que el bloqueo técnico desaparece?** Las
hipótesis giran alrededor de los 93 hallazgos reales, no del parser.

**H1 (principal, la que se espera que sobreviva):** activar el soporte para `.tsx` inmediatamente y
gestionar los 93 hallazgos mediante una estrategia incremental de transición. Se espera que sobreviva
porque: la causa técnica mínima ya está demostrada; el parser deja de ser un problema; los 93
hallazgos son deuda preexistente, no regresiones introducidas por AR-055; posponer indefinidamente el
análisis mantendría una brecha objetiva en la gobernanza del repositorio.

**Hipótesis alternativas:**

- **H2** — corregir primero los 93 problemas y solo después habilitar el análisis de `.tsx`.
- **H3** — mantener `.tsx` fuera del alcance de ESLint hasta una futura migración del frontend.

**Separación explícita de dos conceptos que la evidencia ya distingue, para no mezclarlos:**

1. **Capacidad** — ESLint puede analizar correctamente `.tsx`. AR-055 debe garantizar esto.
2. **Resultado** — al hacerlo aparecen 93 problemas históricos. Esto condicionará la estrategia de
   adopción, pero no invalida la necesidad de adquirir la capacidad.

**Expectativa registrada para Fase 2B, sin resolverla aquí:** si H1 sobrevive, la decisión
probablemente no debería decir "corregir los 93 problemas", sino algo más cercano a: _"el análisis de
archivos `.tsx` forma parte del alcance normal de ESLint. La deuda histórica descubierta durante su
activación podrá gestionarse mediante un mecanismo explícito de transición sin excluir permanentemente
esta extensión del proceso de análisis."_ Esa formulación congelaría la política, no la herramienta.

**Observación registrada, no promovida:** AR-055 empieza a parecer el complemento natural de AR-034 —
AR-034 define **qué** debe gobernarse (imports a Tamagui); AR-055 define **sobre qué universo de
archivos** puede ejercerse esa gobernanza. Son decisiones ortogonales, y precisamente por eso la
dependencia introducida tiene sentido: resolver AR-055 no resuelve D-034.1 por sí solo, únicamente
hace posible implementarlo sin ampliar artificialmente su alcance.

---

## Estado

**Fase 1 y Fase 2A cerradas.** Causa raíz identificada, verificada y cerrada — no requiere más
investigación. H1 sobrevive: activar `.tsx` inmediatamente, gestionar los 93 hallazgos mediante
transición incremental. H2/H3 quedan como alternativas a descartar formalmente en Fase 2B. Pendiente:
**Fase 2B (Decisión)**. Estado: se mantiene 🟦 En análisis. Decisión: se mantiene 💭 Pendiente de
análisis (pendiente de que el usuario congele D-055.1 en Fase 2B).
