import { Search, Loader2, Pin, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Modal from "../../../components/common/Modal";
import NotebookEditor from "./NotebookEditor";
import { useAuth } from "../../../context/AuthContext";
import { useNoteStore } from "../../../store/noteStore";
import { useWorkspaceStore } from "../../../store/workspaceStore";
import {
    DsButton,
    DsInput,
    DsStatCard,
} from "../../DesignSystem/DesignSystemPage";
import type { Note } from "../../../types";
import NoteCard from "./NoteCard";

export default function Board() {
    const {
        notes,
        folders,
        selectedFolderId,
        searchQuery,
        isLoading,
        setSearchQuery,
        fetchNotes,
        fetchFolders,
        createNote,
        updateNote,
        createFolder,
        resetStore,
    } = useNoteStore();

    const { activeQuickModal, triggerQuickModal } = useWorkspaceStore();
    const { user, isAuthenticated, openLoginModal } = useAuth();

    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderColor, setNewFolderColor] = useState("#E13B5A");
    const editorContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            resetStore();
            return;
        }
        fetchFolders();
        fetchNotes();
    }, [isAuthenticated, user?.id, fetchFolders, fetchNotes, resetStore]);

    // Tangani trigger dari Hover Shortcut Header & Secondary Sidebar
    useEffect(() => {
        if (activeQuickModal === "create-folder") {
            setIsCreatingFolder(true);
            triggerQuickModal(null);
        } else if (activeQuickModal === "create-note") {
            editorContainerRef.current?.scrollIntoView({ behavior: "smooth" });
            triggerQuickModal(null);
        }
    }, [activeQuickModal, triggerQuickModal]);

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-coral-soft flex items-center justify-center text-coral mb-4">
                    <Lock size={22} />
                </div>
                <h3 className="text-xl font-bold text-ink mb-1">
                    Workspace Catatan Pribadi
                </h3>
                <p className="text-xs text-ink-muted max-w-md mb-5">
                    Masuk ke akun Anda untuk melihat, membuat, dan mengelola
                    folder serta catatan pribadi Anda.
                </p>
                <DsButton variant="coral" onClick={openLoginModal}>
                    Masuk / Daftar Akun
                </DsButton>
            </div>
        );
    }

    const handleManualSaveNewNote = async (title: string, content: string) => {
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

    const pinnedNotes = notes.filter((n) => n.is_pinned);
    const otherNotes = notes.filter((n) => !n.is_pinned);
    const currentFolder = folders.find((f) => f.id === selectedFolderId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
                    {currentFolder ? currentFolder.name : "Notes & Scratchpad"}
                </h1>

                <div className="w-full md:w-72">
                    <DsInput
                        icon={<Search size={14} />}
                        placeholder="Search in notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div
                ref={editorContainerRef}
                className="bg-surface p-4 rounded-[24px] border border-line"
            >
                <NotebookEditor onSave={handleManualSaveNewNote} />
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-coral" size={26} />
                </div>
            )}

            {!isLoading && notes.length === 0 && (
                <div className="text-center py-14 bg-surface rounded-[24px] border border-dashed border-line">
                    <p className="text-ink-muted text-xs">
                        No notes saved yet.
                    </p>
                </div>
            )}

            {!isLoading && pinnedNotes.length > 0 && (
                <section className="space-y-2.5">
                    <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1">
                        <Pin size={12} className="text-coral" /> Pinned
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

            {!isLoading && otherNotes.length > 0 && (
                <section className="space-y-2.5">
                    {pinnedNotes.length > 0 && (
                        <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                            Others
                        </h4>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                    className="space-y-4 pt-1"
                >
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">
                            Folder Name
                        </label>
                        <input
                            type="text"
                            required
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-canvas focus:border-ink"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">
                            Color
                        </label>
                        <input
                            type="color"
                            value={newFolderColor}
                            onChange={(e) => setNewFolderColor(e.target.value)}
                            className="w-11 h-10 p-1 border border-line rounded-xl cursor-pointer"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <DsButton
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreatingFolder(false)}
                        >
                            Cancel
                        </DsButton>
                        <DsButton type="submit" variant="coral">
                            Save Folder
                        </DsButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
