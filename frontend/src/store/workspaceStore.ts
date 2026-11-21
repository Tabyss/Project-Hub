import { create } from "zustand";

export interface ProjectFilterState {
  category: string;
  tool: string;
  visibility: string;
  is_favorite: string;
}

export interface WorkspaceState {
  // Project Filters
  projectFilters: ProjectFilterState;
  setProjectFilter: <K extends keyof ProjectFilterState>(
    key: K,
    value: ProjectFilterState[K]
  ) => void;
  resetProjectFilters: () => void;

  // Bookmark Filters & Categories
  selectedBookmarkCategoryId: string;
  selectedBookmarkType: "" | "web" | "book";
  setSelectedBookmarkCategoryId: (id: string) => void;
  setSelectedBookmarkType: (type: "" | "web" | "book") => void;

  // Global Trigger Modal
  activeQuickModal:
    | null
    | "create-note"
    | "create-folder"
    | "create-bookmark"
    | "create-bookmark-category";
  triggerQuickModal: (modal: WorkspaceState["activeQuickModal"]) => void;

  // Mobile Secondary Sidebar Drawer State
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
}

const DEFAULT_PROJECT_FILTERS: ProjectFilterState = {
  category: "",
  tool: "",
  visibility: "",
  is_favorite: "",
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  projectFilters: DEFAULT_PROJECT_FILTERS,
  setProjectFilter: (key, value) =>
    set((state) => ({
      projectFilters: { ...state.projectFilters, [key]: value },
    })),
  resetProjectFilters: () => set({ projectFilters: DEFAULT_PROJECT_FILTERS }),

  selectedBookmarkCategoryId: "",
  selectedBookmarkType: "",
  setSelectedBookmarkCategoryId: (id) =>
    set({ selectedBookmarkCategoryId: id }),
  setSelectedBookmarkType: (type) => set({ selectedBookmarkType: type }),

  activeQuickModal: null,
  triggerQuickModal: (modal) => set({ activeQuickModal: modal }),

  isMobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
}));