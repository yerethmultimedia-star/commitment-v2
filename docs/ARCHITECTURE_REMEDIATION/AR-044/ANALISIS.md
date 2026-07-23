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

## Fase 2B — Alternativas

**Estado: ✅ Cerrada.** CSRF queda fuera de alcance (descartado en Fase 1 por el diseño Bearer-no-cookie
de AR-043). Quedan 3 hallazgos independientes: headers de seguridad ausentes, sin rate-limiting, CORS
sin acotar. La pregunta de decisión no es "¿debemos endurecer la seguridad?" sino **qué propiedades
mínimas debe garantizar la plataforma** — formulada así para no saltar directamente a nombrar
`helmet`/`@nestjs/throttler`/orígenes concretos, que son decisiones de Fase 4A, no de esta fase. Mismo
patrón exacto que D-043.1/D-054.1: congelar la propiedad arquitectónica primero, para que Fase 4A pueda
evaluar con libertad si la mejor implementación es `helmet`, otra librería, o capacidades nativas de
NestJS, sin tener que reabrir la decisión.

Para cada uno de los 3 hallazgos, la alternativa rechazada es la misma: definir la decisión directamente
en términos de una librería/configuración concreta (p. ej. "usar `helmet` con estas opciones", "límite
de 100 req/min", "permitir estos 3 dominios") en vez de como una propiedad que el sistema debe
garantizar, dejando el mecanismo concreto para después.

## Fase 3 — Decisión

**Estado: ✅ Decisión aprobada.**

**D-044.1 — Cabeceras de seguridad.** _"Toda petición HTTP servida por el backend debe incluir un
conjunto de cabeceras de seguridad mantenidas por la plataforma — no opcionales, no dependientes de cada
controlador, aplicadas globalmente."_ Sin congelar opciones específicas de `helmet` u otra librería —
eso es Fase 4A.

**D-044.2 — Rate limiting.** _"Toda API pública debe disponer de un mecanismo global de limitación de
peticiones, configurable sin modificar código de negocio."_ Deliberadamente sin un número concreto
(p. ej. "100 req/min") — eso es parametrización operativa, no una decisión arquitectónica, y puede
variar por entorno sin volver a esta AR.

**D-044.3 — CORS.** _"El backend no acepta orígenes arbitrarios; únicamente los explícitamente
autorizados mediante configuración."_ La lista concreta de orígenes pertenece al despliegue (desarrollo/
staging/producción), no a la arquitectura — sirve para los 3 sin recompilar al añadir un dominio.

**Explícitamente NO decidido en esta fase** (pertenece a Fase 4A/Diseño técnico o a configuración de
despliegue): dominios específicos, número de peticiones por minuto, opciones concretas de `helmet`,
excepciones para endpoints individuales.

---

## Fase 4A — Diseño técnico

**Estado: ✅ Cerrada.** Verificación técnica hecha antes de aceptar el diseño, no asumida:

- **`helmet`**: no instalado todavía (confirmado por grep en `package.json`); última versión publicada
  `8.3.0`, sin restricción de peer-dependency con NestJS (middleware Express puro) — compatible.
- **`@nestjs/throttler`**: no instalado todavía; última versión publicada `6.5.0`, con
  `peerDependencies` que aceptan `@nestjs/common`/`@nestjs/core` `^11.0.0` — coincide exactamente con
  las versiones ya instaladas en este proyecto (`^11.0.1`). Compatible.
- **Precedente interno para "guard/interceptor global" confirmado**: `app.module.ts:20-21,83` ya
  registra `MetricsInterceptor` vía `{ provide: APP_INTERCEPTOR, useClass: MetricsInterceptor }`. El
  patrón estándar de `@nestjs/throttler` (`{ provide: APP_GUARD, useClass: ThrottlerGuard }`) es
  exactamente la misma forma, ya usada en este archivo para otro cross-cutting concern — no introduce
  un patrón nuevo en el codebase.
- **`env.config.ts` ya usa un esquema Zod con `.default(...)` por variable** — confirma que
  `CORS_ALLOWED_ORIGINS` encaja sin fricción en el estilo ya establecido de configuración.

**Decisiones de materialización:**

| Decisión | Mecanismo                                                            | Alternativas descartadas y por qué                                                                                                 |
| -------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| D-044.1  | `helmet`, registrado globalmente en `main.ts`                        | Middleware propio — reimplementa una responsabilidad ya resuelta, aumenta superficie de mantenimiento sin ninguna ventaja.         |
| D-044.2  | `@nestjs/throttler`, registrado globalmente vía `APP_GUARD`          | Middleware manual — sin ventajas; Guard propio — reescribe código que el framework ya provee.                                      |
| D-044.3  | `app.enableCors(...)` en `main.ts`, orígenes leídos de configuración | Servicio/factory/módulo CORS dedicado — sin evidencia que justifique esa complejidad para una responsabilidad de una sola llamada. |

**Configuración:** nueva variable `CORS_ALLOWED_ORIGINS` (lista separada por comas), no `FRONTEND_URL` —
la propiedad congelada en D-044.3 habla de "orígenes autorizados" (plural, genérico), no de una única
aplicación; deja sitio para web/staging/localhost/herramientas administrativas futuras sin tocar código.

**Verificación de diseño pedida antes de cerrar la fase — ¿las tres protecciones viven en el punto más
alto posible del ciclo de vida de la aplicación?** Confirmado que sí, para las tres: `helmet` y
`enableCors()` se registran en `main.ts`'s `bootstrap()`, antes de `setGlobalPrefix` y de cualquier
registro de rutas — el punto más temprano posible del pipeline HTTP. `ThrottlerGuard` vía `APP_GUARD` se
aplica globalmente por el sistema de DI de Nest a todas las rutas, registrado una única vez en
`AppModule` — no por controlador. **Propiedad emergente confirmada, no una nueva decisión
arquitectónica, solo una consecuencia documentada del diseño elegido:** la seguridad HTTP transversal se
configura centralizadamente y no depende de ningún módulo funcional — ningún módulo futuro puede omitir
estas protecciones por descuido, porque ninguno las registra individualmente.

---

## Estado

**Fase 1, Fase 2B, Fase 3 y Fase 4A cerradas.** Diseño técnico congelado y verificado: `helmet` +
`@nestjs/throttler` (vía `APP_GUARD`, mismo patrón ya usado para `MetricsInterceptor`) +
`enableCors()` con `CORS_ALLOWED_ORIGINS` configurable. Ambas librerías confirmadas compatibles con las
versiones de NestJS ya instaladas. Pendiente: **Fase 4B (Implementación)** — instalar las 2
dependencias, registrar las 3 protecciones, y verificar cero regresión. Estado: se mantiene 🟦 En
análisis (no salta a 🟨 hasta Fase 4B). Decisión: ✅ Decisión aprobada.
