# Design System — Visión Técnica de Evolución

**No es un ADR.** Es un documento de dirección arquitectónica para el Design System, escrito durante
el Sprint de Estabilización (2026-07-19), a partir de los hallazgos del Theme Audit (Fase 1). No
autoriza ni programa ningún cambio por sí mismo — cada capa que describe se implementa (o no) como
una decisión aparte, explícita, cuando corresponda.

## Por qué este documento existe ahora

El Theme Audit encontró un patrón recurrente, no un bug aislado: `contentOnSemantic` es un solo valor
por theme intentando servir de texto legible sobre 4 colores (`success`/`warning`/`danger`/`info`) de
luminancia muy distinta, y falla WCAG AA contra 2-4 de ellos en 10 de los 16 themes. La causa raíz no
es que alguien haya elegido mal un color — es que el sistema no tiene un lugar arquitectónico donde
esa decisión pertenezca. Hoy los componentes leen colores base (`$accent`, `$divider`,
`$contentPrimary`) directamente; no existe una capa intermedia que exprese _para qué_ se usa un color,
solo _qué_ color es.

## Estado actual, confirmado contra el código (no supuesto)

```
ThemeDefinition (packages/theme-engine/src/themes/*.theme.ts)
  └─ ResolvedTheme.colors  (Base Tokens: background, accent, contentPrimary, divider, ...)
       │
       ▼  adaptThemeToTamagui() (packages/design-system/src/adapters/theme-adapter.ts)
       │  — spread directo, sin transformación semántica
       ▼
Tamagui theme object ($accent, $divider, $contentPrimary, ...)
       │
       ▼  Consumido directamente por cada componente
       ▼
Button.tsx, Card.tsx, Badge.tsx, Input.tsx, ...
  (cada uno decide por su cuenta qué Base Token usar para qué propósito)
```

Hay **una sola capa real de tokens hoy: Base Tokens.** No existe una capa "Semantic Tokens" ni
"Component Tokens" — cuando el audit encontró que `theme.opacity.disabled` no llega a ningún
componente, la razón técnica exacta es esta: `adaptThemeToTamagui()` solo propaga `colors` +
`border` + `motion*` al theme de Tamagui; `opacity`, `spacing`, `radius` y `elevation` existen en
`ResolvedTheme` pero nunca se inyectan — no hay olvido de un componente, es que la tubería que los
llevaría hasta ahí no existe. (Mismo patrón, dato adicional: `motionFast`/`motionNormal`/`motionSlow`
sí se inyectan pero tampoco los lee ningún componente — el sistema de motion real vive en
`tokens/motion.ts` como un `animations` driver de Tamagui aparte. No es parte del Sprint 1, solo se
anota aquí porque es la misma clase de problema.)

## Las cuatro capas propuestas

**Ninguna de estas cuatro capas se implementa por este documento.** Se describen para tener un
vocabulario común antes de decidir cuál construir primero, y para que Sprint 1 (Switch, opacity) ya
empiece a alinearse con esta dirección sin tener que rehacerse después.

### 1. Base Tokens (ya existen)

Valores crudos, sin significado de uso: `#8B5CF6`, `0.4`, `16px`. Viven en
`packages/theme-engine/src/themes/*.theme.ts`. Un theme nuevo se define completamente en esta capa.
No cambia con esta propuesta.

### 2. Semantic Tokens (no existen — la brecha que expone el audit)

Le dan intención a un Base Token: _para qué se usa_, no _qué color es_. Ejemplos concretos del propio
pedido de revisión:

```
actionPrimary       → hoy: accent (reutilizado también como 'info' en la mayoría de themes)
actionDanger         → hoy: danger
surfaceRaised        → ya existe como Base Token, pero funciona como semantic de facto
focusRing            → hoy: colors.focus
fieldBorder          → hoy: divider (leído directo por Input/TextArea)
fieldBorderFocused   → hoy: colors.focus (mismo valor que focusRing, sin nombre propio)
fieldBorderError     → hoy: danger (mismo valor que actionDanger, sin nombre propio)
textOnAction         → hoy: contentOnAccent
```

Esta es también la capa natural para resolver `contentOnSemantic` — pero **cuál de las dos filosofías
usar (Opción A: `contentOnSuccess`/`contentOnWarning`/... explícitos, vs. Opción B:
`calculateBestForeground()` automático) es exactamente la decisión que este documento NO toma.** Las
dos son compatibles con tener una capa Semantic Tokens; difieren en si esos tokens se declaran a mano
por theme o se derivan en runtime. Documentado aquí para que quien tome esa decisión no tenga que
re-descubrir la arquitectura primero.

### 3. Component Tokens (no existen — hoy cada componente decide solo)

Le dan nombre a cómo un componente específico usa un Semantic Token. Hoy, por ejemplo, `Card.tsx`
decide `bg = '$surfaceRaised'` con un `if/else` por variante, directamente en el componente. Una capa
de Component Tokens se vería así:

```
Card.background.elevated   → surfaceRaised (Semantic) → surfaceRaised (Base)
Card.background.outlined   → transparent
Button.background.primary  → actionPrimary (Semantic) → accent (Base)
Input.border.default       → fieldBorder (Semantic) → divider (Base)
Input.border.focused       → fieldBorderFocused (Semantic) → focus (Base)
```

Esto es lo que permitiría, por ejemplo, que un futuro theme decida que sus Inputs usan un borde más
grueso o de otro tono sin tocar `Input.tsx` — hoy esa personalización requeriría editar el componente
mismo, no el theme.

### 4. Theme Overrides (parcialmente posible hoy, no formalizado)

Un theme que solo redefine un subconjunto de tokens (en cualquier capa) en vez de declarar los 4
niveles completos desde cero. Hoy cada uno de los 16 themes repite el `ResolvedTheme` completo
(colors + typography + spacing + radius + border + elevation + motion + icons + illustrations +
opacity + zIndex) incluso cuando la mayoría de esos campos son idénticos entre todos ellos (motion,
spacing, radius, opacity son literalmente iguales en los 16 archivos — verificado). Un mecanismo de
overrides permitiría declarar un theme como "toma DefaultLight y cambia solo estos 6 colores", en vez
de repetir ~100 líneas idénticas 16 veces — que además es la razón mecánica de por qué agregar un
theme nuevo hoy es fácil de hacer mal (copiar-pegar 100 líneas y cambiar algunas, sin garantía de que
las que no se tocaron sigan siendo correctas para la nueva paleta).

## Cómo esto informa el trabajo ya autorizado (Sprint 1)

- **Switch (opacity/color hardcodeado):** el fix inmediato es leer un Base Token existente
  (`interactive`/`contentOnAccent` ya resuelven el problema de contraste). No requiere esperar a la
  capa Semantic — es una corrección dentro de la arquitectura actual, no una migración.
- **`theme.opacity` real:** conectar `ResolvedTheme.opacity` hasta `useInteractionAnimation()` es,
  técnicamente, extender `adaptThemeToTamagui()`/`baseTamaguiTokens()` para inyectar los 3 valores
  como tokens de Tamagui (mismo mecanismo ya usado para `motionFast`/etc.), y leerlos desde el hook
  vía `useTheme()`. Esto es Base Tokens → consumo directo, igual que hoy — no introduce Semantic
  Tokens todavía, pero es exactamente el tipo de conexión que una capa Semantic (`opacity.disabled` →
  `state.disabled` en cualquier componente) formalizaría más adelante.

## Qué NO decide este documento

- Si `contentOnSemantic` se resuelve con Opción A o B (Semantic Tokens explícitos vs. cálculo
  automático de contraste).
- Si `divider`/`accent` cambian de valor en algún theme.
- Cuándo (o si) se construye la capa Component Tokens — es la más grande de las cuatro y la de menor
  urgencia inmediata; el sistema funciona sin ella hoy, solo con más código repetido por componente.
- Cuándo se construye Theme Overrides — valioso sobre todo si el roster de themes sigue creciendo
  (pasó de 4 a 16 en esta misma sesión de trabajo), pero no bloquea nada del Sprint de Estabilización.

## Recomendación de secuencia (no una decisión, una sugerencia)

1. Terminar Sprint 1/2 del Sprint de Estabilización sin tocar esta arquitectura (ya en curso).
2. Decidir la filosofía de `contentOnSemantic` (Opción A vs B) como una discusión de diseño aparte,
   informada por este documento.
3. Recién ahí evaluar si esa decisión justifica construir la capa Semantic Tokens formalmente, o si
   alcanza con nombrar mejor los Base Tokens existentes sin una capa nueva.
4. Component Tokens y Theme Overrides quedan como candidatos de más largo plazo — revisar cuando el
   roster de themes crezca más, o cuando se sienta dolor real manteniendo componentes por theme.
