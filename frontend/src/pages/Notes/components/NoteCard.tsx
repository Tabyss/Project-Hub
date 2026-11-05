import { Pin, FolderIcon, Trash2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNoteStore } from "../../../store/noteStore";
import type { Note } from "../../../types";

interface NoteCardProps {
    note: Note;
    onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
    const { togglePinNote, deleteNote, fetchFolders } = useNoteStore();
    const { isAuthenticated } = useAuth();

    const imgMatch = note.content.match(/!\[.*?\]\((.*?)\)/);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    const rawTextContent = note.content.replace(/!\[.*?\]\(.*?\)/g, "").trim();

    const renderCardMarkdown = (text: string) => {
        if (!text) return "";

        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        html = html.replace(
            /\*\*([^\n]+?)\*\*/g,
            '<strong class="font-bold text-slate-900">$1</strong>',
        );
        html = html.replace(
            /(?<!<[^>]*>)\*([^\n*]+?)\*(?![^<]*>)/g,
            '<em class="italic text-slate-800">$1</em>',
        );
        html = html.replace(
            /__([^\n]+?)__/g,
            '<u class="underline decoration-slate-900 underline-offset-2">$1</u>',
        );

        return html
            .split("\n")
            .map((line) => {
                if (line.trim() === "") return `<div class="h-1"></div>`;

                if (/^---$/.test(line)) {
                    return `<div class="my-3 border-t-2 border-slate-100"></div>`;
                }

                if (/^###\s/.test(line)) {
                    return `<div class="text-sm font-bold text-slate-800 mt-2 mb-0.5">${line.replace(/^###\s/, "")}</div>`;
                }
                if (/^##\s/.test(line)) {
                    return `<div class="text-base font-bold text-slate-900 mt-2 mb-0.5">${line.replace(/^##\s/, "")}</div>`;
                }
                if (/^#\s/.test(line)) {
                    return `<div class="text-lg font-extrabold text-slate-900 mt-2 mb-0.5">${line.replace(/^#\s/, "")}</div>`;
                }

                const checkboxCheckedMatch =
                    line.match(/^(?:-\s)?\[x\]\s(.*)/i);
                if (checkboxCheckedMatch) {
                    return `
                        <div class="flex items-center gap-2 mt-1">
                            <div class="flex items-center justify-center w-4 h-4 rounded border border-emerald-500 bg-emerald-500 text-white shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <span class="text-slate-500 line-through decoration-slate-400">${checkboxCheckedMatch[1]}</span>
                        </div>
                    `;
                }

                const checkboxEmptyMatch = line.match(/^(?:-\s)?\[\s\]\s(.*)/);
                if (checkboxEmptyMatch) {
                    return `
                        <div class="flex items-center gap-2 mt-1">
                            <div class="w-4 h-4 rounded border border-slate-300 bg-white shrink-0"></div>
                            <span class="text-slate-700">${checkboxEmptyMatch[1]}</span>
                        </div>
                    `;
                }

                const bulletMatch = line.match(/^-\s(.*)/);
                if (bulletMatch) {
                    return `<div class="flex items-start gap-1.5 mt-0.5"><span class="text-slate-400 font-bold shrink-0 leading-tight">•</span><span class="text-slate-700">${bulletMatch[1]}</span></div>`;
                }

                const numberMatch = line.match(/^(\d+)\.\s(.*)/);
                if (numberMatch) {
                    return `<div class="flex items-start gap-1.5 mt-0.5"><span class="text-slate-500 font-bold shrink-0 leading-tight">${numberMatch[1]}.</span><span class="text-slate-700">${numberMatch[2]}</span></div>`;
                }

                return `<div class="mt-0.5 text-slate-600">${line}</div>`;
            })
            .join("");
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Hapus catatan ini?")) {
            await deleteNote(note.id);
            await fetchFolders();
        }
    };

    return (
        <div
            onClick={onClick}
            className={`group relative break-inside-avoid mb-4 bg-grey rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden ${
                note.is_pinned
                    ? "border-teal-300 ring-1 ring-teal-200/60 bg-teal-50/20"
                    : "border-slate-200 hover:border-slate-300"
            }`}
        >
            {imageUrl && (
                <div className="w-full max-h-48 overflow-hidden bg-slate-100 border-b border-slate-100">
                    <img
                        src={imageUrl}
                        alt="Attachment"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            )}

            <div className="p-4">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isAuthenticated) togglePinNote(note.id);
                    }}
                    className={`absolute top-3 right-3 p-1.5 rounded-full transition-all ${
                        note.is_pinned
                            ? "text-teal-600 bg-teal-100 opacity-100"
                            : "text-slate-400 hover:bg-slate-100 opacity-0 group-hover:opacity-100"
                    }`}
                >
                    <Pin
                        size={14}
                        className={note.is_pinned ? "fill-teal-600" : ""}
                    />
                </button>

                {/* Title */}
                {note.title && (
                    <h4 className="font-bold text-slate-900 text-base mb-1.5 pr-6 line-clamp-1">
                        {note.title}
                    </h4>
                )}

                {rawTextContent ? (
                    <div
                        dangerouslySetInnerHTML={{
                            __html: renderCardMarkdown(rawTextContent),
                        }}
                        className="text-sm line-clamp-6 leading-relaxed overflow-hidden"
                    />
                ) : (
                    !imageUrl && (
                        <p className="text-slate-400 italic text-xs">
                            Tanpa isi catatan...
                        </p>
                    )
                )}

                {/* Tag Folder & Action */}
                <div className="mt-3 pt-2 flex items-center justify-between text-xs">
                    {note.folder ? (
                        <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium"
                            style={{
                                backgroundColor: note.folder.color
                                    ? `${note.folder.color}15`
                                    : "#F1F5F9",
                                color: note.folder.color || "#475569",
                            }}
                        >
                            <FolderIcon size={12} />
                            {note.folder.name}
                        </span>
                    ) : (
                        <span />
                    )}

                    {isAuthenticated && (
                        <button
                            onClick={handleDelete}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
