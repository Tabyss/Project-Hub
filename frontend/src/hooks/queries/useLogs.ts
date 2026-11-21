import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import type { Log } from "../../types";
import { useViewModeStore } from "../../store/viewModeStore";
import { useAuth } from "../../context/AuthContext";

export const useLogs = (projectId: string) => {
    const { mode } = useViewModeStore();
    const { user, isAuthenticated } = useAuth();

    return useQuery({
        queryKey: ["logs", user?.id ?? "guest", projectId],
        queryFn: async (): Promise<Log[]> => {
            const { data } = await api.get(`/logs/${projectId}`);
            return data;
        },
        enabled: !!projectId && isAuthenticated && mode === "devdocs",
    });
};

export const useCreateLog = (projectId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newLog: Partial<Log>) => {
            const { data } = await api.post(`/logs/${projectId}`, newLog);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["logs"] });
            queryClient.invalidateQueries({ queryKey: ["project"] });
        },
    });
};