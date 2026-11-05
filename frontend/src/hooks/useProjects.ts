import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Project } from '../types';
import { useViewModeStore } from '../store/viewModeStore';

interface ProjectFilters {
    category?: string;
    tool?: string;
    visibility?: string;
    is_favorite?: boolean | string;
}

export const useProjects = (filters: ProjectFilters = {}) => {
    const { mode } = useViewModeStore();
    
    return useQuery<Project[]>({
        queryKey: ["projects", mode, filters],
        queryFn: async () => {
            const { data } = await api.get("/projects/", {
                params: { mode, ...filters },
            });
            return data;
        },
    });
};

export const useProject = (slug: string) => {
  const { mode } = useViewModeStore();

  return useQuery<Project>({
    queryKey: ["project", slug, mode],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${slug}`, {
        params: { mode },
      });
      return data;
    },
    enabled: !!slug,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProject: Partial<Project>) => {
      const { data } = await api.post('/projects/', newProject);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      const { data: response } = await api.patch(`/projects/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project'] }); 
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useProjectFiltersOptions = () => {
    return useQuery({
        queryKey: ["project-filters"],
        queryFn: async () => {
            const { data } = await api.get("/projects/filters/options");
            return data as { categories: string[]; tools: string[]; roles: string[] };
        },
    });
};