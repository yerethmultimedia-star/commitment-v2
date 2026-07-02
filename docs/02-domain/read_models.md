# FASE 6.5 — READ MODELS Y PROYECCIONES DE LECTURA (CQRS READ SIDE)
**Versión:** 2.0 (Definitiva y Documento Congelado con Estándares CQRS)  
**Fecha:** Junio 2026  
**Estado:** Especificación Técnica de Modelos de Lectura y Proyecciones (Fase 6.5)  

---

## 🏗️ 1. CATÁLOGO COMPLETO DE READ MODELS (MODELOS DE LECTURA)

En Commitment separamos estrictamente la escritura de eventos de las consultas de interfaz (**CQRS**). La UI nunca lee directamente del *Event Store*; lee de proyecciones optimizadas para consulta rápida (Read Models) alimentadas por el Event Bus.

### 📜 PRINCIPIO DE INDEPENDENCIA ABSOLUTA DE PROYECCIONES
> **Ninguna proyección de lectura puede consultar otra proyección. Todas las proyecciones son completamente independientes y se derivan única y exclusivamente a partir del procesamiento directo de eventos de dominio emitidos.**

| Read Model (Vista) | Proyector Responsable (Owner) | Projection Version | Eventos Consumidos |
| :--- | :--- | :--- | :--- |
| **`PresenteView`** | `ExecutionProjector` | `v1` | `MicroaccionProgramada`, `MicroaccionEjecutada`, `MicroaccionPostergada`, `RescateResilienteAceptado`. |
| **`CommitmentSummaryView`**| `CommitmentProjector` | `v1` | `CompromisoConcebido`, `PactoActivado`, `CompromisoCompletado`, `PausaConscienteDeclarada`. |
| **`LibraryView`** | `LibraryProjector` | `v1` | `ReflexionRegistrada`, `CapsulaInmortalizada`. |
| **`InsightsView`** | `AnalyticsProjector` | `v1` | `VictoriaDeRegresoRegistrada`, `FriccionDetectada`, `RitmoRe-calculado`. |

---

## 📝 2. ESPECIFICACIÓN DE READ MODELS Y CACHÉ

### 📍 1. `PresenteView` (Espacio de Enfoque Diario)
*   **Responsabilidad:** Proveer la vista ultra-limpia de hoy (microacciones activas y ancla de identidad).
*   **Consistencia Requerida:** `Inmediata (Optimista)` en local. `Eventual` (<500ms) en la nube.
*   **SLA de Actualización:** <500 ms tras el check-in.
*   **Caché & Invalidation Policy:**
    *   *Tipo:* Caché local en memoria de Flutter (State Management) respaldado por SQLite local.
    *   *Estrategia:* Push (Actualización proactiva en tiempo real al aplicar comandos locales).
    *   *TTL:* Sin tiempo de expiración (invalidadas explícitamente por eventos locales).
*   **Optimización e Índices:** Indexado compuesto por `(user_id, date_effective, status)`.

### 📍 2. `LibraryView` (Museo de Sabiduría y Legado)
*   **Responsabilidad:** Mostrar reflexiones y evidencias de resiliencia históricas.
*   **Consistencia Requerida:** `Eventual` (<2 segundos).
*   **Caché & Invalidation Policy:**
    *   *Tipo:* Caché de base de datos local y Redis en el Backend.
    *   *Estrategia:* Pull (Consulta bajo demanda al entrar a la sección).
    *   *TTL:* 10 minutos para consultas pesadas. Invalidadas de forma reactiva al emitir `CapsulaInmortalizada`.

---

## 🔄 3. RECONSTRUCCIÓN INCREMENTAL Y REPLAY DE EVENTOS

Soportamos dos estrategias de regeneración de Read Models ante cambios de esquema o corrupción:

### A. Full Replay (Reconstrucción Completa)
*   **Uso:** Cuando hay cambios estructurales mayores de base de datos o migración de versión (`v1` a `v2`).
*   **Método:** Blue-Green Projections. Se leen todos los eventos de la partición histórica en segundo plano y se escribe en la nueva tabla antes de cambiar el alias.

### B. Incremental Replay (Checkpoint Rebuild)
*   **Uso:** Recuperación rápida por caída del proyector o sincronización offline.
*   **Método:** Cada proyector registra su último `LastProcessedEventId` (UUIDv7 ordenable) en una tabla de checkpoints. Al reiniciarse, el proyector lee del Event Store únicamente los eventos cuyo `eventId` sea superior al checkpoint guardado, evitando procesar millones de eventos redundantes.

---

## 📊 4. OBSERVABILIDAD DE PROYECCIONES

Métricas claves a monitorear por operaciones:
*   `projection_lag_ms`: Latencia entre la grabación del evento (`recordedAt`) y su proyección en la vista (SLA <500ms).
*   `projection_failures_total`: Contador de errores al procesar eventos en el proyector.
*   `rebuild_duration_seconds`: Tiempo consumido en un replay completo.
*   `rebuild_progress_percent`: Porcentaje de avance en replays activos.
*   `queue_depth`: Cantidad de eventos encolados en el Event Bus esperando proyección.

---

## 🔍 APARTADOS DE PRODUCT DISCOVERY (OBLIGATORIOS)

### 1. ⚠️ Riesgos (¿Qué puede salir mal?)
*   **Riesgo de Desincronización Temporal (Lag de Proyección):** Que tras presionar check-in, la UI muestre la tarea completada pero al navegar atrás la vista del tablero muestre que sigue activa por unos milisegundos de latencia. *(Mitigación: Utilizar "Optimistic Updates" en el frontend: la interfaz asume el éxito de la escritura de inmediato).*

### 2. 💡 Hipótesis (¿Qué estamos asumiendo sin validar?)
*   *Hipótesis 1:* Asumimos que los índices relacionales compuestos definidos en PostgreSQL son suficientes para mantener las consultas a `PresenteView` por debajo de 50 ms para un usuario promedio.

---

## 📋 CHECKLIST DE INGENIERÍA (CONTRATO DE ARQUITECTURA)

*   **¿Soporta offline?** Sí. Mediante réplica SQLite local con políticas de actualización optimista.
*   **¿Es compatible con Event Sourcing?** Sí. Las proyecciones son reconstruibles al 100% en cualquier momento a partir de la Tabla 1 del Event Store.

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — READ MODELS & PROJECTIONS v2.0**
