import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Bookmark,
  BookOpen,
  Globe,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkspaceStore } from "../../store/workspaceStore";
import Modal from "../../components/common/Modal";
import BookmarkCard from "./components/BookmarkCard";
import {
  DsButton,
  DsInput,
  DsStatCard,
} from "../DesignSystem/DesignSystemPage";
import {
  bookmarkService,
  type BookmarkItem,
  type BookmarkCategory,
} from "../../services/bookmarkService";

export default function BookmarkPage() {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const {
    selectedBookmarkCategoryId,
    selectedBookmarkType,
    activeQuickModal,
    triggerQuickModal,
  } = useWorkspaceStore();

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [categories, setCategories] = useState<BookmarkCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updated_at" | "created_at">("updated_at");

  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<BookmarkItem | null>(
    null
  );
  const [bmTitle, setBmTitle] = useState("");
  const [bmUrl, setBmUrl] = useState("");
  const [bmText, setBmText] = useState("");
  const [bmType, setBmType] = useState<"web" | "book">("web");
  const [bmCategoryId, setBmCategoryId] = useState<string>("");
  const [bmTotalPages, setBmTotalPages] = useState<string>("");
  const [bmInitialPage, setBmInitialPage] = useState<string>("");

  const [checkpointTarget, setCheckpointTarget] = useState<BookmarkItem | null>(
    null
  );
  const [cpPage, setCpPage] = useState("");
  const [cpPageUrl, setCpPageUrl] = useState("");
  const [cpNote, setCpNote] = useState("");

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#E13B5A");

  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [cats, items] = await Promise.all([
        bookmarkService.getCategories(),
        bookmarkService.getBookmarks({
          category_id: selectedBookmarkCategoryId || undefined,
          bookmark_type: selectedBookmarkType || undefined,
          search: search || undefined,
          sort_by: sortBy,
        }),
      ]);
      setCategories(cats);
      setBookmarks(items);
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    selectedBookmarkCategoryId,
    selectedBookmarkType,
    search,
    sortBy,
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      setBookmarks([]);
      setCategories([]);
      return;
    }
    loadData();
  }, [isAuthenticated, user?.id, loadData]);

  const openNewBookmarkModal = useCallback(() => {
    setEditingBookmark(null);
    setBmTitle("");
    setBmUrl("");
    setBmText("");
    setBmType("web");
    setBmCategoryId(selectedBookmarkCategoryId || "");
    setBmTotalPages("");
    setBmInitialPage("");
    setIsBookmarkModalOpen(true);
  }, [selectedBookmarkCategoryId]);

  // Tangani trigger dari Hover Shortcut Header & Secondary Sidebar
  useEffect(() => {
    if (activeQuickModal === "create-bookmark") {
      openNewBookmarkModal();
      triggerQuickModal(null);
    } else if (activeQuickModal === "create-bookmark-category") {
      setCatName("");
      setCatColor("#E13B5A");
      setIsCategoryModalOpen(true);
      triggerQuickModal(null);
    }
  }, [activeQuickModal, openNewBookmarkModal, triggerQuickModal]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-coral-soft flex items-center justify-center text-coral mb-4">
          <Lock size={22} />
        </div>
        <h3 className="text-xl font-bold text-ink mb-1">
          Koleksi Bookmark & Reading Tracker
        </h3>
        <p className="text-xs text-ink-muted max-w-md mb-5">
          Masuk untuk menyimpan tautan web, preview halaman, dan melacak progres halaman buku Anda.
        </p>
        <DsButton variant="coral" onClick={openLoginModal}>
          Masuk Sekarang
        </DsButton>
      </div>
    );
  }

  const openEditBookmarkModal = (bm: BookmarkItem) => {
    setEditingBookmark(bm);
    setBmTitle(bm.title);
    setBmUrl(bm.url);
    setBmText(bm.text || "");
    setBmType(bm.bookmark_type);
    setBmCategoryId(bm.category_id || "");
    setBmTotalPages(bm.total_pages ? String(bm.total_pages) : "");
    setBmInitialPage("");
    setIsBookmarkModalOpen(true);
  };

  const handleSaveBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bmTitle.trim() || !bmUrl.trim()) return;

    if (editingBookmark) {
      await bookmarkService.updateBookmark(editingBookmark.id, {
        title: bmTitle,
        url: bmUrl,
        text: bmText || undefined,
        bookmark_type: bmType,
        category_id: bmCategoryId || null,
        total_pages:
          bmType === "book" && bmTotalPages ? Number(bmTotalPages) : null,
      });
    } else {
      await bookmarkService.createBookmark({
        title: bmTitle,
        url: bmUrl,
        text: bmText || undefined,
        bookmark_type: bmType,
        category_id: bmCategoryId || null,
        total_pages:
          bmType === "book" && bmTotalPages ? Number(bmTotalPages) : null,
        initial_page:
          bmType === "book" && bmInitialPage ? Number(bmInitialPage) : null,
      });
    }

    setIsBookmarkModalOpen(false);
    loadData();
  };

  const handleSaveCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkpointTarget || !cpPage) return;

    await bookmarkService.addCheckpoint(checkpointTarget.id, {
      page_number: Number(cpPage),
      page_url: cpPageUrl.trim() || undefined,
      note: cpNote.trim() || undefined,
    });

    setCheckpointTarget(null);
    setCpPage("");
    setCpPageUrl("");
    setCpNote("");
    loadData();
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    await bookmarkService.createCategory({ name: catName, color: catColor });
    setIsCategoryModalOpen(false);
    setCatName("");
    loadData();
  };

  const activeCategoryObj = categories.find(
    (c) => c.id === selectedBookmarkCategoryId
  );
  const booksCount = bookmarks.filter((b) => b.bookmark_type === "book").length;
  const webCount = bookmarks.filter((b) => b.bookmark_type === "web").length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-ink-muted mb-1">
            Library /{" "}
            {activeCategoryObj ? activeCategoryObj.name : "All Bookmarks"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            {activeCategoryObj ? activeCategoryObj.name : "Bookmarks & Books"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-56">
            <DsInput
              icon={<Search size={14} />}
              placeholder="Cari judul / catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "updated_at" | "created_at")
            }
            className="px-4 py-2 bg-surface border border-line rounded-full text-xs font-semibold text-ink outline-none"
          >
            <option value="updated_at">Sort: Terbaru Diubah</option>
            <option value="created_at">Sort: Tanggal Dibuat</option>
          </select>

          <DsButton variant="coral" onClick={openNewBookmarkModal}>
            <Plus size={15} /> Tambah
          </DsButton>
        </div>
      </div>

      {/* METRIC BENTO ROW */}
      <div className="grid grid-cols-3 gap-3.5">
        <DsStatCard label="Total Saved" value={bookmarks.length} />
        <DsStatCard label="Books Tracked" value={booksCount} variant="dark" />
        <DsStatCard
          label="Web References"
          value={webCount}
          variant="coral-outline"
        />
      </div>

      {/* GRID BOOKMARKS */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-coral" size={28} />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-surface rounded-[24px] border border-dashed border-line py-20 text-center">
          <Bookmark className="mx-auto text-ink-muted mb-2" size={26} />
          <p className="text-xs text-ink-muted">
            Belum ada bookmark pada kategori atau filter ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {bookmarks.map((item) => (
            <BookmarkCard
              key={item.id}
              item={item}
              onAddPage={(bm) => {
                setCheckpointTarget(bm);
                const lastPage =
                  bm.checkpoints[bm.checkpoints.length - 1]?.page_number || 0;
                setCpPage(String(lastPage + 1));
                setCpPageUrl("");
                setCpNote("");
              }}
              onEdit={openEditBookmarkModal}
              onDelete={async (id) => {
                if (confirm("Hapus bookmark ini?")) {
                  await bookmarkService.deleteBookmark(id);
                  loadData();
                }
              }}
              onDeleteCheckpoint={async (bmId, cpId) => {
                await bookmarkService.deleteCheckpoint(bmId, cpId);
                loadData();
              }}
            />
          ))}
        </div>
      )}

      {/* MODAL BOOKMARK */}
      <Modal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        title={editingBookmark ? "Edit Bookmark" : "Simpan Bookmark Baru"}
      >
        <form onSubmit={handleSaveBookmark} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBmType("web")}
              className={`py-2 px-3 rounded-full text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                bmType === "web"
                  ? "bg-ink text-canvas border-ink"
                  : "bg-surface text-ink border-line"
              }`}
            >
              <Globe size={14} /> Link Web
            </button>
            <button
              type="button"
              onClick={() => setBmType("book")}
              className={`py-2 px-3 rounded-full text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer ${
                bmType === "book"
                  ? "bg-ink text-canvas border-ink"
                  : "bg-surface text-ink border-line"
              }`}
            >
              <BookOpen size={14} /> Halaman Buku
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Judul</label>
            <input
              type="text"
              required
              value={bmTitle}
              onChange={(e) => setBmTitle(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-canvas focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              URL {bmType === "book" ? "Buku / PDF" : "Halaman Web"}
            </label>
            <input
              type="url"
              required
              placeholder="https://..."
              value={bmUrl}
              onChange={(e) => setBmUrl(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-canvas focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Kategori</label>
              <select
                value={bmCategoryId}
                onChange={(e) => setBmCategoryId(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {bmType === "book" && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Total Halaman
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="450"
                  value={bmTotalPages}
                  onChange={(e) => setBmTotalPages(e.target.value)}
                  className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none"
                />
              </div>
            )}
          </div>

          {bmType === "book" && !editingBookmark && (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Halaman Awal Dibaca
              </label>
              <input
                type="number"
                min={1}
                placeholder="12"
                value={bmInitialPage}
                onChange={(e) => setBmInitialPage(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1">
              Catatan / Ringkasan
            </label>
            <textarea
              rows={3}
              value={bmText}
              onChange={(e) => setBmText(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface border border-line rounded-2xl text-xs outline-none focus:bg-canvas focus:border-ink"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DsButton
              type="button"
              variant="secondary"
              onClick={() => setIsBookmarkModalOpen(false)}
            >
              Batal
            </DsButton>
            <DsButton type="submit" variant="coral">
              Simpan
            </DsButton>
          </div>
        </form>
      </Modal>

      {/* MODAL CHECKPOINT BUKU */}
      <Modal
        isOpen={!!checkpointTarget}
        onClose={() => setCheckpointTarget(null)}
        title={`Progres Halaman: ${checkpointTarget?.title || ""}`}
      >
        <form onSubmit={handleSaveCheckpoint} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Nomor Halaman
            </label>
            <input
              type="number"
              min={1}
              required
              value={cpPage}
              onChange={(e) => setCpPage(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-canvas focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Direct Link Halaman (Opsional)
            </label>
            <input
              type="url"
              placeholder={`${checkpointTarget?.url}#page=${cpPage || "1"}`}
              value={cpPageUrl}
              onChange={(e) => setCpPageUrl(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Catatan Bab (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Bab 3 - Storage & Retrieval"
              value={cpNote}
              onChange={(e) => setCpNote(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DsButton
              type="button"
              variant="secondary"
              onClick={() => setCheckpointTarget(null)}
            >
              Batal
            </DsButton>
            <DsButton type="submit" variant="coral">
              Tambah ke Timeline
            </DsButton>
          </div>
        </form>
      </Modal>

      {/* MODAL KATEGORI */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Kategori Bookmark Baru"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-line rounded-full text-xs outline-none focus:bg-canvas focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Warna Label
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={catColor}
                onChange={(e) => setCatColor(e.target.value)}
                className="w-11 h-10 p-1 border border-line rounded-xl cursor-pointer"
              />
              <span className="text-xs text-ink-muted font-mono">{catColor}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DsButton
              type="button"
              variant="secondary"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Batal
            </DsButton>
            <DsButton type="submit" variant="coral">
              Simpan Kategori
            </DsButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}