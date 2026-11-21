import { useEffect } from "react";
import { Folder, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNoteStore } from "../../store/noteStore";
import { useWorkspaceStore } from "../../store/workspaceStore";

export default function NoteSidebarPanel({
  onSelectComplete,
}: {
  onSelectComplete?: () => void;
}) {
  const { isAuthenticated, user } = useAuth();
  const { triggerQuickModal } = useWorkspaceStore();
  const {
    folders,
    selectedFolderId,
    setSelectedFolderId,
    fetchFolders,
    deleteFolder,
  } = useNoteStore();

  useEffect(() => {
    if (isAuthenticated) fetchFolders();
  }, [isAuthenticated, user?.id, fetchFolders]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <span className="font-bold text-ink flex items-center gap-1.5">
          <Folder size={13} className="text-coral" /> Note Folders
        </span>
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => {
              onSelectComplete?.();
              triggerQuickModal("create-folder");
            }}
            className="w-6 h-6 rounded-full bg-canvas border border-line text-ink hover:border-coral hover:text-coral flex items-center justify-center transition-colors cursor-pointer"
            title="Tambah Folder Baru"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      {!isAuthenticated ? (
        <p className="px-2 text-[11px] text-ink-muted">
          Masuk untuk melihat daftar folder catatan Anda.
        </p>
      ) : (
        <div className="space-y-1 pl-1.5 border-l border-line ml-2 max-h-[62vh] overflow-y-auto scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setSelectedFolderId(null);
              onSelectComplete?.();
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              selectedFolderId === null
                ? "font-bold text-coral bg-surface lg:bg-canvas shadow-2xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            All Notes
          </button>

          {folders.map((folder) => {
            const active = selectedFolderId === folder.id;
            return (
              <div
                key={folder.id}
                onClick={() => {
                  setSelectedFolderId(active ? null : folder.id);
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
                    style={{ backgroundColor: folder.color || "#E13B5A" }}
                  />
                  <span className="truncate">{folder.name}</span>
                </span>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Hapus folder "${folder.name}"? Catatan di dalamnya tetap aman.`
                        )
                      ) {
                        deleteFolder(folder.id);
                      }
                    }}
                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-0.5 text-ink-muted hover:text-coral transition-opacity"
                  >
                    <Trash2 size={11} />
                  </button>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-shell text-ink-muted">
                    {folder.notes_count || 0}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}