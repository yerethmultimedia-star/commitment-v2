# FormSection

## Propósito

Un grupo de campos de formulario bajo una etiqueta chica opcional — el cuerpo se renderiza como un
stack vertical plano (sin `Card`, sin dividers), igual a como `CommitmentForm`/`HabitForm` ya
organizan sus campos hoy. Miembro de la familia Layout Primitives.

## Cuándo usarlo

- Agrupar campos relacionados dentro de un formulario más largo (ej. "Detalles del compromiso").

## Cuándo NO usarlo

- Filas tocables/informativas tipo lista (Preferencias, Notificaciones) — usar `SettingsSection`,
  que envuelve en `Card` con dividers, el patrón correcto para eso.

## Ejemplos

```tsx
<FormSection title={{ i18nKey: 'commitments:form.sections.details' }}>
  <ControlledInput
    name="title"
    control={control}
    labelI18nKey="commitments:form.fields.title.label"
  />
  <ControlledInput
    name="description"
    control={control}
    labelI18nKey="commitments:form.fields.description.label"
    multiline
  />
</FormSection>
```

## Accesibilidad

Heredada de `SectionPrimitive`. Los campos hijos mantienen su propia accesibilidad individual
(labels, hints) — `FormSection` no la reemplaza, solo agrupa visualmente.

## Props públicas

```ts
interface FormSectionProps {
  title?: SectionText;
  subtitle?: SectionText;
  action?: React.ReactNode;
  spacing?: 'compact' | 'default' | 'spacious';
  children?: React.ReactNode;
  testID?: string;
  accessibilityLabelI18nKey?: string;
}
```

## Notas de implementación

- `size` no es un prop expuesto acá — `FormSection` siempre usa `size="section"` (etiqueta chica),
  consistente con el patrón ya establecido en los formularios existentes.
