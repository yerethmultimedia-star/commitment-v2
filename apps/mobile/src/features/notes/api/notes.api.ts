import { demoNotesRepository } from '@/core/demo/demo-notes.repository';

// Note is a plain capture with no lifecycle — Quick Capture's simplest
// type. Routes to the in-memory demo repository, same temporary shape as
// goals.api.ts / habits.api.ts until a real backend module exists.
export const notesApi = {
  list: async () => demoNotesRepository.list(),
  create: async (payload: { text: string }) => demoNotesRepository.create(payload),
};
