import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import type { Project } from '../../types';
import { useViewModeStore } from '../../store/viewModeStore';
import { useAuth } from '../../context/AuthContext';

interface ProjectFilters {
    category?: string;
    tool?: string;
    visibility?: string;
    is_favorite?: boolean | string;
}

export const useProjects = (filters: ProjectFilters = {}) => {
    const { mode } = useViewModeStore();
    const { user } = useAuth();

    return useQuery<Project[]>({
        queryKey: ["projects", user?.id ?? "guest", mode, filters],
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
    const { user } = useAuth();

    return useQuery<Project>({
        queryKey: ["project", user?.id ?? "guest", slug, mode],
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
            queryClient.invalidateQueries({ queryKey: ['project-filters'] });
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
            queryClient.invalidateQueries({ queryKey: ['project-filters'] });
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
            queryClient.invalidateQueries({ queryKey: ['project-filters'] });
        },
    });
};

export const useProjectFiltersOptions = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["project-filters", user?.id ?? "guest"],
        queryFn: async () => {
            const { data } = await api.get("/projects/filters/options");
            return data as { categories: string[]; tools: string[]; roles: string[] };
        },
    });
};