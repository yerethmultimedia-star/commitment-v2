# ErrorState

## Propósito

Mismo shell que `EmptyState`, especializado para errores: el título usa el tono `danger` por
defecto. El caso común (un botón de reintentar como `primaryAction`) es el uso esperado, aunque no
forzado — algunos errores genuinamente no son reintentables.

## Cuándo usarlo

- Falla de red, request fallido, cualquier estado de error real.

## Cuándo NO usarlo

- Falta de datos del usuario (no es un error) — usar `EmptyState`.

## Ejemplos

```tsx
<ErrorState
  title={{ i18nKey: 'commitments:workspace.error' }}
  primaryAction={<Button i18nKey="commitments:list.error.retry" onPress={refetch} />}
/>
```

## Accesibilidad

Heredada de `FeedbackState`.

## Props públicas

```ts
interface ErrorStateProps {
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

- Ver `EmptyState.md`/`TECH_DEBT.md` Item 13 — mismo historial de consolidación, mismo trío
  paralelo pendiente de migrar en `apps/mobile/src/shared/ui/feedback/`.
