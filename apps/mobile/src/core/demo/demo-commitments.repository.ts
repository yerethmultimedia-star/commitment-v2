import { demoCommitmentDTOs } from './demo-data';

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

  create: async (payload: { title: string; description?: string; targetDate?: string; recurrencePattern?: string; priority?: string }) => {
    const id = `c-demo-${Date.now()}`;
    demoCommitmentDTOs.push({
      id,
      title: payload.title,
      state: 'Active',
      priority: (payload.priority as 'low' | 'medium' | 'high') || 'medium',
      targetDate: payload.targetDate,
      recurrencePattern: payload.recurrencePattern,
      // Not created through Goal Workspace, so it isn't linked to a Goal yet.
      goalId: undefined,
    });
    return { commitmentId: id };
  },

  edit: async (id: string, payload: Partial<{ title: string; targetDate: string | null; recurrencePattern: string | null; priority: string }>) => {
    const dto = findOrThrow(id) as any;
    if (payload.title !== undefined) dto.title = payload.title;
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
};
