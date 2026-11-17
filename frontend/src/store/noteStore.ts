import { create } from "zustand";
import { noteService } from "../services/noteService";
import type {
    Note,
    Folder,
    FolderCreateInput,
    FolderUpdateInput,
    NoteCreateInput,
    NoteUpdateInput,
} from "../types";

interface NoteState {
    notes: Note[];
    folders: Folder[];
    selectedFolderId: string | null;
    searchQuery: string;
    isLoading: boolean;
    error: string | null;

    setSelectedFolderId: (folderId: string | null) => void;
    setSearchQuery: (query: string) => void;
    resetStore: () => void;

    fetchFolders: () => Promise<void>;
    createFolder: (data: FolderCreateInput) => Promise<Folder | undefined>;
    updateFolder: (id: string, data: FolderUpdateInput) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;

    fetchNotes: () => Promise<void>;
    createNote: (data: NoteCreateInput) => Promise<Note | undefined>;
    updateNote: (id: string, data: NoteUpdateInput) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    togglePinNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
    notes: [],
    folders: [],
    selectedFolderId: null,
    searchQuery: "",
    isLoading: false,
    error: null,

    resetStore: () =>
        set({
            notes: [],
            folders: [],
            selectedFolderId: null,
            searchQuery: "",
            isLoading: false,
            error: null,
        }),

    setSelectedFolderId: (folderId) => {
        set({ selectedFolderId: folderId });
        get().fetchNotes();
    },

    setSearchQuery: (query) => {
        set({ searchQuery: query });
        get().fetchNotes();
    },

    fetchFolders: async () => {
        try {
            const folders = await noteService.getFolders();
            set({ folders });
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Gagal memuat folder.",
            });
        }
    },

    createFolder: async (data) => {
        try {
            const newFolder = await noteService.createFolder(data);
            set((state) => ({ folders: [...state.folders, newFolder] }));
            return newFolder;
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Gagal membuat folder.",
            });
        }
    },

    updateFolder: async (id, data) => {
        try {
            const updated = await noteService.updateFolder(id, data);
            set((state) => ({
                folders: state.folders.map((f) => (f.id === id ? updated : f)),
            }));
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Gagal mengubah folder.",
            });
        }
    },

    deleteFolder: async (id) => {
        try {
            await noteService.deleteFolder(id);
            set((state) => ({
                folders: state.folders.filter((f) => f.id !== id),
                selectedFolderId:
                    state.selectedFolderId === id
                        ? null
                        : state.selectedFolderId,
            }));
            get().fetchNotes();
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Gagal menghapus folder.",
            });
        }
    },

    fetchNotes: async () => {
        set({ isLoading: true, error: null });
        try {
            const { selectedFolderId, searchQuery } = get();
            const notes = await noteService.getNotes({
                folder_id: selectedFolderId || undefined,
                search: searchQuery || undefined,
            });
            set({ notes, isLoading: false });
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Gagal memuat catatan.",
                isLoading: false,
            });
        }
    },

    createNote: async (data) => {
        try {
            const newNote = await noteService.createNote(data);
            set((state) => ({ notes: [newNote, ...state.notes] }));
            return newNote;
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Gagal membuat catatan.",
            });
        }
    },

    updateNote: async (id, data) => {
        set((state) => ({
            notes: state.notes.map((n) =>
                n.id === id ? { ...n, ...data } : n,
            ),
        }));

        try {
            const updated = await noteService.updateNote(id, data);
            set((state) => ({
                notes: state.notes.map((n) => (n.id === id ? updated : n)),
            }));
        } catch (err: any) {
            set({
                error:
                    err.response?.data?.detail || "Gagal memperbarui catatan.",
            });
            get().fetchNotes();
        }
    },

    deleteNote: async (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
        try {
            await noteService.deleteNote(id);
            await get().fetchFolders();
        } catch (err: any) {
            set({
                error: err.response?.data?.detail || "Gagal menghapus catatan.",
            });
            get().fetchNotes();
        }
    },

    togglePinNote: async (id) => {
        const targetNote = get().notes.find((n) => n.id === id);
        if (!targetNote) return;
        await get().updateNote(id, { is_pinned: !targetNote.is_pinned });
    },
}));