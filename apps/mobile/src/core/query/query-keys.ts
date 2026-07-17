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
  habits: {
    all: ['habits'] as const,
    list: ['habits', 'list'] as const,
    detail: (id: string) => ['habits', 'detail', id] as const,
  },
  goals: {
    all: ['goals'] as const,
    list: ['goals', 'list'] as const,
    detail: (id: string) => ['goals', 'detail', id] as const,
  },
  profile: {
    detail: (identityId: string) => ['profile', 'detail', identityId] as const,
  },
};
