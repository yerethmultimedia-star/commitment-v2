# Card

## Propósito

El contenedor elevado/agrupado base de toda la app — usado directamente y como base de composición
de `MetricCard`, `StatCard` y `SettingsSection`.

## Cuándo usarlo

- Cualquier agrupación visual de contenido que necesite separarse del fondo (elevación, borde, o
  ambos).
- Filas/listas interactivas (`clickable`) o seleccionables (`selectable`).

## Cuándo NO usarlo

- Si lo que necesitás es un contenedor de sección con título/subtítulo/acción — usar
  `SectionHeader`/`FormSection`/`SettingsSection`, que ya componen `Card` donde corresponde.
- Si necesitás mostrar una métrica — usar `MetricCard`/`StatCard` en vez de armar el layout a mano
  sobre `Card`.

## Ejemplos

```tsx
<Card variant="elevated"><Body>Contenido</Body></Card>
<Card variant="outlined" clickable onPress={openDetail}>...</Card>
<Card variant="flat" selectable selected={isSelected} onPress={toggle}>...</Card>
<Card loading>...</Card>
```

## Accesibilidad

- `accessibilityRole="button"` automático cuando `clickable`/`selectable` es `true`.
- `accessibilityState={{ disabled, selected, busy: loading }}` reflejando el estado real.
- `accessibilityLabelI18nKey`/`Params` para evitar que el Feature llame `t()` por su cuenta.

## Props públicas

```ts
interface CardProps extends YStackProps {
  // ⚠️ ver "Estado de auditoría" abajo
  variant?: 'elevated' | 'outlined' | 'flat'; // default 'elevated'
  selectable?: boolean;
  selected?: boolean;
  clickable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  focusable?: boolean; // default true
  onPress?: () => void;
  accessibilityLabelI18nKey?: string;
  accessibilityLabelI18nParams?: Record<string, any>;
  testID?: string;
}
```

## Estado de auditoría (2026-07-15) — leer antes de extender

Auditoría completa hecha antes de construir la familia de métricas encima de `Card`. **No se
encontró ningún defecto crítico** — los 3 variants renderizan correctamente, `selected` tiene
tratamiento visual propio y correcto, la interacción (`clickable`/hover/focus/press) funciona bien.

**Hallazgo abierto, registrado como `TECH_DEBT.md` Item 12 (TD-012), sin resolver todavía:**
`CardProps extends YStackProps` — cualquier caller puede pasar props de Tamagui crudas
(`padding="$7"`, `borderRadius="$9"`, `shadowOpacity={0.3}`) que compilan y pisan silenciosamente
los valores por defecto, porque el spread de props ocurre después de los defaults en el render. No
es un bug hoy; es una superficie de API no controlada que puede erosionar la consistencia visual a
medida que más Features la usan como escape hatch (así es como `MetricCard` logró su
`padding="$3"`, de hecho). Resolución propuesta (no implementada, esperando un segundo/tercer
consumidor real antes de decidir la forma final): reemplazar `extends YStackProps` por props
controladas explícitas (`padding` como enum, no token crudo; `header`/`footer`/`actions`; un
`contentProps` como escape hatch explícito solo si se justifica).

**Gaps menores, no bloqueantes:**

- Sin escala de elevación (`low`/`medium`/`high`) — `variant="elevated"` siempre da la misma
  intensidad de sombra.
- `loading` solo marca `disabled` + `accessibilityState.busy` — no hay tratamiento visual propio
  (sin skeleton, sin spinner).
- Sin color distintivo para el estado "presionado" — depende de la animación genérica de
  opacity/scale compartida con hover/focus.
- Sin prop `shape` (a diferencia de `Badge`/`StatusIndicator`) — probablemente correcto, dado que
  una Card casi nunca necesita ser "pill", pero es una asimetría a nombrar, no un olvido.
