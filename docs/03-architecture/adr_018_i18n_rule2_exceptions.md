# 🏛️ ADR-018: Excepciones acotadas a la Regla 2 de i18n (UI declarativa)

**Estado:** Aprobado

---

## Contexto

La Regla 2 de `docs/ARCHITECTURE_OVERVIEW.md` §11 (mandada originalmente por ADR-013) establece:
_"Ninguna Feature usa `t()` directamente. Se provee la clave `i18nKey` a los componentes de
tipografía y botones del Design System."_

La auditoría de arquitectura y producto del 2026-07-15 (ver
`engineering/governance/architecture_product_audit_2026Q3.md`) encontró que el conteo original de
esta violación (`TECH_DEBT.md` Item 3) estaba subestimado — 26 archivos reportados, 64 reales,
por un patrón de `grep` que no capturaba `useTranslation('namespace')`. De esos 64, la gran
mayoría son violaciones genuinas, ya en proceso de migración a `i18nKey`. Pero dos categorías
**no son violaciones corregibles con el patrón declarativo actual** — son limitaciones
arquitectónicas reales, verificadas caso por caso, no una excusa genérica para seguir llamando
`t()` donde sea conveniente.

---

## Decisión

Se aprueban **dos excepciones acotadas**, y únicamente estas dos, a la Regla 2:

### Excepción 1 — Campos `options` de React Navigation leídos fuera del ciclo de render

`Stack.Screen options={{ title, headerBackTitle, tabBarLabel }}` (y equivalentes) son leídos por
React Navigation **fuera** del ciclo de render/reconciliación de React — no se renderizan como
children de un componente, se consumen como un objeto plano por la librería de navegación. Ningún
componente `i18nKey`-aware del Design System puede interceptar ese valor, porque nunca llega a
renderizarse como JSX.

**Evidencia de que la restricción es real, no conveniencia:** `options.headerRight` (una
_función_ que sí retorna JSX) ya funciona correctamente hoy con un `<Button i18nKey="..." />`
declarativo — confirmado en `CommitmentWorkspaceScreen.tsx`. Esto prueba que el problema es
específicamente los campos de **string plano** (`title`, `headerBackTitle`, `tabBarLabel`), no
`options` en general.

Archivos confirmados bajo esta excepción: `calendar.tsx`, `EditCommitmentScreen.tsx`,
`CommitmentWorkspaceScreen.tsx` (solo `headerBackTitle`), `TodayHabitsScreen.tsx`.

**Condición de la excepción:** el componente puede llamar `t()` para estos campos específicos
**siempre y cuando** obtenga `t` del hook reactivo `useTranslation()` (`const { t } =
useTranslation()`), nunca de un import imperativo (`import { t } from '@commitment/localization'`).
Esto es lo que garantiza que el valor se recalcule si el idioma cambia mientras el componente está
montado — la razón original detrás de la Regla 2 (ver ADR-017, que documentó exactamente esta
clase de bug: texto que no reacciona a cambios de idioma).

### Excepción 2 — `ThemePreviewCard.tsx`

Este componente renderiza una vista previa de un tema **distinto** al tema activo actualmente
(por diseño: el usuario necesita ver cómo se ve "Bosque" mientras tiene "Medianoche" activo). Usar
un componente del Design System dentro de esa preview reintroduciría el contexto de Tamagui
_ambiente_ (el tema activo), contaminando la preview con los tokens del tema equivocado — el
exacto bug que este componente fue construido para evitar, documentado en su propio comentario en
código antes de esta ADR.

Este caso es estructuralmente distinto al de Excepción 1 (no es sobre el ciclo de render de
React Navigation, es sobre aislamiento de contexto de tema) y se registra por separado para no
generalizar accidentalmente ambas excepciones en una sola regla más laxa.

---

## Regla para prevenir recurrencia

Ninguna otra excepción a la Regla 2 se considera válida por defecto. Para invocar esta ADR como
precedente, un caso nuevo debe demostrar **ambas** condiciones:

1. **La restricción es estructural, no de conveniencia** — el valor se consume fuera del ciclo de
   render de React (como Excepción 1), o existe una razón de aislamiento de contexto igualmente
   concreta (como Excepción 2). "Es más rápido escribir `t()` acá" nunca es una razón válida.
2. **Si aplica la Excepción 1** (lectura fuera del render cycle), el componente debe usar
   `useTranslation()` reactivo, nunca un import imperativo de `t`.

Cualquier caso que no demuestre ambas condiciones se trata como una violación pendiente de
`TECH_DEBT.md` Item 3, no como una excepción implícita.

---

## Consecuencias

- **Positivas:** `TECH_DEBT.md` Item 3 puede distinguir entre "violación pendiente de migrar" y
  "excepción arquitectónica aprobada" en vez de tratar los ~64 archivos como una masa homogénea.
  La Regla 2 general (declarative-only, prohibición de `t()` imperativo) queda intacta — esta ADR
  no la debilita, la acota con dos casos verificados.
- **Riesgo aceptado:** ninguno nuevo — ambas excepciones ya estaban en producción antes de esta
  ADR; lo que cambia es que ahora están documentadas y acotadas en vez de ser una violación
  silenciosa sin justificación registrada.
- **Deuda evitada:** sin esta ADR, un futuro intento de "corregir" estos archivos forzándolos a un
  patrón `i18nKey` que no pueden usar produciría código más frágil, no más limpio.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS**
