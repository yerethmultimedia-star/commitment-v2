# EmptyState

## Propósito

Ilustración/ícono + título + descripción opcional + acción opcional — para estados de "no hay nada
acá todavía" (sin Goals, sin Habits para hoy, sin resultados de búsqueda).

## Cuándo usarlo

- Listas/pantallas vacías por falta de datos del usuario (no por error).

## Cuándo NO usarlo

- Si es por un error real (falla de red, request fallido) — usar `ErrorState`, que además de la
  distinción semántica correcta viene con el tono `danger` ya aplicado.

## Ejemplos

```tsx
<EmptyState title={{ i18nKey: 'goals:empty.title' }} description={{ i18nKey: 'goals:empty.description' }} />

<EmptyState
  illustration={<EmptyGoalsIllustration />}
  title={{ i18nKey: 'goals:empty.title' }}
  primaryAction={<Button i18nKey="goals:empty.cta" onPress={createGoal} />}
/>
```

## Accesibilidad

Heredada de `FeedbackState`.

## Props públicas

```ts
interface EmptyStateProps {
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  title?: FeedbackText;
  description?: FeedbackText;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  spacing?: 'compact' | 'default' | 'spacious';
  fullscreen?: boolean; // default true
  testID?: string;
  accessibilityLabelI18nKey?: string;
}
```

## Notas de implementación

- Este archivo **reemplaza** una implementación previa de `EmptyState.tsx` que vivía en el Design
  System pero no seguía sus propias convenciones (Tamagui `Text` crudo, sin `i18nKey`). Ver
  `TECH_DEBT.md` Item 13 para el historial completo, incluyendo el trío paralelo que todavía existe
  en `apps/mobile/src/shared/ui/feedback/` y sigue sin migrar (deliberadamente, hasta la fase de
  adopción de pantallas).
