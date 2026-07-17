# LoadingState

## Propósito

Un spinner centrado, con título/descripción opcional (ej. "Cargando tus datos..."). Siempre
muestra un `Spinner` en el slot de ícono salvo que se pase un `icon` explícito — la única razón de
existir de `LoadingState` sobre `FeedbackState` a secas es no tener que acordarse de pasar el
spinner cada vez.

## Cuándo usarlo

- Cualquier pantalla/sección esperando datos (reemplaza al `LoadingState` de
  `apps/mobile/src/shared/ui/feedback/`, que no tenía soporte de título/descripción).

## Cuándo NO usarlo

- Loading inline dentro de un botón — usar `Button`'s propio prop `loading`, no este componente.
- Loading dentro de una `Card` — `Card` también tiene su propio prop `loading` (ver `TECH_DEBT.md`
  Item 12 sobre las limitaciones de ese prop hoy).

## Ejemplos

```tsx
<LoadingState /> {/* spinner solo, pantalla completa */}
<LoadingState title={{ i18nKey: 'commitments:loading' }} />
<LoadingState fullscreen={false} /> {/* inline, no ocupa toda la pantalla */}
```

## Accesibilidad

Heredada de `FeedbackState`.

## Props públicas

```ts
interface LoadingStateProps {
  icon?: React.ReactNode; // override del Spinner por defecto
  title?: FeedbackText;
  description?: FeedbackText;
  spacing?: 'compact' | 'default' | 'spacious';
  fullscreen?: boolean; // default true (a diferencia de FeedbackState, cuyo default es false)
  testID?: string;
  accessibilityLabelI18nKey?: string;
}
```
