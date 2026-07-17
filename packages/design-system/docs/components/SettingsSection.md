# SettingsSection

## Propósito

Un grupo de filas tocables/informativas bajo una etiqueta chica opcional, envueltas en una sola
`Card` con un divider auto-insertado entre cada hijo (sin divider antes del primero). Generaliza el
patrón "CUENTA"/"MI PLAN" ya existente en `profile.tsx`. Miembro de la familia Layout Primitives.

## Cuándo usarlo

- Listas de filas de configuración/cuenta (Preferencias, Notificaciones, etc.).
- Cualquier agrupación de 2+ filas relacionadas que deban verse como una sola tarjeta dividida.

## Cuándo NO usarlo

- Campos de formulario — usar `FormSection`, que no envuelve en `Card` ni agrega dividers (los
  campos ya tienen su propio espaciado vertical).
- Una sola fila sin agrupación — usar `Card` directamente, `SettingsSection` con un solo hijo no
  aporta nada sobre eso salvo el título opcional.

## Ejemplos

```tsx
<SettingsSection title={{ i18nKey: 'profile:account.title' }}>
  <SettingsRow
    icon={<SlidersHorizontal />}
    label={t('profile.account.preferences')}
    onPress={openPreferences}
  />
  <SettingsRow
    icon={<Bell />}
    label={t('profile.account.notifications')}
    onPress={requestNotifications}
  />
</SettingsSection>
```

## Accesibilidad

Heredada de `SectionPrimitive`. Cada fila hija mantiene su propia `accessibilityRole`/
`accessibilityLabel` — `SettingsSection` no la reemplaza, solo aporta el shell + dividers.

## Props públicas

```ts
interface SettingsSectionProps {
  title?: SectionText;
  subtitle?: SectionText;
  action?: React.ReactNode;
  spacing?: 'compact' | 'default' | 'spacious';
  children?: React.ReactNode; // cada hijo directo se convierte en una fila dividida
  testID?: string;
  accessibilityLabelI18nKey?: string;
}
```

## Notas de implementación

- Los dividers se insertan con `React.Children.toArray(children)`, envolviendo cada hijo en un
  `YStack` con `borderTopWidth`/`borderTopColor` — el primer hijo nunca lleva borde superior.
- `size` no es un prop expuesto acá — siempre `size="section"`, igual que `FormSection`.
