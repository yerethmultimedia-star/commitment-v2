---
id: TEMPLATE-SPECIFICATION
title: Technical Specification Template
status: Active
owner: Architecture Review Board
created: 2026-07-04
updated: 2026-07-04
version: 1.0.0
related_docs: []
related_adrs: []
description: Reusable template for defining functional and system technical specifications.
---

# TECHNICAL SPECIFICATION: [TITLE]

Author: [Author Name]
Date: [YYYY-MM-DD]
Status: [Draft/Under Review/Approved]
Related ADRs: [ADR-XXX]

---

## 📖 Background & Business Goal

Provide a clear description of the business value and context for this feature or platform change. What problem is this solving?

## 📋 Core Requirements

### Functional Requirements

- **FR1:** Description...
- **FR2:** Description...

### Non-Functional Requirements

- **NFR1:** Description...
- **NFR2:** Description...

## 🏛️ System & Domain Design

### Domain Boundaries (DDD)

- **Aggregates Affected/Created:** Specify aggregate root classes.
- **Value Objects / Entities:** Describe models.

### Event Sourcing & CQRS Catalog

- **Commands:** (e.g., `CreateCommitmentCommand`)
- **Events:** (e.g., `CommitmentCreatedEvent`)
- **Queries:** (e.g., `GetCommitmentByIdQuery`)

### Read Models & Database Schema

- **Local SQLite (Drift):** Describe table additions and migrations.
- **Supabase (PostgreSQL):** Describe physical tables, RLS policies.

### API Contracts

- **Endpoint Structure:** HTTP verb, route, payloads (Zod validation schemas).

## 🌐 Presentation & i18n

- **Presentation Layer Changes:** Affected Flutter screens/components.
- **Localization Keys Required:** List keys for English and Spanish.

## ❔ Open Questions

- Detail any unresolved design issues or feedback requested from the Founder or Architecture Review Board.
