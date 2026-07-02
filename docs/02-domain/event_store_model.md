# FASE 6.4 — MODELO DEL EVENT STORE (ARQUITECTURA DE PERSISTENCIA)
**Versión:** 2.0 (Definitiva y Documento Congelado con Refinamientos de Infraestructura)  
**Fecha:** Junio 2026  
**Estado:** Especificación Técnica de Persistencia de Eventos (Fase 6.4)  

---

## 🏛️ 1. DISEÑO DE STREAMS Y ARQUITECTURA GENERAL

El Event Store es la única fuente de verdad inmutable de Commitment. 

### A. Clasificación de Streams
Los Streams se estructuran utilizando un prefijo de agregado y el ID canónico (UUIDv7):
1.  **Stream de Compromiso:** `commitment-{CommitmentId}` (Almacena eventos de ciclo de vida, ejecución y objetivos).
2.  **Stream de Usuario:** `user-{UserId}` (Almacena eventos de valores, ritmo y contexto).
3.  **Stream de Biblioteca:** `library-{BibliotecaId}` (Almacena cápsulas y evidencias históricas).
4.  **Stream Social:** `social-{RedId}` (Almacena invitaciones y accesos de acompañamiento).

### B. Separación Arquitectónica: Event Store, Outbox y Event Bus
Para evitar que el Dominio contamine los canales de comunicación, se separa estrictamente la persistencia de la distribución:
```
[ DOMINIO ] ──► (Escribe) ──► [ EVENT STORE (Persistencia ACID) ]
                                    │
                                    ▼ (Outbox Worker lee transaccionalmente)
                               [ TRANSACTIONAL OUTBOX ]
                                    │
                                    ▼ (Publica asíncronamente)
                                [ EVENT BUS (Distribución) ] ──► [ PROYECCIONES ]
```
*   **Regla:** El dominio nunca publica directamente al Event Bus. Los eventos se guardan transaccionalmente en la misma base de datos (`Outbox Table`) y un worker de fondo (*Outbox Processor*) los extrae y distribuye de forma asíncrona pero garantizada (*At-Least-Once Delivery*).

---

## 📋 2. ESQUEMA DE TABLAS DEL EVENT STORE (MODELO LÓGICO)

El Event Store físico en PostgreSQL consta de dos tablas principales optimizadas para inserción rápida de apéndice puro (Append-Only):

### Tabla 1: `event_store` (El Ledger de Eventos)
*   `event_id`: `UUID` (Primary Key, UUIDv7).
*   `stream_id`: `VARCHAR(100)` (Indexado, ej. `commitment-018f6b...`).
*   `aggregate_type`: `VARCHAR(50)` (Indexado, ej. `Commitment`).
*   `aggregate_version`: `INT` (Indexado. Controla la secuencia numérica dentro de ese stream).
*   `event_type`: `VARCHAR(100)` (ej. `commitment.execution.microaction_executed`).
*   `payload`: `JSONB` (Payload del evento, cifrado en reposo si es clasificado como sensible).
*   `metadata`: `JSONB` (Envelope común: correlationId, causationId, actorId, clientVersion, etc.).
*   `recorded_at`: `TIMESTAMP WITH TIME ZONE` (Establecido por servidor, indexado).

> **Restricción Inviolable de Clave Única (Unique Constraint):**  
> `UNIQUE (stream_id, aggregate_version)`  
> Esto garantiza de forma matemática que no puedan existir dos eventos con la misma versión en la misma corriente (bloqueo optimista).

### Tabla 2: `snapshots` (Modelos de Lectura Acelerada)
*   `stream_id`: `VARCHAR(100)` (Primary Key).
*   `aggregate_version`: `INT` (Versión en la que se tomó el snapshot).
*   `state`: `JSONB` (Estado serializado completo del agregado reconstruido).
*   `updated_at`: `TIMESTAMP WITH TIME ZONE`.

---

## 🔄 3. ESTRATEGIA DE HIDRATACIÓN Y SNAPSHOTTING DINÁMICO

Para reconstruir el estado de un agregado en memoria, el Persistence Adapter aplica el siguiente algoritmo:

### Reglas de Snapshotting Dinámico:
Se generará un snapshot en la Tabla 2 si se cumple **al menos uno** de los siguientes tres criterios de rendimiento:
1.  **Criterio de Cantidad:** El Stream acumula **50 eventos nuevos** sin snapshot.
2.  **Criterio de Latencia:** El tiempo medio de hidratación en memoria supera los **150 ms**.
3.  **Criterio de Volumen:** El payload acumulado de eventos sin snapshot en el stream supera los **250 KB**.

---

## 🔑 4. CONCURRENCIA OPTIMISTA, CIFRADO Y COMPRESIÓN

*   **Control de Concurrencia Optimista (OCC):** Resuelto mediante la restricción única `UNIQUE (stream_id, aggregate_version)`. Si ocurre un fallo de duplicación, el persistence adapter local y de Supabase rechazan la escritura, devolviendo un código de error de clave duplicada (`23505`) para iniciar el flujo de reconciliación en Flutter.
*   **Evolución y Rotación Criptográfica:**
    *   Los eventos sensibles se cifran mediante **AES-GCM-256**.
    *   Cada evento cifrado almacena en su metadata un `keyVersionId`.
    *   Se implementa una política de **Rotación Anual de Claves** gestionada por un KMS externo (Key Management Service). Los eventos históricos no se descifran al rotar; se descifran con su clave histórica correspondiente identificada por `keyVersionId`.
*   **Compresión de Eventos Antiguos:** PostgreSQL comprime nativamente JSONB mediante TOAST (pglz/lz4). Al archivar streams inactivos (Compromisos en estado `Archivado`), el sistema re-comprime el stream histórico a almacenamiento de lectura fría para reducir costes.

---

## 🏷️ 5. PARTICIOMENTO FÍSICO Y ARCHIVADO

Para soportar el crecimiento a diez años con millones de eventos:
*   **Particionado del Event Store:** La tabla `event_store` se particiona físicamente en PostgreSQL por **rango mensual de `recorded_at`** (`Partition by Range`). Esto optimiza los replays de periodos específicos y mantiene los índices de inserción pequeños.
*   **Política de Archivado:** Los streams asociados a compromisos `Archivados` o `CanceladosConscientes` que superen los 12 meses de antigüedad se marcan como *Cold Streams*. Sus eventos se mueven de forma transparente a tablas históricas de bajo coste de almacenamiento, dejando únicamente el snapshot final en la Tabla 2 para consultas rápidas.

---

## 📊 6. OBSERVABILIDAD DEL EVENT STORE (MÉTRICAS CORE)

SRE y operaciones monitorearán en tiempo real:
*   `hydration_latency_ms`: Tiempo empleado en reconstruir el agregado (SLA <300ms).
*   `append_latency_ms`: Latencia de inserción en la Tabla 1 (SLA <100ms).
*   `occ_conflicts_per_minute`: Frecuencia de colisiones multidispositivo.
*   `snapshot_hit_ratio`: Porcentaje de hidrataciones aceleradas por snapshot (Meta >90%).
*   `stream_length`: Cantidad de eventos promedio por stream.

---

## 🛡️ 7. CATÁLOGO DE FALLOS Y ESTRATEGIA DE RECUPERACIÓN

| Error Técnico del Event Store | Diagnóstico Silencioso | Estrategia de Recuperación |
| :--- | :--- | :--- |
| **OCC Conflict (`23505`)** | Escritura concurrente rechazada. | **Recuperación Automática:** Flutter re-hidrata el agregado localmente con los eventos del servidor, resuelve el conflicto en local y re-intenta la inserción. |
| **Snapshot Corrupto** | Error al deserializar JSONB en Tabla 2. | **Recuperación Automática:** Se elimina el snapshot dañado y se reconstruye el agregado desde cero aplicando el 100% de los eventos del Stream. |
| **Error de Upcasting** | Payload de evento antiguo incompatible. | **Recuperación Asistida/Sistema:** El traductor del *Persistence Adapter* intercepta el evento e inyecta los valores por defecto del nuevo contrato. |

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — EVENT STORE MODEL v2.0**
