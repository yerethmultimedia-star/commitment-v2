# AR-044 — Cero middleware de seguridad + CORS completamente abierto

---

## Fase 1 — Evidencia

**Estado: ✅ Cerrada.**

### Pregunta de framing que gobierna esta fase

> **¿El hallazgo de la auditoría original (Iteración 6, Fase 2) sigue siendo real hoy, después de que AR-043 introdujera Authentication? ¿Cambia AR-043 la severidad real de este hallazgo?**

### 1. Reproducción determinista

Verificado directamente en el código real, no asumido desde el informe de auditoría:

- `apps/backend/src/main.ts:17` — `app.enableCors();` llamado sin ninguna opción. Confirmado que esto
  es una política de CORS completamente abierta (cualquier origen) por defecto de NestJS/Express cuando
  no se configura explícitamente.
- `apps/backend/package.json` — **cero** dependencias de `helmet`, `@nestjs/throttler`, o cualquier
  paquete de rate-limiting. Verificado por grep exhaustivo en `package.json` y en todo `src/`.
- Ningún archivo del backend registra manualmente cabeceras de seguridad equivalentes
  (`X-Frame-Options`, `X-Content-Type-Options`, etc.) — confirmado por grep, cero coincidencias.

**El hallazgo original (`docs/ARCHITECTURE_REVIEW/fase-2-plataforma/06-backend.md`, Iteración 6) sigue
siendo exacto, palabra por palabra, hoy.**

### 2. Línea temporal

| Fecha            | Commit                                                                               | Evento                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 2026-07-02       | `8900fee`                                                                            | `main.ts` creado con `app.enableCors()` sin opciones — día 1 del proyecto.                                           |
| 2026-07-02 → hoy | `57ef7e0` (único commit posterior sobre `main.ts`, fix de lint/build no relacionado) | El hallazgo no ha cambiado ni una vez desde el commit inicial — no es una regresión, es una ausencia nunca resuelta. |

### 3. ¿Cambia AR-043 la severidad real de este hallazgo?

**Verificado, no asumido: el mecanismo de sesión de AR-043 es Bearer token vía cabecera
`Authorization`, no cookies** (`session-auth.guard.ts:62`, `if (scheme !== 'Bearer' || !value)`). Esto
importa para no sobrestimar el riesgo:

- **No habilita CSRF clásico** — un CSRF tradicional depende de que el navegador adjunte
  automáticamente una cookie de sesión; aquí no hay cookie que un sitio malicioso pueda hacer que el
  navegador envíe sin que su propio JavaScript tenga ya el token.
- **Pero el resto del hallazgo original es completamente independiente de la autenticación** y sigue
  aplicando sin cambios: (a) ausencia total de cabeceras de seguridad (`helmet`) — clickjacking,
  MIME-sniffing, y otros vectores que no dependen de si existe sesión o no; (b) ausencia de
  rate-limiting — sin `@nestjs/throttler`, los endpoints públicos (`POST /v1/authentication/login`,
  `register`) no tienen ningún límite de intentos, y CORS abierto permite que cualquier origen ejecute
  peticiones no autenticadas contra la API pública sin restricción.

### Respuesta a la pregunta de framing

> **El hallazgo sigue siendo real y de Impacto Alto, sin cambios desde el día 1 del proyecto. AR-043
> reduce parcialmente su severidad (descarta CSRF clásico por el diseño Bearer-no-cookie) pero no lo
> resuelve — el resto del hallazgo (headers de seguridad ausentes, sin rate-limiting, CORS sin acotar)
> es ortogonal a la autenticación y sigue intacto.** No es un falso positivo ni un hallazgo colateral de
> otra AR — es exactamente lo que la auditoría describió, todavía sin remediar.

**Consecuencia para el alcance de AR-044:** hay un defecto real, ya bien delimitado por la auditoría
original (Recomendación #3, Iteración 6): introducir `helmet`, un rate-limiter básico, y acotar CORS a
orígenes conocidos. Pendiente: Alternativas/Decisión (¿qué configuración concreta de cada uno, y sobre
qué orígenes acotar CORS dado que hoy no existe todavía un cliente de producción desplegado?) — no
resueltas en esta fase.

---

## Estado

**Fase 1 cerrada.** Hallazgo confirmado vigente, sin cambios desde el día 1 del proyecto, con severidad
matizada (no CSRF clásico) pero no reducida en el resto de su alcance. Estado: ⬜ → 🟦 En análisis.
Decisión: N/A (ejecución directa, Owner Claude) — pendiente de definir en Fase 2B/3 los valores
concretos (orígenes permitidos, límites de rate-limiting).
