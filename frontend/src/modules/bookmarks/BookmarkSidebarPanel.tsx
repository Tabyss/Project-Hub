import { useEffect, useState } from "react";
import { BookOpen, Globe, Plus, Tag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspaceStore } from "../../store/workspaceStore";
import {
  bookmarkService,
  type BookmarkCategory,
} from "../../services/bookmarkService";

export default function BookmarkSidebarPanel({
  onSelectComplete,
}: {
  onSelectComplete?: () => void;
}) {
  const { isAuthenticated, user } = useAuth();
  const {
    selectedBookmarkCategoryId,
    setSelectedBookmarkCategoryId,
    selectedBookmarkType,
    setSelectedBookmarkType,
    triggerQuickModal,
  } = useWorkspaceStore();

  const [categories, setCategories] = useState<BookmarkCategory[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      bookmarkService
        .getCategories()
        .then(setCategories)
        .catch(() => setCategories([]));
    }
  }, [isAuthenticated, user?.id]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <span className="px-2 font-bold text-ink block">Format</span>
        <div className="flex flex-wrap gap-1.5 px-2">
          <button
            type="button"
            onClick={() => {
              setSelectedBookmarkType(
                selectedBookmarkType === "web" ? "" : "web"
              );
              onSelectComplete?.();
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              selectedBookmarkType === "web"
                ? "bg-ink text-canvas"
                : "bg-surface lg:bg-canvas border border-line text-ink-muted hover:text-ink"
            }`}
          >
            <Globe size={11} /> Web
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedBookmarkType(
                selectedBookmarkType === "book" ? "" : "book"
              );
              onSelectComplete?.();
            }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
              selectedBookmarkType === "book"
                ? "bg-ink text-canvas"
                : "bg-surface lg:bg-canvas border border-line text-ink-muted hover:text-ink"
            }`}
          >
            <BookOpen size={11} /> Buku
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="font-bold text-ink flex items-center gap-1.5">
            <Tag size={13} className="text-coral" /> Categories
          </span>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                onSelectComplete?.();
                triggerQuickModal("create-bookmark-category");
              }}
              className="w-6 h-6 rounded-full bg-canvas border border-line text-ink hover:border-coral hover:text-coral flex items-center justify-center transition-colors cursor-pointer"
              title="Tambah Kategori Baru"
            >
              <Plus size={12} />
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          <p className="px-2 text-[11px] text-ink-muted">
            Masuk untuk melihat kategori bookmark Anda.
          </p>
        ) : (
          <div className="space-y-1 pl-1.5 border-l border-line ml-2 max-h-[52vh] overflow-y-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setSelectedBookmarkCategoryId("");
                onSelectComplete?.();
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedBookmarkCategoryId === ""
                  ? "font-bold text-coral bg-surface lg:bg-canvas shadow-2xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Semua Koleksi
            </button>

            {categories.map((cat) => {
              const active = selectedBookmarkCategoryId === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedBookmarkCategoryId(active ? "" : cat.id);
                    onSelectComplete?.();
                  }}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    active
                      ? "font-bold text-coral bg-surface lg:bg-canvas shadow-2xs"
                      : "text-ink-muted hover:text-ink hover:bg-surface/60"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate pr-1">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-shell text-ink-muted">
                    {cat.bookmarks_count}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}