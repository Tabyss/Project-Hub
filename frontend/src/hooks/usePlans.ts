import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Plan } from '../types';
import { useViewModeStore } from '../store/viewModeStore';
import { useAuth } from '../context/AuthContext';

export const usePlans = (projectId: string) => {
  const { mode } = useViewModeStore();
  const { user, isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["plans", user?.id ?? "guest", projectId],
    queryFn: async (): Promise<Plan[]> => {
      const { data } = await api.get(`/plans/${projectId}`);
      return data;
    },
    enabled: !!projectId && isAuthenticated && mode === "devdocs",
  });
};

export const useTogglePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await api.patch(`/plans/${planId}/toggle`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
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
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
};