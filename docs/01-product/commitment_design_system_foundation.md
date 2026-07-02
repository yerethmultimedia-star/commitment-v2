# COMMITMENT DESIGN SYSTEM FOUNDATION (TOKENS & ARCHITECTURE)

**Versión:** 1.0 (Definitiva y Documento Congelado)  
**Estado:** Puente Técnico Maestro entre la Filosofía UX y la Implementación Frontend / Flutter

---

## 🎨 1. COLOR TOKENS (PALETA CALMA Y DESATURADA)

Queda estrictamente prohibido el uso de colores saturados o rojos de alarma.

- **`color.surface.primary`:** Negro puro (`#000000`) o Blanco cálido (`#F9F9F8`). Espacio de respiro.
- **`color.surface.secondary`:** Gris piedra profundo (`#121212`) o Gris lino (`#F0F0EE`).
- **`color.text.primary`:** Blanco tiza (`#E6E6E4`) o Carbón suave (`#1A1A1A`). Contraste calmo.
- **`color.text.secondary`:** Gris ceniza (`#999996`) o Gris humo (`#666663`).
- **`color.accent.resilience`:** Verde bosque profundo (`#1B3B2B`) o Esmeralda apagado. Simboliza regrese y resiliencia.
- **`color.accent.pause`:** Ámbar cálido terroso (`#4A3B2C`). Simboliza recarga y descanso.

---

## 📏 2. SPACING & ELEVATION TOKENS (RESPIRACIÓN SPATIAL)

- **`spacing.xs`:** 4 pt/dp.
- **`spacing.s`:** 8 pt/dp.
- **`spacing.m`:** 16 pt/dp.
- **`spacing.l`:** 24 pt/dp.
- **`spacing.xl`:** 40 pt/dp (Respiro entre secciones).
- **`spacing.xxl`:** 64 pt/dp (Respiro de cabecera).
- **`elevation.none`:** 0 dp. Planitud absoluta para evitar ruido de sombras.
- **`elevation.subtle`:** 1 dp. Borde sutil de 1px con 10% opacidad en lugar de sombras proyectadas.

---

## 🔤 3. TYPOGRAPHY TOKENS (LECTURA CONTEMPLATIVA)

Tipografía limpia, humana y sobria (Inter / SF Pro / Roboto Flex).

- **`font.heading.identity`:** 28 pt, SemiBold, LineHeight 1.2. (Ancla de Identidad).
- **`font.heading.title`:** 22 pt, Medium, LineHeight 1.3. (Títulos de Compromiso).
- **`font.body.primary`:** 16 pt, Regular, LineHeight 1.5. (Microacciones y reflexiones).
- **`font.body.secondary`:** 14 pt, Regular, LineHeight 1.4. (Metadatos y contexto).
- **`font.caption`:** 12 pt, Medium, LineHeight 1.3, Tracking +0.5. (Etiquetas de estado).

---

## 🛠️ 4. SEMANTIC & COMPONENT STATE TOKENS

- **`state.commitment.draft`:** Estado `Borrador`. Opacidad 60%, estilo punteado.
- **`state.commitment.active`:** Estado `Activo`. Opacidad 100%, trazo continuo calmo.
- **`state.commitment.friction`:** Estado `EnFriccion`. Fondo cálido atenuado, sin notificaciones rojas.
- **`state.commitment.recovering`:** Estado `Recuperandose`. Destaque sutil con `color.accent.resilience`.
- **`state.commitment.paused`:** Estado `EnPausa`. Tono desaturado en reposo.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — DESIGN SYSTEM FOUNDATION v1.0**
