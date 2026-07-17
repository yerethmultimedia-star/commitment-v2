# SectionPrimitive

## Propósito

La implementación compartida detrás de `SectionHeader`, `FormSection` y `SettingsSection` — mismo
spacing, mismo renglón título/subtítulo/acción, mismo divider, misma accesibilidad. Solo el
**envoltorio del cuerpo** difiere por consumidor (sin cuerpo para `SectionHeader`, stack plano para
`FormSection`, `Card` con dividers para `SettingsSection`) — eso vive en cada consumidor, no acá,
para que este archivo se mantenga como una primitiva pura de header+spacing en vez de crecer un
switch de `variant` que recree el mismo problema de "un componente hace todo" que esta familia
existe para evitar.

## Cuándo usarlo

- Directamente: casi nunca — es la base interna de la familia. Preferir `SectionHeader`/
  `FormSection`/`SettingsSection` según el caso.
- Como base para un cuarto miembro de la familia, si aparece un caso que ninguno de los tres cubre.

## Cuándo NO usarlo

- Si uno de los 3 wrappers ya cubre el caso — usarlos directamente es más claro que reconstruir el
  mismo patrón a mano sobre `SectionPrimitive`.

## Ejemplos

```tsx
<SectionPrimitive title={{ text: 'CUENTA' }} />
<SectionPrimitive title={{ i18nKey: 'goals:title' }} subtitle={{ i18nKey: 'goals:subtitle' }} size="screen" action={<Button i18nKey="goals:new" />} />
<SectionPrimitive title={{ text: 'X' }} showDivider spacing="compact">{children}</SectionPrimitive>
```

## Accesibilidad

- El renglón de header (`título`+`acción`) es `accessible` con `accessibilityLabel` resuelto del
  título por defecto, o de `accessibilityLabelI18nKey` si se pasa explícitamente.

## Props públicas

```ts
type SectionText = { i18nKey: string; i18nParams?: Record<string, unknown> } | { text: string };

interface SectionPrimitiveProps {
  title?: SectionText;
  subtitle?: SectionText;
  action?: React.ReactNode;
  size?: 'section' | 'screen'; // default 'section' — uppercase chico vs. Title grande
  showDivider?: boolean; // default false
  spacing?: 'compact' | 'default' | 'spacious'; // default 'default'
  children?: React.ReactNode;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}
```
