export const queryKeys = {
  commitments: {
    all: ['commitments'] as const,
    list: (filters?: Record<string, unknown>) => ['commitments', 'list', filters] as const,
    detail: (id: string) => ['commitments', 'detail', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (filters?: Record<string, unknown>) => ['tasks', 'list', filters] as const,
    dashboard: (identityId: string) => ['tasks', 'dashboard', identityId] as const,
  },
};
