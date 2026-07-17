# SectionHeader

## Propósito

Un renglón de título/subtítulo/acción independiente, sin cuerpo — para headers de pantalla completa
(ej. "Tus Objetivos" + subtítulo + botón "+" en Goals/Coach). Miembro de la familia Layout
Primitives (`SectionPrimitive` → `SectionHeader`/`FormSection`/`SettingsSection`).

## Cuándo usarlo

- El header de una pantalla completa (título grande + subtítulo + acción).
- Cualquier renglón título+acción que no necesita agrupar contenido debajo.

## Cuándo NO usarlo

- Una etiqueta chica de grupo sobre una card o lista de campos — usar `FormSection`/
  `SettingsSection`, que ya sirven size="section" por defecto.

## Ejemplos

```tsx
<SectionHeader title={{ i18nKey: 'goals:title' }} subtitle={{ i18nKey: 'goals:subtitle' }} />

<SectionHeader
  title={{ i18nKey: 'coach:title' }}
  action={<IconButton iconToken={<Plus />} onPress={openQuickCapture} tooltipI18nKey="coach:quickCapture" />}
/>

// Forzado al estilo chico si hace falta un header standalone no-screen-level
<SectionHeader title={{ text: 'Avanzado' }} size="section" />
```

## Accesibilidad

Heredada íntegramente de `SectionPrimitive` — ver `SectionPrimitive.md`.

## Props públicas

```ts
interface SectionHeaderProps {
  title?: SectionText;
  subtitle?: SectionText;
  action?: React.ReactNode;
  size?: 'section' | 'screen'; // default 'screen' (a diferencia de SectionPrimitive, cuyo default es 'section')
  testID?: string;
  accessibilityLabelI18nKey?: string;
}
```
