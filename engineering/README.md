# Engineering Foundation Entry Point

Version: 1.0.0
Status: Active
Owner: Architecture Review Board
Last Updated: 2026-07-04

---

## 🎯 Purpose of `engineering/`

The `/engineering` directory contains the active operational infrastructure, playbooks, review templates, and tasks that govern the daily execution of the Commitment project. While the `/docs` folder serves as the long-term knowledge repository (product context, design system, physical DB designs), `/engineering` is the active engine room for developer workflows, checklists, and active tasks.

---

## 📂 Folder Structure & Purposes

- **`tasks/`:** Active, approved task specifications awaiting or undergoing implementation.
- **`reviews/`:** Completed architecture reviews, documenting alignment with design systems and principles.
- **`specifications/`:** Pre-implementation technical specifications detailing design changes, Zod contracts, and schemas.
- **`playbooks/`:** Practical guidelines detailing step-by-step developer tasks (e.g. feature development, release management).
- **`templates/`:** Standardized, reusable formats for tasks, reviews, and specifications.

---

## 🧭 Reading Order

For any developer (or AI assistant) beginning work in the repository, follow this reading order to initialize context:

1. [README.md (Root)](file:///Users/yereth/Desktop/Commitment-v2/README.md)
2. [PROJECT_STATUS.md (Root)](file:///Users/yereth/Desktop/Commitment-v2/PROJECT_STATUS.md)
3. [HANDBOOK.md (Root)](file:///Users/yereth/Desktop/Commitment-v2/HANDBOOK.md)
4. [engineering/system-prompt.md](file:///Users/yereth/Desktop/Commitment-v2/engineering/system-prompt.md)
5. [engineering/WORKFLOW.md](file:///Users/yereth/Desktop/Commitment-v2/engineering/WORKFLOW.md)
6. [engineering/ARCHITECTURE_CHECKLIST.md](file:///Users/yereth/Desktop/Commitment-v2/engineering/ARCHITECTURE_CHECKLIST.md)

---

## 🔄 Lifecycle Relationships

### Relation to `docs/`

- `/docs` contains the domain model specifications, product philosophy, and static documentation. `/engineering` acts on those rules. When domain logic is implemented, it refers to `/docs/02-domain/` catalogs, ensuring implementation matches specifications.

### Relation to ADRs (Architecture Decision Records)

- Technical architecture decisions are documented as ADRs in `/docs/03-architecture/` and registered in `DECISION_LOG.md`. The guidelines in `engineering/system-prompt.md` and `engineering/ARCHITECTURE_CHECKLIST.md` are updated to enforce compliance with these ADRs.

### Relation to Tasks and Reviews

- An engineering specification is written in `engineering/specifications/`.
- It is broken down into a concrete implementation task in `engineering/tasks/`.
- Once implemented, the code is evaluated against `engineering/ARCHITECTURE_CHECKLIST.md` and documented as an architecture review in `engineering/reviews/`.

---

## 📜 Change History

- **v1.0.0 (2026-07-04):** Initial creation of the Engineering Entry Point documentation.
