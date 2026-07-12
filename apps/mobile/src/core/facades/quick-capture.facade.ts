import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/api-client';

export interface QuickCaptureCommand {
  text: string;
  identityId: string;
  date?: string;
  context?: Record<string, any>;
  source: string;
}

export interface QuickCaptureResult {
  id: string;
  type: 'task' | 'goal' | 'habit' | 'note';
}

export function useQuickCaptureFacade() {
  const queryClient = useQueryClient();

  const mutation = useMutation<QuickCaptureResult, Error, QuickCaptureCommand>({
    mutationFn: async (command) => {
      // Ky expects json option or string body
      return apiClient.post('v1/tasks/quick-capture', { json: command } as any).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    capture: mutation.mutateAsync,
    isCapturing: mutation.isPending,
    error: mutation.error,
  };
}
