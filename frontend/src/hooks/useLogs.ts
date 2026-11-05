import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import type { Log } from "../types";
import { useViewModeStore } from "../store/viewModeStore";

export const useLogs = (projectId: string) => {
    const { mode } = useViewModeStore();

    return useQuery({
        queryKey: ["logs", projectId],
        queryFn: async (): Promise<Log[]> => {
            const { data } = await api.get(`/logs/${projectId}`);
            return data;
        },
        enabled: !!projectId && mode === "devdocs",
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
            queryClient.invalidateQueries({ queryKey: ["logs", projectId] });
            queryClient.invalidateQueries({ queryKey: ["project"] });
        },
    });
};
