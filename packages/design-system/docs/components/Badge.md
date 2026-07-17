# Badge

## Propósito

Comunica **importancia o categoría**: estado (`active`/`cancelled`), prioridad (`alta`/`media`/`baja`),
o una etiqueta corta no traducible (`v2.0.1`, `Beta`, `AI`). Siempre un pill con fondo — el peso
visual es intencional, indica "esto merece atención".

## Cuándo usarlo

- Prioridad/estado de un Commitment, Task, Goal.
- Etiquetas cortas de categoría (`Beta`, `Nuevo`, `Pro`).
- Cualquier texto corto que necesite destacarse visualmente del contenido alrededor.

## Cuándo NO usarlo

- Para comunicar un **estado en vivo** (online/offline/sincronizando) — usar `StatusIndicator`, que
  comunica estado, no importancia. Ver la nota en `StatusIndicator.md` para la distinción completa.
- Para un valor numérico/métrica — usar `MetricCard`/`StatCard`.
- Para texto largo — Badge asume una sola línea corta; no tiene wrap ni truncamiento propio.

## Ejemplos

```tsx
// Traducible — el dominio decide el tono, Badge solo renderiza
<Badge tone="success" i18nKey="commitments:status.active" i18nParams={{ ns: 'commitments' }} />

// No traducible — versiones, porcentajes, nombres de marca
<Badge label="v2.0.1" />
<Badge label="Beta" tone="accent" />

// Con ícono y variante outlined
<Badge label="AI" tone="accent" variant="outlined" iconEnd={<Sparkles size={12} />} />

// Tamaño y forma
<Badge label="84%" size="small" shape="rounded" />
```

**Inválido a propósito** (error de compilación): `<Badge i18nKey="x" label="y" />` — el contrato es
XOR, exactamente uno de los dos.

## Accesibilidad

- `accessibilityRole="text"` con `accessibilityLabel` — por defecto, el mismo texto visible.
- `accessibilityLabelI18nKey`/`accessibilityHintI18nKey` opcionales si el texto visible no alcanza
  como descripción para lectores de pantalla (ej. un ícono-only o un valor muy abreviado).

## Props públicas

```ts
type BadgeProps = (
  | { i18nKey: string; i18nParams?: Record<string, unknown>; label?: never }
  | { label: string; i18nKey?: never; i18nParams?: never }
) & {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'; // default 'neutral'
  variant?: 'filled' | 'outlined'; // default 'filled'
  size?: 'small' | 'medium' | 'large'; // default 'medium'
  shape?: 'pill' | 'rounded' | 'square'; // default 'pill'
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  accessibilityLabelI18nKey?: string;
  accessibilityHintI18nKey?: string;
  testID?: string;
};
```

## Notas de implementación

- `tone="neutral"` con `variant="filled"` siempre lleva borde — sin eso, el fondo `$surfaceRaised`
  puede fundirse con el de la tarjeta contenedora y leerse como texto plano (bug real encontrado y
  corregido en la prioridad "Baja" de Commitments, ver `TECH_DEBT.md` Item 9).
- `shape="rounded"`/`"square"` están en el contrato pero sin consumidor real todavía — congelados a
  propósito para cuando aparezca el segundo caso de uso (Calendar es el candidato más probable).
