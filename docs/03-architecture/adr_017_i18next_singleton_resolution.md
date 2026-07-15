# 🏛️ ADR-017: Metro Module Resolution Hazards (i18next Singleton + Tamagui Platform Builds)

**Estado:** Aprobado

---

## Contexto

Durante el Product Completion Sprint (VS-031), se descubrió que el `DashboardHeroCard` renderizaba su ícono pero nunca su título ni subtítulo. La investigación reveló que el problema no era local a ese componente: **todo el patrón `i18nKey` del Design System** (`Title`, `Body`, y cualquier componente construido sobre `TextBase.tsx`) devolvía texto vacío en toda la aplicación. Esto también explicaba, sin que se hubiera diagnosticado como tal, títulos de sección faltantes en Insights y otros textos "misteriosamente ausentes" detectados durante la auditoría visual.

### Causa raíz

`TextBase.tsx` (en `@commitment/design-system`) usa `t()` de `@commitment/localization`, que internamente llama a `i18next.t()` importando `i18next` directamente (singleton por diseño, sin Context/DI). `apps/mobile` inicializa su **propia** instancia de `i18next` vía `react-i18next` en `core/i18n/index.ts` (`i18n.use(initReactI18next).init({...})`).

Para que esto funcione, **ambos puntos de entrada deben terminar ejecutando el mismo objeto `i18next` en memoria**. Se identificaron dos problemas independientes que rompían esa garantía:

1. **Versiones incompatibles declaradas.** `@commitment/localization` dependía de `i18next@^23.10.1`; `apps/mobile` de `i18next@^26.3.5`. pnpm, con su `node_modules` aislado por paquete, instalaba dos paquetes completamente distintos — ni siquiera la misma versión mayor.

2. **Dual package hazard (ESM vs CJS), incluso después de igualar versiones.** Una vez alineadas las versiones a `26.3.5`, pnpm seguía resolviendo dos "flavors" físicamente distintas del mismo paquete (`i18next@26.3.5_typescript@5.9.3` vs `i18next@26.3.5_typescript@6.0.3`), porque `i18next` declara `typescript` como **peer dependency opcional**, y `packages/localization` y `apps/mobile` tenían versiones de `typescript` distintas en sus propios `devDependencies`. Al igualar también `typescript`, ambos paquetes colapsaron al mismo directorio en el store de pnpm — pero **Metro seguía sirviendo dos archivos distintos dentro de ese mismo paquete**: `dist/esm/i18next.js` para los imports ESM de `apps/mobile`, y `dist/cjs/i18next.js` para el `require()` CommonJS compilado de `@commitment/localization/dist/adapter.js`. Cada archivo define su propio estado de módulo (el singleton interno de i18next), así que aunque "es la misma versión del mismo paquete", en tiempo de ejecución eran **dos instancias completamente distintas** — una inicializada (la que usa `apps/mobile`), otra que nunca recibía `.init()` (`isInitialized: undefined`, confirmado con logging directo en el punto de llamada).

Ninguno de los dos empates de versión, por sí solo, resolvía el problema. Se necesitaron los tres cambios juntos.

---

## Decisión

1. **`i18next` se declara como `peerDependency` en `@commitment/localization`**, no como `dependency` directa. Una librería compartida que depende de un singleton global (Context/DI-less) no debe traer su propia copia del singleton — debe usar la que provee la aplicación anfitriona. Esta es la razón arquitectónica de fondo, más allá de este incidente puntual: previene la reaparición del problema si las versiones vuelven a divergir en el futuro.

2. **`i18next` se agrega a `pnpm.overrides` en el `package.json` raíz**, fijado a `^26.3.5`, para que todo el workspace resuelva la misma versión mayor por defecto (mismo patrón ya usado para `@tamagui/core`/`tamagui`).

3. **`packages/localization` alinea su `typescript` devDependency** (`^5.4.3` → `~6.0.3`) para eliminar la divergencia de contexto de peer dependency que causaba que pnpm generara dos "flavors" del mismo `i18next@26.3.5`.

4. **`apps/mobile/metro.config.js` gana un resolver explícito** que:
   - Redirige cualquier request a `i18next` cuyo resolver por defecto apunte a `dist/cjs/` hacia el equivalente en `dist/esm/`, garantizando que TODO el bundle use el mismo archivo físico (y por tanto el mismo singleton), independientemente de si el código que lo importa es ESM o CJS compilado.
   - Resuelve cualquier módulo a su `realpath` (siguiendo symlinks de pnpm), como defensa adicional contra duplicación por symlinks divergentes para cualquier otra dependencia compartida.
   - Esto es necesario incluso después de (1)-(3) porque el problema del "dual package hazard" es intrínseco a cómo Metro resuelve packages que publican builds ESM y CJS separadas — no es exclusivo de pnpm ni de este monorepo.

---

## Regla para prevenir recurrencia

**Cualquier paquete interno del monorepo (`packages/*`) que consuma una librería con estado de módulo global/singleton (i18next, y potencialmente otras) debe declararla como `peerDependency`, nunca como `dependency` directa — así la resolución de una única instancia queda garantizada por diseño, no por casualidad de versiones.**

Adicionalmente: ante cualquier síntoma de "texto/dato que debería estar pero no aparece, sin error en consola", **la duplicación de instancia de una librería con estado singleton es una hipótesis a verificar tan pronto como se descarte un error de key/traducción faltante** — es fácil confundir este síntoma con datos faltantes en el dominio.

---

## Segundo hallazgo relacionado: build de plataforma incorrecta para Tamagui

Durante la corrección de la pantalla Tasks (mismo sprint), abrir cualquier formulario con un
`<Select>` de Tamagui (`TaskForm.tsx`, y el preexistente `ControlledSelect.tsx` usado en
"Create Commitment") **crasheaba la app completa** con:

```
You're rendering a Tamagui <Adapt /> component without nesting it inside a parent that is able to adapt.
```

Este bug es **anterior a esta sesión** — el patrón `<Select><Adapt platform="touch">...` ya
existía en `ControlledSelect.tsx` sin que nadie lo hubiera ejercitado en un flujo verificado.

### Causa raíz

`apps/mobile/metro.config.js` fijaba `config.resolver.unstable_conditionNames = ['browser',
'require', 'react-native']` como una lista **estática, idéntica para cualquier plataforma** que
Metro estuviera empaquetando. Al bundlear para `platform=web`, esa lista seguía haciendo que
paquetes de Tamagui (`@tamagui/core`, `@tamagui/select`, `@tamagui/adapt`, `@tamagui/sheet`, …)
resolvieran a su build **`react-native` (`.native.js`)** en lugar del build **`browser`
(`.mjs`)** — confirmado inspeccionando directamente qué archivo resolvía Metro para cada paquete
en tiempo real. `<Select>` y `<Adapt>` terminaban usando builds de contexto interno
potencialmente distintos entre sí según el orden de resolución de cada import, y `<Adapt>` nunca
encontraba el contexto que `<Select>` había provisto.

### Decisión

Se elimina la lista estática `unstable_conditionNames` de `metro.config.js`, dejando que Expo
resuelva las condiciones de exports **por plataforma** (su comportamiento por defecto). Si en el
futuro se necesita una lista custom, **debe variar según el parámetro `platform` que Metro pasa a
`resolveRequest`** — nunca una lista fija compartida entre web y nativo.

### Regla adicional para prevenir recurrencia

**Nunca fijar `unstable_conditionNames` (u opciones equivalentes de resolución condicional) como
una lista estática en `metro.config.js` sin que dependa de la plataforma objetivo.** Cualquier
paquete que publique builds diferenciados por plataforma (`react-native` vs `browser`/`module`)
se romperá silenciosamente — o, como en este caso, con un error de runtime difícil de asociar a
la causa real — si la lista no varía por plataforma.

---

## Consecuencias

- **Positivas:** El patrón `i18nKey` del Design System (mandado por ADR-014) ahora funciona de forma confiable en toda la app. Se corrigen, como efecto colateral verificado, los títulos de sección faltantes en Insights y el saludo faltante en el Dashboard. `<Select>` (Tasks, Create Commitment) deja de crashear la app en web.
- **Riesgo aceptado:** El resolver de `metro.config.js` es una capa de compatibilidad específica de Metro/Expo. Si el bundler cambia (ej. una futura migración), este resolver debe revisarse — no es una solución "una vez y listo" a nivel de todo el ecosistema, es específica de cómo Metro resuelve packages ESM/CJS duales y builds por plataforma hoy.
- **Deuda evitada:** Sin el primer fix, cualquier funcionalidad nueva construida sobre componentes `i18nKey` del Design System heredaría silenciosamente el mismo bug. Sin el segundo, cualquier nuevo uso de `Select`/`Adapt`/componentes Tamagui con builds diferenciados por plataforma habría crasheado en web de la misma forma.
- **Ambos hallazgos comparten el mismo patrón de detección:** un síntoma silencioso o un crash que parece de "uso incorrecto del componente," cuya causa real está una capa más abajo, en cómo Metro resuelve el paquete — no en el código que lo consume.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS**
