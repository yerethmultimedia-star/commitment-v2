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

## Fase 2B — Decisión

**Estado: ✅ Cerrada. D-055.1 aprobada.**

Igual que en AR-034, la decisión fija la política, no el mecanismo concreto de ESLint.

**D-055.1:**

> **Los archivos `.tsx` forman parte del alcance normal del análisis estático del frontend. La
> capacidad de analizarlos deberá permanecer habilitada de forma permanente. La deuda histórica
> descubierta al activar dicha capacidad podrá gestionarse mediante un mecanismo explícito y temporal
> de transición, sin excluir nuevamente la extensión `.tsx` del proceso de análisis.**

**4 propiedades congeladas:**

1. **Cobertura permanente** — los archivos `.tsx` son ciudadanos de primera clase del pipeline de
   lint; no pueden quedar fuera del análisis por una limitación de configuración.
2. **Separación entre capacidad y deuda** — la capacidad de analizar `.tsx` es independiente de la
   cantidad de hallazgos existentes; la aparición de deuda histórica no justifica deshabilitar el
   análisis.
3. **Gestión explícita de la transición** — los 93 hallazgos podrán administrarse mediante un
   mecanismo temporal de adopción; la transición es parte de la implementación, no de la arquitectura
   objetivo.
4. **No regresión de cobertura** — una vez habilitado el análisis de `.tsx`, futuras modificaciones de
   la configuración no deberán volver a dejar esa extensión fuera del alcance de ESLint. Responde
   directamente al hallazgo que originó esta AR.

**Deja deliberadamente abierto (Fase 4A):** `warn` vs. `error`, baseline, allowlist, overrides, orden
de migración de los 93 hallazgos, estrategia concreta de reducción de deuda, configuración específica
de ESLint.

**Relación con AR-034, explícitamente desacoplada:** D-034.1 responde "¿qué debe gobernarse?"
(imports a Tamagui); D-055.1 responde "¿sobre qué universo de archivos debe ejercerse esa
gobernanza?" — decisiones ortogonales y compatibles. Una vez implementada D-055.1, AR-034 podrá
reanudarse sin necesidad de modificar su propia decisión, porque la capacidad de la que dependía
habrá quedado institucionalizada.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.**

D-055.1 ya congeló correctamente las 4 propiedades; Fase 4A no vuelve a discutir la política, se
limita a comparar qué mecanismo técnico las satisface con el menor coste de transición.

**Alternativa A — Capacidad inmediata + transición explícita (elegida).** Habilitar permanentemente
el análisis de `.tsx` (parser + `parserOptions`); configurar las reglas con severidad `error`;
introducir un mecanismo explícito y temporal (overrides, allowlist o equivalente) para gestionar
únicamente los 93 hallazgos históricos; todo archivo nuevo queda sujeto al conjunto completo de reglas
desde el primer día. Ventajas: materializa íntegramente D-055.1; la cobertura de `.tsx` deja de
depender de una omisión de configuración; la deuda histórica queda identificada y medible; la
transición es explícita y reversible. Desventaja reconocida: requiere mantener temporalmente un
mecanismo de transición.

**Alternativa B — Activar `.tsx` con `warn` (descartada).** Misma cobertura, hallazgos como
advertencias. Descartada: no garantiza que la nueva deuda no aumente, debilita la gobernanza del
análisis estático, convierte la transición en una práctica voluntaria.

**Alternativa C — Corregir los 93 hallazgos antes de habilitar `.tsx` (descartada).** Descartada:
cambia completamente el alcance, convierte AR-055 en una migración masiva, retrasa la obtención de la
capacidad que precisamente originó la AR.

**Alternativa D — Mantener `.tsx` fuera del análisis hasta una futura migración (descartada).**
Debe descartarse: contradice directamente D-055.1 ya aprobada, mantiene la brecha de gobernanza
descubierta en Fase 1.

**Comparación:**

| Criterio                       | A     | B       | C             | D    |
| ------------------------------ | ----- | ------- | ------------- | ---- |
| Cobertura permanente de `.tsx` | ✅    | ✅      | ❌ (diferida) | ❌   |
| Previene nueva deuda           | ✅    | Parcial | ✅            | ❌   |
| Respeta el alcance de la AR    | ✅    | ✅      | ❌            | ❌   |
| Compatible con D-055.1         | ✅    | Parcial | Parcial       | ❌   |
| Complejidad                    | Media | Baja    | Alta          | Baja |

**Alternativa elegida: A** — no por ser la más estricta, sino por ser la única que mantiene
simultáneamente las 4 propiedades congeladas (cobertura permanente, separación capacidad/deuda,
transición explícita, no regresión de cobertura).

**Simetría registrada con AR-034, no promovida a principio metodológico:** en AR-034 la capacidad ya
existía y faltaba el enforcement; en AR-055 el enforcement existía y faltaba ampliar correctamente la
capacidad. En ambos casos la solución elegida es una adopción incremental con transición explícita,
cada AR resolviendo una dimensión distinta — esa consistencia facilita que, una vez implementada
AR-055, AR-034 pueda desbloquearse sin necesidad de revisar ni D-034.1 ni D-055.1.

**Explícitamente fuera de alcance de Fase 4A:** la lista exacta de los 93 archivos con excepción
temporal, el formato concreto de la exclusión, el proceso de eliminación de excepciones, plazos de
migración.

---

## Corrección de datos (registrada durante Fase 4B)

Durante la implementación se descubrieron **dos correcciones** sobre las cifras citadas en Fase 1,
2A, 2B y 4A. Se documentan aquí de forma transparente, sin reescribir el texto original de esas fases
— el mismo criterio ya aplicado antes en este programa ante otros errores de conteo autodetectados.

**Corrección 1 — "93 hallazgos" era una cifra incorrecta.** La Fase 1 obtuvo ese número mediante
`grep` de texto sobre la salida con colores ANSI de `expo lint`, sin filtrar con precisión por
extensión de archivo. Al repetir la medición en Fase 4B con salida JSON (`expo lint -- --format
json`), filtrada exactamente por extensión, la cifra real es otra: **48 problemas ya existían en la
línea base actual (cero cambios de configuración), todos en archivos `.ts`, sin ninguna relación con
`.tsx` ni con esta AR.** Habilitar `.tsx` añade **45 problemas reales nuevos, en 28 de los 126
archivos** (no 93). La cifra "93" citada en Fase 1-4A es la suma de ambos conjuntos, indebidamente
mezclados: 48 (deuda de `.ts`, preexistente, ajena a AR-055) + 45 (deuda de `.tsx`, la que sí
corresponde a esta AR) = 93. Los dos conjuntos nunca debieron sumarse — la política D-055.1 y el
diseño de Fase 4A siguen siendo correctos porque hablan de "la deuda histórica que expone activar
`.tsx`", que siempre fue 45, no 93; ninguna decisión necesita revisarse por este motivo.

**Corrección 2 — limpieza de configuración residual, no deuda funcional.** Durante la validación de
Fase 4B apareció un hallazgo adicional: 2 de esos problemas (uno en la línea base de 48, otro en los
45 de `.tsx`) eran el mismo patrón — un comentario `// eslint-disable-next-line
react-hooks/exhaustive-deps` que ESLint no puede resolver porque `eslint-plugin-react-hooks` nunca
estuvo instalado en el repositorio (confirmado por ausencia total en `package.json`, lockfile,
`node_modules` e historial de git de ambos). No existe ninguna evidencia — ni ADR, ni entrada previa
de decisión, ni un tercer caso — de que el proyecto pretendiera adoptar ese plugin; son dos comentarios
huérfanos del mismo autor, en commits distintos, sin relación arquitectónica declarada. Se eliminaron
ambos comentarios como limpieza de configuración residual (no como corrección de deuda de lint): uno
en `apps/mobile/src/features/insights/hooks/useCountUp.ts` (línea base `.ts`) y otro en
`apps/mobile/src/shared/forms/ControlledSelect.tsx` (deuda histórica de `.tsx`). Esto no modifica el
comportamiento de ningún componente — ninguno de los dos comentarios tenía efecto alguno, porque la
regla a la que apuntaban nunca estuvo activa.

**Cifras finales, verificadas, que gobiernan el cierre de Fase 4B:**

- Línea base preexistente (ajena a AR-055): **47** problemas, todos en `.ts` (48 − 1 por la limpieza
  residual).
- Deuda histórica atribuible a habilitar `.tsx` (el objeto real de la transición de D-055.1): **44**
  problemas en **27** archivos (45 − 1 por la limpieza residual), desglosados por regla:
  `no-unused-vars` (29), `no-console` (6), `no-undef` (8), `no-empty` (1).
  `react-hooks/exhaustive-deps` deja de aparecer en este desglose: no era deuda de `.tsx`, era una
  referencia muerta ya resuelta en la Corrección 2.

Ninguna de las dos correcciones invalida D-055.1 ni la Alternativa A de Fase 4A: la política ("`.tsx`
forma parte permanente del alcance; la deuda histórica se gestiona con transición explícita, sin
excluir la extensión") y el mecanismo elegido (parser permanente + override temporal para archivos
históricos) siguen siendo exactamente los correctos — solo cambian las cifras que describen cuánta
deuda hay y de qué tipo.

---

## Fase 4B — Implementación

**Estado: ✅ Cerrada.**

**Cambios realizados**, exactamente los que Fase 4A autorizó más la limpieza residual descrita arriba:

1. **Override de capacidad** (`.eslintrc.json`) — `"files": ["apps/mobile/src/**/*.tsx"]` con
   `"parser": "@typescript-eslint/parser"` y el `parserOptions` mínimo identificado en Fase 1
   (`ecmaFeatures.jsx`, `sourceType`, `ecmaVersion`). Sin `extends` ni `rules` propias — no se activa
   ningún conjunto de reglas nuevo.
2. **Override de transición temporal** (`.eslintrc.json`) — lista explícita de los 27 archivos con
   deuda histórica real, con las 4 reglas correspondientes (`no-unused-vars`, `no-console`,
   `no-empty`, `no-undef`) en `"off"` **únicamente para esos 27 archivos**. Cualquier archivo `.tsx`
   nuevo o no listado queda sujeto al conjunto normal de reglas desde el primer día.
3. **Limpieza de configuración residual** — eliminación de 2 comentarios `eslint-disable-next-line
react-hooks/exhaustive-deps` huérfanos (`useCountUp.ts`, `ControlledSelect.tsx`), documentada en la
   sección anterior. Sin este paso, la validación no podía alcanzar la línea base exacta, porque ese
   patrón producía un diagnóstico (`Definition for rule ... was not found`) que la severidad `"off"`
   no puede suprimir — no es una violación de regla normal, es una referencia irresoluble.

**Validaciones ejecutadas, con evidencia real (no inferida):**

1. **Capacidad institucionalizada, no incidental** — el override de capacidad no depende de ningún
   otro archivo de configuración ni de un flag manual; `expo lint` (sin `--ext`) parsea los 126
   archivos `.tsx` de forma consistente en cada ejecución.
2. **Bloqueo de parseo eliminado** — `grep -i "parsing error\|unexpected token"` sobre la salida
   completa de `expo lint --no-cache`: **0 coincidencias**. 126/126 archivos `.tsx` parsean
   correctamente.
3. **La deuda histórica permanece exactamente la esperada (tras la corrección de cifras)** —
   `expo lint --no-cache -- --format json`, parseado por extensión: **47 problemas, 100% en `.ts`,
   0 en `.tsx`.** Coincide exactamente con la línea base corregida (47) — ni 44, ni 50, ni ninguna
   cifra intermedia; los 44 hallazgos históricos de `.tsx` quedan completamente cubiertos por el
   mecanismo de transición, sin ocultar el conteo (siguen siendo detectables quitando el override de
   transición, como se hizo para verificarlos).
4. **El mecanismo de transición no exime archivos nuevos** — se creó un archivo `.tsx` temporal fuera
   de la lista de excepción (`__ar055_temp_probe.tsx`) con una violación deliberada de `no-console`;
   `expo lint` lo reportó normalmente (`warning Unexpected console statement`); el archivo se eliminó
   inmediatamente después de la prueba.
5. **Alcance del `git diff` limitado a lo estrictamente necesario** — `git diff --stat`: `.eslintrc.json`
   (configuración) + 1 línea eliminada en `useCountUp.ts` + 1 línea eliminada en `ControlledSelect.tsx`
   (ambas, la eliminación de un comentario sin efecto, no un cambio de lógica). Cero archivos `.tsx`
   modificados en su comportamiento, JSX, props o lógica de componente.

**Criterio de cierre — los 5 puntos de Fase 4B, verificados:**

1. ✅ `.tsx` forma parte permanente del análisis (override sin condiciones, sin flags manuales).
2. ✅ El bloqueo de parseo desapareció completamente (0 errores de parseo).
3. ✅ Los 44 hallazgos históricos (cifra corregida) quedan explícitamente gestionados, no ocultos.
4. ✅ Los nuevos archivos `.tsx` quedan sujetos al conjunto normal de reglas (verificado con archivo
   de prueba).
5. ✅ La implementación no modificó código de producción — los 2 archivos tocados solo perdieron un
   comentario de ESLint sin efecto.

---

## Fase 5 — Cierre

**Estado: ✅ Cerrada.**

AR-055 cierra con los 5 criterios de Fase 4B satisfechos y sin desviación del alcance congelado en
D-055.1/Fase 4A: no se instaló ningún plugin nuevo, no se corrigió deuda funcional de `.tsx`, no se
tocó ningún componente más allá de la limpieza de 2 comentarios muertos (autorizada explícitamente
como excepción acotada, evidenciada con `git log`/`git blame`/búsqueda exhaustiva de referencias antes
de actuar).

**Desbloqueo de AR-034:** la precondición que bloqueaba `AR-034/Fase 4B` (`.tsx` nunca se analizaba)
queda resuelta. `AR-034` puede retirar su estado de bloqueo y reanudar su Fase 4B exactamente donde se
detuvo, sin reabrir `D-034.1` ni su diseño de Fase 4A ya aprobado.

**Hallazgo metodológico confirmado, no solo hipotetizado:** la hipótesis registrada en `README.md`
("Una Fase 4B puede descubrir una precondición técnica no conocida durante las fases anteriores que
impide materializar una decisión ya validada, sin invalidar dicha decisión") se confirma dos veces
dentro de esta misma AR — la propia AR-055 nació de ese patrón (vía AR-034), y su propia Fase 4B
encontró una instancia más pequeña y acotada del mismo patrón (el plugin ausente), resuelta dentro del
mismo alcance por ser proporcional (2 líneas de configuración residual, no una capacidad faltante).

## Estado

**Fase 1, Fase 2A, Fase 2B, Fase 4A, Fase 4B y Fase 5 cerradas. AR-055 cerrada.** D-055.1 aprobada e
implementada: `.tsx` habilitado permanentemente (parser + parserOptions), severidad `error`, deuda
histórica (44 hallazgos/27 archivos, cifra corregida desde 45/28) gestionada mediante override
temporal y explícito. Línea base final verificada: 47 problemas, 100% preexistentes en `.ts`, 0 en
`.tsx`. Desbloquea a `AR-034`.
