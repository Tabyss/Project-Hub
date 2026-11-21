import { FilterX, SlidersHorizontal } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useViewModeStore } from "../../store/viewModeStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { useProjectFiltersOptions } from "../../hooks/queries/useProjects";

export default function ProjectSidebarPanel({
  onSelectComplete,
}: {
  onSelectComplete?: () => void;
}) {
  const { isAuthenticated } = useAuth();
  const { mode } = useViewModeStore();
  const { projectFilters, setProjectFilter, resetProjectFilters } =
    useWorkspaceStore();
  const { data: filterOptions } = useProjectFiltersOptions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <span className="font-bold text-ink flex items-center gap-1.5">
          <SlidersHorizontal size={13} className="text-coral" /> Project Filters
        </span>
        <button
          type="button"
          onClick={() => {
            resetProjectFilters();
            onSelectComplete?.();
          }}
          className="text-[11px] font-semibold text-ink-muted hover:text-coral flex items-center gap-1 cursor-pointer"
        >
          <FilterX size={12} /> Reset
        </button>
      </div>

      <div className="space-y-3.5 pl-2 border-l border-line ml-2">
        {/* Category */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold text-ink-muted px-1">
            Category
          </label>
          <div className="space-y-0.5 max-h-40 overflow-y-auto scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setProjectFilter("category", "");
                onSelectComplete?.();
              }}
              className={`w-full text-left px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                projectFilters.category === ""
                  ? "font-bold text-coral bg-surface lg:bg-canvas shadow-2xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              All Categories
            </button>
            {filterOptions?.categories?.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setProjectFilter(
                    "category",
                    projectFilters.category === cat ? "" : cat
                  );
                  onSelectComplete?.();
                }}
                className={`w-full text-left px-2.5 py-1 rounded-lg truncate transition-colors cursor-pointer ${
                  projectFilters.category === cat
                    ? "font-bold text-coral bg-surface lg:bg-canvas shadow-2xs"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tech / Tool */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-ink-muted px-1">
            Tech / Tool
          </label>
          <select
            value={projectFilters.tool}
            onChange={(e) => setProjectFilter("tool", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-surface lg:bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-ink"
          >
            <option value="">All Tools</option>
            {filterOptions?.tools?.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </select>
        </div>

        {/* Highlight Status */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-ink-muted px-1">
            Highlight Status
          </label>
          <select
            value={projectFilters.is_favorite}
            onChange={(e) => setProjectFilter("is_favorite", e.target.value)}
            className="w-full px-2.5 py-1.5 bg-surface lg:bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-ink"
          >
            <option value="">All Status</option>
            <option value="true">Featured / Favorite</option>
            <option value="false">Regular</option>
          </select>
        </div>

        {/* Visibility (DevDocs) */}
        {mode === "devdocs" && isAuthenticated && (
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-ink-muted px-1">
              Visibility
            </label>
            <select
              value={projectFilters.visibility}
              onChange={(e) => setProjectFilter("visibility", e.target.value)}
              className="w-full px-2.5 py-1.5 bg-surface lg:bg-canvas border border-line rounded-xl text-xs text-ink outline-none focus:border-ink"
            >
              <option value="">All Visibility</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}