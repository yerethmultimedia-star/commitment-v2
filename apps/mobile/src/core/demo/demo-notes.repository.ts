export interface DemoNoteDTO {
  id: string;
  text: string;
  createdAt: string;
}

/**
 * In-memory Note store for Quick Capture. Note is a plain capture, not a
 * domain aggregate — there's no invariant or lifecycle to model.
 */
const demoNoteDTOs: DemoNoteDTO[] = [];

export const demoNotesRepository = {
  list: async () => ({ items: demoNoteDTOs, total: demoNoteDTOs.length }),

  create: async (payload: { text: string }) => {
    const id = `n-demo-${Date.now()}`;
    demoNoteDTOs.push({
      id,
      text: payload.text,
      createdAt: new Date().toISOString(),
    });
    return { noteId: id };
  },
};
