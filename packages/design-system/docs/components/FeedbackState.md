# FeedbackState

## Propósito

La implementación compartida detrás de `LoadingState`, `EmptyState` y `ErrorState` — mismo slot de
ícono/ilustración, mismo título/descripción, mismo renglón de acción primaria/secundaria, mismo
spacing, misma accesibilidad. Cada uno de los tres solo especializa comportamiento (un spinner por
defecto para Loading, tono `danger` para Error) encima de esto — misma forma "una base, wrappers
de comportamiento chicos" que `SectionPrimitive`.

## Cuándo usarlo

- Directamente: casi nunca — es la base interna de la familia. Preferir `LoadingState`/
  `EmptyState`/`ErrorState` según el caso.
- Como base para un cuarto miembro de la familia (ej. un futuro `SuccessState`), si aparece un caso
  que ninguno de los tres cubre — explícitamente no construido todavía por falta de uso real.

## Cuándo NO usarlo

- Si uno de los 3 wrappers ya cubre el caso.

## Ejemplos

```tsx
<FeedbackState title={{ text: 'Nada por acá todavía' }} illustration={<EmptyIllustration />} />
<FeedbackState title={{ i18nKey: 'errors:generic' }} tone="danger" primaryAction={<Button i18nKey="common:retry" onPress={retry} />} />
<FeedbackState icon={<Spinner />} fullscreen />
```

## Accesibilidad

- El contenedor es `accessible` con `accessibilityLabel` resuelto del título por defecto, o de
  `accessibilityLabelI18nKey` si se pasa explícitamente.

## Props públicas

```ts
type FeedbackText = { i18nKey: string; i18nParams?: Record<string, unknown> } | { text: string };

interface FeedbackStateProps {
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  title?: FeedbackText;
  description?: FeedbackText;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  tone?: 'neutral' | 'danger'; // default 'neutral' — colorea el título
  spacing?: 'compact' | 'default' | 'spacious'; // default 'default'
  fullscreen?: boolean; // default false — centra y llena el espacio disponible cuando es true
  testID?: string;
  accessibilityLabelI18nKey?: string;
}
```
