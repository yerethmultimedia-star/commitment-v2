import { demoCommitmentDTOs, replaceDemoCommitmentDTOs } from './demo-data';

/**
 * Demo-mode implementation of the same operations commitments.api.ts exposes
 * over the network. Mutates the in-memory demo dataset so create/transition
 * actions feel real during a demo session, without touching the backend.
 */
const STATE_TRANSITIONS: Record<string, string> = {
  activate: 'Active',
  pause: 'Paused',
  resume: 'Active',
  complete: 'Completed',
  cancel: 'Cancelled',
};

function findOrThrow(id: string) {
  const dto = demoCommitmentDTOs.find((c) => c.id === id);
  if (!dto) throw new Error(`Demo commitment not found: ${id}`);
  return dto;
}

export const demoCommitmentsRepository = {
  list: async () => ({ items: demoCommitmentDTOs, total: demoCommitmentDTOs.length }),

  getById: async (id: string) => findOrThrow(id),

  create: async (payload: { title: string; description?: string; targetDate?: string; recurrencePattern?: string; priority?: string; goalId?: string | null }) => {
    const id = `c-demo-${Date.now()}`;
    // Reassign to a new array (not .push()) — list() returns demoCommitmentDTOs
    // by reference, and React Query's refetch-after-invalidate needs a new
    // reference to actually pick up the change. Same bug class as Tasks' RI-2.
    replaceDemoCommitmentDTOs([
      ...demoCommitmentDTOs,
      {
        id,
        title: payload.title,
        description: payload.description,
        state: 'Active',
        priority: (payload.priority as 'low' | 'medium' | 'high') || 'medium',
        targetDate: payload.targetDate,
        recurrencePattern: payload.recurrencePattern,
        // Goal linkage is opt-in, not assumed (ADR-019 Fase 2A) — mirrors Habit's own goalId handling.
        goalId: payload.goalId ?? undefined,
      },
    ]);
    return { commitmentId: id };
  },

  edit: async (id: string, payload: Partial<{ title: string; description: string; targetDate: string | null; recurrencePattern: string | null; priority: string }>) => {
    const dto = findOrThrow(id) as any;
    if (payload.title !== undefined) dto.title = payload.title;
    if (payload.description !== undefined) dto.description = payload.description || undefined;
    if (payload.targetDate !== undefined) dto.targetDate = payload.targetDate ?? undefined;
    if (payload.recurrencePattern !== undefined) dto.recurrencePattern = payload.recurrencePattern ?? undefined;
    if (payload.priority !== undefined) dto.priority = payload.priority;
    return { commitmentId: id };
  },

  transition: async (id: string, action: keyof typeof STATE_TRANSITIONS) => {
    const dto = findOrThrow(id) as any;
    dto.state = STATE_TRANSITIONS[action];
    return { commitmentId: id, state: dto.state, version: 1 };
  },

  // Reassigns via .map() + replaceDemoCommitmentDTOs (not an in-place field
  // write like edit()/transition()) — a Goal relink changes which Goal's
  // linkedCommitments list this record shows up in, the same
  // list-membership-change case create() has to get right, not just a
  // same-list field update.
  relinkGoal: async (id: string, goalId: string | null) => {
    findOrThrow(id);
    replaceDemoCommitmentDTOs(
      demoCommitmentDTOs.map((c) => (c.id === id ? { ...c, goalId: goalId ?? undefined } : c))
    );
    return { commitmentId: id };
  },
};
