# Design System — Component Docs

Documentación técnica de los componentes fundacionales, no Storybook (evaluar esa integración más
adelante si la carga cognitiva lo justifica). Cada documento sigue el mismo formato: Propósito,
Cuándo usarlo, Cuándo NO usarlo, Ejemplos, Accesibilidad, Props públicas.

## Familia de tonos/estado

- [Badge](./Badge.md) — importancia/categoría (pill con fondo).
- [StatusIndicator](./StatusIndicator.md) — estado en vivo (punto + texto).

## Familia de métricas

- [MetricCard](./MetricCard.md) — conteo simple, sin tendencia.
- [StatCard](./StatCard.md) — métrica + tendencia + visual opcional.
- [ProgressMetric](./ProgressMetric.md) — valor como progreso hacia una meta (ring/bar).

## Contenedores

- [Card](./Card.md) — el contenedor base; ver "Estado de auditoría" antes de extenderla
  (`TECH_DEBT.md` Item 12).

## Familia de secciones (Layout Primitives)

- [SectionPrimitive](./SectionPrimitive.md) — base compartida, uso directo poco común.
- [SectionHeader](./SectionHeader.md) — header de pantalla completa.
- [FormSection](./FormSection.md) — grupo de campos de formulario.
- [SettingsSection](./SettingsSection.md) — grupo de filas tocables en una Card con dividers.

## Familia de feedback (Feedback Primitives)

- [FeedbackState](./FeedbackState.md) — base compartida, uso directo poco común.
- [LoadingState](./LoadingState.md) — spinner centrado + título/descripción opcional.
- [EmptyState](./EmptyState.md) — "no hay nada acá todavía" (ilustración/ícono + acción opcional).
- [ErrorState](./ErrorState.md) — igual que EmptyState, tono `danger` por defecto.

⚠️ **Deuda conocida:** `apps/mobile/src/shared/ui/feedback/{EmptyState,ErrorState,LoadingState}.tsx`
todavía existen como implementaciones paralelas, usadas por 9+ pantallas. No migrar esos call sites
todavía es una decisión — es trabajo de la fase de adopción sistemática, no de esta fase. Ver
`TECH_DEBT.md` Item 13.

## Platform Support

Este Design System es **React Native + React Native Web** — no framework-agnostic para React DOM
puro. Todo componente asume el entorno de Tamagui/React Native (incluso en el build web de
`apps/mobile`, que corre vía `react-native-web`, no un DOM tradicional). Verificado 2026-07-15: no
existe ningún paquete no-mobile (backend, domain, localization, theme-engine) que importe
`@commitment/design-system` — es exclusivamente consumido por `apps/mobile`. Si en el futuro se
necesita un consumidor React DOM puro (ej. un panel de administración web separado), este paquete
no es portable a eso tal cual está — no es una limitación accidental, es el trade-off consciente de
construir sobre Tamagui/React Native desde el principio.

## Política de contribución

**Ningún componente nuevo entra al Design System sin:**

1. Documentación (este formato, en `docs/components/`).
2. Tests unitarios cubriendo props/variantes/tonos/tamaños.
3. Snapshots (mínimo un tema; los componentes con lógica de color por tema llevan los 3).
4. Export público explícito desde `src/index.ts` (nunca solo interno/no exportado si se espera que
   Features lo consuman).
5. Al menos un ejemplo de uso real (código, no solo la firma de tipos).

Esta regla ya era la práctica de facto desde `Badge` en adelante — se formaliza acá para que no
dependa de que alguien la recuerde.

## Regla: nunca adaptar el Design System a una pantalla

Siempre es al revés. Si una pantalla necesita algo que ningún componente cubre, la primera
pregunta es _"¿esto realmente pertenece al Design System, o es específico de esta Feature?"_ — no
_"¿qué prop le agrego a `Card`?"_.

Si la respuesta es "específico de esta Feature": el componente vive en la Feature (ej.
`DashboardHeroCard` vive en `features/dashboard/`, no en el Design System), aunque internamente
componga primitivas del DS.

Si la respuesta es "esto se va a repetir": recién ahí es candidato a Design System — y sigue la
Política de contribución de arriba (con un segundo consumidor real, no antes).

**Lo que esta regla existe para evitar:** `Card`, `Card2`, `CardNew`, `CardCompact`,
`CardDashboard` — la deriva típica donde cada pantalla le agrega un prop a un componente
fundacional hasta que ese componente ya no representa ningún lenguaje visual consistente, solo la
unión de todos los casos especiales que alguna vez necesitó una pantalla.

## Convención compartida por toda la familia

Todo componente de texto (`Badge`, `StatusIndicator`, `MetricCard`, `StatCard`,
`SectionPrimitive`/derivados) usa el mismo contrato: **exactamente uno** de `i18nKey`/`label` (o
`i18nKey`/`text` en las secciones), nunca ambos, forzado por tipos. `ProgressMetric` es la única
excepción donde el texto es completamente opcional (puede no llevar ninguno). Ver Regla 2 de i18n
en `docs/03-architecture/adr_018_i18n_rule2_exceptions.md` para el porqué de esta disciplina.
