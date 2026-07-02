# 🏛️ ADR-011: Flexibilidad de Tecnologías Preferidas en el Stack Tecnológico

**Estado:** Aprobado

---

## Contexto

En la Directiva Operativa de Commitment v2 se definió un stack de tecnología oficial que incluye herramientas como Drizzle ORM y NATS. Si bien es crucial mantener la homogeneidad del stack para la productividad del equipo y la simplicidad operacional, fijar las herramientas de forma irrevocable puede generar deuda técnica o impedir que el sistema evolucione eficientemente ante nuevos requisitos o descubrimientos durante la implementación.

## Decisión

Establecer que las tecnologías definidas en el stack oficial (especialmente **Drizzle ORM** para modelos de lectura y **NATS** para mensajería) tienen el estatus de **Tecnologías Preferidas** en lugar de ser irrevocables.

Cualquier cambio, sustitución o eliminación de una tecnología preferida deberá pasar por un proceso formal de propuesta de arquitectura mediante la redacción de un nuevo **Architecture Decision Record (ADR)** que justifique técnicamente el cambio, detallando:

1. Beneficios técnicos tangibles del reemplazo.
2. Impacto en los costos de infraestructura (AWS/Supabase).
3. Impacto en la complejidad de mantenimiento.
4. Esfuerzo de migración requerido.

## Justificación

- **Ventajas:**
  - Mantiene la estabilidad y coherencia arquitectónica inicial sin rigidizar el proyecto a largo plazo.
  - Permite a los ingenieros proponer mejores alternativas a medida que el sistema escala o cambian las condiciones de mercado/proveedores.
  - Fomenta una cultura de diseño racional basada en métricas y justificación técnica en lugar de dogmas tecnológicos.
- **Desventajas:**
  - Requiere un esfuerzo adicional de documentación (ADRs) al proponer cambios, lo cual es aceptable para resguardar la arquitectura del monorepo a largo plazo.

## Alternativas Rechazadas

1. **Fijar tecnologías de forma irrevocable:** Rechazada porque limita la adaptabilidad y puede provocar sobreingeniería o limitaciones severas si, por ejemplo, NATS o Drizzle presentan bugs bloqueantes o incompatibilidades futuras en nuestro ecosistema.
2. **Permitir cambios libres sin justificación:** Rechazada porque generaría fragmentación en la base de código y pérdida del consenso del equipo senior de arquitectura.

---

🔒 **DOCUMENTO CONGELADO OFICIALMENTE — ARCHITECTURE DECISION RECORDS (v1.0)**
