import { Tag, Plus, Search, Loader2, Pin, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import NotebookEditor from "../../../components/forms/NotebookEditor";
import { useAuth } from "../../../context/AuthContext";
import { useNoteStore } from "../../../store/noteStore";
import type { Note, Folder } from "../../../types";
import NoteCard from "./NoteCard";

export default function Board() {
    const {
        notes,
        folders,
        selectedFolderId,
        searchQuery,
        isLoading,
        setSelectedFolderId,
        setSearchQuery,
        fetchNotes,
        fetchFolders,
        createNote,
        updateNote,
        createFolder,
        deleteFolder,
    } = useNoteStore();

    const { isAuthenticated, openLoginModal } = useAuth();
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderColor, setNewFolderColor] = useState("#3B82F6");

    useEffect(() => {
        fetchFolders();
        fetchNotes();
    }, [fetchFolders, fetchNotes]);

    useEffect(() => {
        if (folders.length > 0 && selectedFolderId === null) {
            setSelectedFolderId(folders[0].id);
        }
    }, [folders, selectedFolderId, setSelectedFolderId]);

    const handleManualSaveNewNote = async (title: string, content: string) => {
        if (!isAuthenticated) {
            openLoginModal();
            return;
        }
        await createNote({
            title: title || null,
            content,
            folder_id: selectedFolderId || undefined,
        });
        fetchFolders();
    };

    const handleSaveActiveNote = async (title: string, content: string) => {
        if (!activeNote) return;
        await updateNote(activeNote.id, { title: title || null, content });
        setIsEditorModalOpen(false);
        fetchFolders();
    };

    const handleDeleteFolder = async (
        e: React.MouseEvent,
        folderId: string,
        folderName: string,
    ) => {
        e.stopPropagation();
        if (
            confirm(
                `Delete folder "${folderName}"? Notes inside will not be deleted.`,
            )
        ) {
            await deleteFolder(folderId);
        }
    };

    const pinnedNotes = notes.filter((n) => n.is_pinned);
    const otherNotes = notes.filter((n) => !n.is_pinned);

    return (
        <div className="flex flex-col md:flex-row gap-6 px-4 py-4 md:px-7 md:py-6">
            <main className="flex-1 space-y-6 w-full">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    {/* Folder Container */}
                    <div className="w-full md:w-64 bg-white p-4 rounded-xl border border-slate-200 shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Tag size={14} /> Folders
                            </h3>
                            {isAuthenticated && (
                                <button
                                    onClick={() => setIsCreatingFolder(true)}
                                    className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Add Folder"
                                >
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>

                        {/* Scrollable Folder List */}
                        {/* Mobile: horizontal scroll | Desktop: vertical scroll with max-height */}
                        <div className="flex md:flex-col overflow-x-auto md:overflow-x-hidden md:overflow-y-auto md:max-h-80 gap-2 md:gap-1 pb-2 md:pb-0 scrollbar-none pr-0 md:pr-1">
                            {folders.map((folder: Folder) => (
                                <div
                                    key={folder.id}
                                    onClick={() =>
                                        setSelectedFolderId(
                                            selectedFolderId === folder.id
                                                ? null
                                                : folder.id,
                                        )
                                    }
                                    className={`group flex-none md:w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                        selectedFolderId === folder.id
                                            ? "bg-slate-900 text-white"
                                            : "text-slate-600 hover:bg-slate-100 bg-slate-50 md:bg-transparent"
                                    }`}
                                >
                                    <span className="flex items-center gap-2 truncate pr-2">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{
                                                backgroundColor:
                                                    folder.color || "#94A3B8",
                                            }}
                                        />
                                        <span className="truncate whitespace-nowrap md:whitespace-normal">
                                            {folder.name}
                                        </span>
                                    </span>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {isAuthenticated && (
                                            <button
                                                onClick={(e) =>
                                                    handleDeleteFolder(
                                                        e,
                                                        folder.id,
                                                        folder.name,
                                                    )
                                                }
                                                className={`p-1 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity ${
                                                    selectedFolderId ===
                                                    folder.id
                                                        ? "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                                        : "text-slate-400 hover:text-red-600 hover:bg-slate-200"
                                                }`}
                                                title="Delete Folder"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}

                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                                selectedFolderId === folder.id
                                                    ? "bg-slate-800 text-slate-200"
                                                    : "bg-slate-200 md:bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {folder.notes_count || 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        <NotebookEditor onSave={handleManualSaveNewNote} />

                        <div className="relative">
                            <Search
                                className="absolute left-3.5 top-3 text-slate-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search in notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2
                            className="animate-spin text-blue-600"
                            size={28}
                        />
                    </div>
                )}

                {!isLoading && notes.length === 0 && (
                    <div className="text-center py-12 md:py-16 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 text-sm">
                            No notes saved yet.
                        </p>
                    </div>
                )}

                {/* Section Pinned Notes */}
                {!isLoading && pinnedNotes.length > 0 && (
                    <section className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Pin size={12} /> Pinned
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {pinnedNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onClick={() => {
                                        setActiveNote(note);
                                        setIsEditorModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Section Other Notes */}
                {!isLoading && otherNotes.length > 0 && (
                    <section className="space-y-2">
                        {pinnedNotes.length > 0 && (
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Others
                            </h4>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {otherNotes.map((note) => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    onClick={() => {
                                        setActiveNote(note);
                                        setIsEditorModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Modal Edit Note */}
            <Modal
                isOpen={isEditorModalOpen}
                onClose={() => setIsEditorModalOpen(false)}
                title="Edit Note"
            >
                {activeNote && (
                    <NotebookEditor
                        initialTitle={activeNote.title || ""}
                        initialContent={activeNote.content}
                        onSave={handleSaveActiveNote}
                        draftKey={`notebook_draft_edit_${activeNote.id}`}
                    />
                )}
            </Modal>

            {/* Modal Folder Baru */}
            <Modal
                isOpen={isCreatingFolder}
                onClose={() => setIsCreatingFolder(false)}
                title="Create New Folder"
            >
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newFolderName.trim()) return;
                        await createFolder({
                            name: newFolderName,
                            color: newFolderColor,
                        });
                        setNewFolderName("");
                        setIsCreatingFolder(false);
                    }}
                    className="space-y-4 pt-2"
                >
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Folder Name
                        </label>
                        <input
                            type="text"
                            required
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Color
                        </label>
                        <input
                            type="color"
                            value={newFolderColor}
                            onChange={(e) => setNewFolderColor(e.target.value)}
                            className="w-12 h-10 p-1 border rounded-lg cursor-pointer"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsCreatingFolder(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}