import type {
    Folder,
    FolderCreateInput,
    FolderUpdateInput,
    Note,
    NoteCreateInput,
    NoteFilterParams,
    NoteUpdateInput,
} from "../types";
import api from "./api";

export const noteService = {
    async getFolders(): Promise<Folder[]> {
        const response = await api.get<Folder[]>("/notes/folders");
        return response.data;
    },

    async createFolder(data: FolderCreateInput): Promise<Folder> {
        const response = await api.post<Folder>("/notes/folders", data);
        return response.data;
    },

    async updateFolder(id: string, data: FolderUpdateInput): Promise<Folder> {
        const response = await api.patch<Folder>(`/notes/folders/${id}`, data);
        return response.data;
    },

    async deleteFolder(id: string): Promise<void> {
        await api.delete(`/notes/folders/${id}`);
    },

    async getNotes(params?: NoteFilterParams): Promise<Note[]> {
        const response = await api.get<Note[]>("/notes", { params });
        return response.data;
    },

    async getNoteById(id: string): Promise<Note> {
        const response = await api.get<Note>(`/notes/${id}`);
        return response.data;
    },

    async createNote(data: NoteCreateInput): Promise<Note> {
        const response = await api.post<Note>("/notes", data);
        return response.data;
    },

    async updateNote(id: string, data: NoteUpdateInput): Promise<Note> {
        const response = await api.patch<Note>(`/notes/${id}`, data);
        return response.data;
    },

    async deleteNote(id: string): Promise<void> {
        await api.delete(`/notes/${id}`);
    },
};
