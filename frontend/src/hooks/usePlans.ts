import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Plan } from '../types';
import { useViewModeStore } from '../store/viewModeStore';

export const usePlans = (projectId: string) => {
  const { mode } = useViewModeStore();

  return useQuery({
    queryKey: ["plans", projectId],
    queryFn: async () : Promise<Plan[]> => {
      const { data } = await api.get(`/plans/${projectId}`);
      return data;
    },
    enabled: !!projectId && mode === "devdocs",
  });
};

export const useTogglePlan = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await api.patch(`/plans/${planId}/toggle`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', projectId] });
    },
  });
};

export const useCreatePlan = (projectId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPlan: Partial<Plan>) => {
      const { data } = await api.post(`/plans/${projectId}`, newPlan);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', projectId] });
    },
  });
};