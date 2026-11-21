import { useState } from "react";
import {
    ArrowUpRight,
    BookOpen,
    Globe,
    Plus,
    Trash2,
    Edit3,
    Clock,
    MonitorPlay,
    Image as ImageIcon,
} from "lucide-react";
import type {
    BookmarkItem,
    BookmarkCheckpoint,
} from "../../../services/bookmarkService";

interface Props {
    item: BookmarkItem;
    onAddPage: (bookmark: BookmarkItem) => void;
    onEdit: (bookmark: BookmarkItem) => void;
    onDelete: (id: string) => void;
    onDeleteCheckpoint: (bookmarkId: string, checkpointId: string) => void;
}

export default function BookmarkCard({
    item,
    onAddPage,
    onEdit,
    onDelete,
    onDeleteCheckpoint,
}: Props) {
    const latestCheckpoint =
        item.checkpoints.length > 0
            ? item.checkpoints[item.checkpoints.length - 1]
            : null;

    const [activeUrl, setActiveUrl] = useState<string>(
        latestCheckpoint?.page_url || item.url,
    );
    const [selectedPage, setSelectedPage] = useState<number | null>(
        latestCheckpoint?.page_number ?? null,
    );
    // Default false untuk web agar tidak terkena X-Frame-Options: DENY, true jika URL berakhiran .pdf
    const isPdfUrl = activeUrl.toLowerCase().includes(".pdf");
    const [useLiveIframe, setUseLiveIframe] = useState<boolean>(isPdfUrl);
    const [imgError, setImgError] = useState<boolean>(false);

    const handleSelectCheckpoint = (cp: BookmarkCheckpoint) => {
        const targetUrl = cp.page_url || `${item.url}#page=${cp.page_number}`;
        setSelectedPage(cp.page_number);
        setActiveUrl(targetUrl);
        setImgError(false);
    };

    // URL thumbnail otomatis yang kebal terhadap X-Frame-Options: DENY
    const previewImageUrl = `https://s.wordpress.com/mshots/v1/${encodeURIComponent(
        activeUrl,
    )}?w=800&h=450`;

    let domainName = activeUrl;
    try {
        domainName = new URL(activeUrl).hostname.replace("www.", "");
    } catch {
        // biarkan fallback ke activeUrl
    }

    const formattedUpdated = new Date(item.updated_at).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    );

    const formattedCreated = new Date(item.created_at).toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "short",
        },
    );

    return (
        <div className="group bg-white rounded-[24px] p-4 border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
                {/* Area Preview (Snapshot Kebal X-Frame-Options atau Live Iframe) */}
                <div className="relative w-full h-44 bg-[#ECEBE6] rounded-[18px] overflow-hidden mb-3.5 border border-stone-200/60">
                    {useLiveIframe ? (
                        <iframe
                            key={activeUrl}
                            src={activeUrl}
                            title={item.title}
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                            className="w-[200%] h-[200%] origin-top-left scale-50 border-0 bg-white"
                        />
                    ) : !imgError ? (
                        <a
                            href={activeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-full"
                        >
                            <img
                                src={previewImageUrl}
                                alt={item.title}
                                onError={() => setImgError(true)}
                                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                            />
                        </a>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 gap-1.5 px-4 text-center">
                            {item.bookmark_type === "book" ? (
                                <BookOpen size={26} />
                            ) : (
                                <Globe size={26} />
                            )}
                            <span className="text-xs font-semibold text-stone-700">
                                {domainName}
                            </span>
                            <span className="text-[11px] text-stone-400 truncate max-w-full">
                                {activeUrl}
                            </span>
                        </div>
                    )}

                    {/* Badge Kategori & Switcher Snapshot vs Live Iframe */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        {item.category ? (
                            <span
                                className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white shadow-xs"
                                style={{ backgroundColor: item.category.color }}
                            >
                                {item.category.name}
                            </span>
                        ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-900/75 text-white">
                                {item.bookmark_type === "book"
                                    ? "Buku"
                                    : domainName}
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() => setUseLiveIframe((prev) => !prev)}
                            className="pointer-events-auto px-2 py-1 rounded-full bg-white/90 text-stone-700 hover:bg-white shadow-xs transition-colors flex items-center gap-1 text-[10px] font-semibold"
                            title={
                                useLiveIframe
                                    ? "Ganti ke Snapshot Preview"
                                    : "Coba Muat Live Iframe (hanya untuk situs yang mengizinkan embed)"
                            }
                        >
                            {useLiveIframe ? (
                                <>
                                    <ImageIcon size={11} /> Snapshot
                                </>
                            ) : (
                                <>
                                    <MonitorPlay size={11} /> Live
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Judul & Catatan */}
                <div className="space-y-1 mb-3">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-stone-900 text-[15px] leading-snug line-clamp-1">
                            {item.title}
                        </h3>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                                onClick={() => onEdit(item)}
                                className="p-1 text-stone-400 hover:text-stone-900 rounded"
                                title="Edit Bookmark"
                            >
                                <Edit3 size={13} />
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-1 text-stone-400 hover:text-red-600 rounded"
                                title="Hapus Bookmark"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>

                    {item.text && (
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                            {item.text}
                        </p>
                    )}
                </div>

                {/* Timeline Progresif Halaman Buku (Hal 12 -> Hal 35 -> Hal 58) */}
                {item.bookmark_type === "book" && (
                    <div className="mb-3 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1.5">
                            <span className="font-medium text-stone-600 flex items-center gap-1">
                                <BookOpen size={12} /> Timeline Halaman
                            </span>
                            {item.total_pages && selectedPage && (
                                <span>
                                    {Math.min(
                                        100,
                                        Math.round(
                                            (selectedPage / item.total_pages) *
                                                100,
                                        ),
                                    )}
                                    %
                                </span>
                            )}
                        </div>

                        {item.checkpoints.length === 0 ? (
                            <p className="text-[11px] text-stone-400 italic">
                                Belum ada riwayat halaman. Klik + untuk
                                mencatat.
                            </p>
                        ) : (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                {item.checkpoints.map((cp, idx) => {
                                    const isActive =
                                        selectedPage === cp.page_number;
                                    return (
                                        <div
                                            key={cp.id}
                                            className="flex items-center gap-1.5 shrink-0"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSelectCheckpoint(cp)
                                                }
                                                onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    if (
                                                        confirm(
                                                            `Hapus riwayat Hal ${cp.page_number}?`,
                                                        )
                                                    ) {
                                                        onDeleteCheckpoint(
                                                            item.id,
                                                            cp.id,
                                                        );
                                                    }
                                                }}
                                                title={
                                                    cp.note ||
                                                    `Pilih Halaman ${cp.page_number} (Klik kanan untuk hapus)`
                                                }
                                                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                                                    isActive
                                                        ? "bg-stone-900 text-white shadow-xs"
                                                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                                }`}
                                            >
                                                Hal {cp.page_number}
                                            </button>
                                            {idx <
                                                item.checkpoints.length - 1 && (
                                                <span className="w-2.5 h-[1.5px] bg-stone-300" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Kartu */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-1">
                <div className="text-[11px] text-stone-400 flex flex-col">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                        <Clock size={11} /> Upd: {formattedUpdated}
                    </span>
                    <span>Dibuat: {formattedCreated}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    {item.bookmark_type === "book" && (
                        <button
                            type="button"
                            onClick={() => onAddPage(item)}
                            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition-colors"
                            title="Catat Halaman Baru"
                        >
                            <Plus size={15} />
                        </button>
                    )}
                    <a
                        href={activeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center transition-transform hover:scale-105"
                        title="Buka Link Langsung"
                    >
                        <ArrowUpRight size={15} />
                    </a>
                </div>
            </div>
        </div>
    );
}
