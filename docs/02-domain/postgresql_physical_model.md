# FASE 6.6 — MODELO RELACIONAL POSTGRESQL (PHYSICAL DATABASE MODEL)
**Versión:** 2.0 (Definitiva y Documento Congelado con Estándares SQL)  
**Fecha:** Junio 2026  
**Estado:** Modelo Físico y Políticas de Seguridad de Base de Datos (Fase 6.6)  

---

## 🏛️ 1. CONVENCIONES DE NOMBRADO Y ESTRATEGIA DE UUIDv7

*   **Convenciones:** Nombres de tablas y columnas en minúsculas y serpiente (`snake_case`). Nombres de tablas en plural para tablas físicas relacionales (`users`, `commitments`) y en singular para el ledger (`event_store`, `snapshots`, `outbox`).
*   **UUIDv7 Strategy:** Todos los identificadores son de tipo `UUID` nativo de PostgreSQL. Su generación ocurre en la app cliente para permitir el funcionamiento local e inmediato (*Offline First*), o mediante funciones SQL si se ejecutan en el servidor.

---

## 📋 2. ESQUEMA DE TABLAS FÍSICAS (DDL LÓGICO)

### A. CAPA WRITE SIDE (Event Sourcing & Outbox)

#### Tabla: `event_store`
```sql
CREATE TABLE event_store (
    event_id UUID NOT NULL,
    stream_id VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_version INT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload BYTEA NOT NULL, -- Cifrado simétrico AES-GCM-256 en reposo
    metadata JSONB NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_event_store PRIMARY KEY (event_id, recorded_at),
    CONSTRAINT uq_stream_version UNIQUE (stream_id, aggregate_version)
) PARTITION BY RANGE (recorded_at);
```

#### Tabla: `snapshots`
```sql
CREATE TABLE snapshots (
    stream_id VARCHAR(100) NOT NULL,
    aggregate_version INT NOT NULL,
    state JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT pk_snapshots PRIMARY KEY (stream_id)
);
```

#### Tabla: `outbox`
```sql
CREATE TABLE outbox (
    outbox_id UUID PRIMARY KEY,
    event_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL, -- PENDING, PROCESSED, FAILED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_outbox_status CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED'))
);
```

---

## 🗂️ 3. ESTRATEGIA DE ÍNDICES COMPLETA (MÁXIMO RENDIMIENTO)

Para acelerar la hidratación de agregados, replays e indexación del bus de eventos:
*   `uq_stream_version` (B-Tree en `event_store`): Único compuesto `(stream_id, aggregate_version)`. Bloqueo optimista nativo.
*   `idx_event_type_recorded` (B-Tree en `event_store`): Compuesto `(event_type, recorded_at DESC)` para replays rápidos por tipo de evento.
*   `idx_aggregate_recorded` (B-Tree en `event_store`): Compuesto `(aggregate_type, recorded_at DESC)`.
*   `idx_outbox_pending` (B-Tree parcial en `outbox`): `CREATE INDEX idx_outbox_pending ON outbox (created_at) WHERE status = 'PENDING';` (Optimiza el escaneo de eventos por procesar).
*   `idx_correlation_id` (B-Tree en `event_store`): Expresión indexada sobre metadata `CREATE INDEX idx_correlation_id ON event_store ((metadata->>'correlationId'));` (Crucial para auditoría y observabilidad).

---

## 📅 4. ESTRATEGIA DE PARTISIONES Y CICLO DE VIDA

*   **Particionado Automático:** Se utilizará la extensión **`pg_partman`** de PostgreSQL para automatizar la creación de particiones mensuales futuras 2 meses antes de su inicio.
*   **Archivado de Datos Fríos:** Las particiones de `event_store` que superen los 12 meses de antigüedad se desvinculan y se exportan a un almacenamiento frío (Cold Storage comprimido lz4) en réplicas históricas de bajo coste. Las consultas corrientes de la app solo tocan las últimas 3 particiones activas en disco.

---

## 🔒 5. CLASIFICACIÓN FORMAL DE DATOS (SEGURIDAD Y RLS)

Establecemos la sensibilidad de almacenamiento por columna:

| Tabla | Columna | Clasificación | Política de Almacenamiento |
| :--- | :--- | :--- | :--- |
| `event_store` | `payload` | `Sensitive / Highly Sensitive` | **Cifrada simétricamente** AES-GCM-256 en cliente. |
| `event_store` | `metadata` | `Confidential` | Texto plano JSONB sensible a RLS. |
| `presente_view`| `identity_anchor`| `Sensitive` | Cifrado a nivel de fila. |
| `presente_view`| `description` | `Internal` | Texto plano local. |

---

## 🛡️ 6. ROW LEVEL SECURITY (RLS) Y ROLES EN SUPABASE

```sql
ALTER TABLE presente_view ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_presente ON presente_view
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY service_all_presente ON presente_view
    FOR ALL TO service_role USING (true) WITH CHECK (true);
```

---

## 💾 7. RESPALDO, RECUPERACIÓN Y MIGRACIONES

*   **Backup (RPO & RTO):**
    *   *RPO (Recovery Point Objective):* **10 minutos** (Garantizado mediante replicación en tiempo real y backups automatizados por Supabase).
    *   *RTO (Recovery Time Objective):* **2 horas** en caso de fallo crítico de infraestructura en la nube.
*   **Políticas de Migración de Esquemas:**
    *   *Forward-Only:* Las migraciones SQL nunca alteran ni eliminan eventos históricos en `event_store`.
    *   *Blue-Green Migrations:* Los cambios en la estructura de los Read Models se realizan instanciando nuevas tablas (`presente_view_v2`) y aplicando Replays en background antes de cambiar la ruta de lectura de la API.

---

## 🔍 APARTADOS DE PRODUCT DISCOVERY (OBLIGATORIOS)

### 1. ⚠️ Riesgos (¿Qué puede salir mal?)
*   **Riesgo de Inyección SQL en Políticas RLS:** Que un error en la formulación de una política RLS permita a un usuario autenticado consultar datos de otro. *(Mitigación: Los tests de QA utilizarán tokens de usuario falsificados para verificar activamente que la base de datos devuelve vacío en consultas de RLS cruzadas).*

### 2. 💡 Hipótesis (¿Qué estamos asumiendo sin validar?)
*   *Hipótesis 1:* Asumimos que el RLS nativo de Supabase/PostgreSQL añade menos de 5 ms de overhead a las consultas de proyecciones del cliente.

---

## 📋 CHECKLIST DE INGENIERÍA (CONTRATO DE ARQUITECTURA)

*   **¿Es independiente del proveedor tecnológico?** Sí. Utiliza DDL SQL estándar compatible con cualquier sabor de PostgreSQL independiente de Supabase.
*   **¿Soporta offline?** Sí. Los esquemas de proyecciones (`presente_view`, `library_view`) se crean idénticamente en la base local SQLite del móvil.

---
🔒 **DOCUMENTO CONGELADO OFICIALMENTE — PHYSICAL DATABASE MODEL v2.0**
