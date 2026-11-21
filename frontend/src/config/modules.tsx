import type { ComponentType } from "react";
import {
    FolderKanban,
    StickyNote,
    Bookmark,
    Palette,
    SlidersHorizontal,
    Folder,
    Tag,
    type LucideIcon,
} from "lucide-react";

import Board from "../pages/Notes/components/Board";
import BookmarkPage from "../pages/Bookmarks/BookmarkPage";
import DesignSystemPage from "../pages/DesignSystem/DesignSystemPage";

import ProjectSidebarPanel from "../modules/projects/ProjectSidebarPanel";
import NoteSidebarPanel from "../modules/notes/NoteSidebarPanel";
import BookmarkSidebarPanel from "../modules/bookmarks/BookmarkSidebarPanel";
import type { WorkspaceState } from "../store/workspaceStore";
import ProjectPage from "../pages/Project/ProjectPage";
import ProjectDetailPage from "../pages/Project/components/ProjectDetail/ProjectDetailPage";
import ProjectFormPage from "../pages/Project/components/ProjectForm/ProjectFormPage";

export interface SubRouteConfig {
    path: string;
    element: ComponentType;
}

export interface ModuleConfig {
    id: string;
    label: string;
    path: string;
    icon: LucideIcon;
    element: ComponentType;
    subRoutes?: SubRouteConfig[]; // Rute turunan otomatis didaftarkan di App.tsx
    shortcut?: {
        label: string;
        actionType: "route" | "modal";
        target: string;
    };
    sidebar?: {
        title: string;
        mobileButtonLabel: string;
        mobileButtonIcon: LucideIcon;
        component: ComponentType<{ onSelectComplete?: () => void }>;
        hasActiveFilter?: (state: WorkspaceState) => boolean;
    };
}

export const APP_MODULES: ModuleConfig[] = [
    {
        id: "project",
        label: "Projects",
        path: "/",
        icon: FolderKanban,
        element: ProjectPage,
        subRoutes: [
            { path: "/project/:slug", element: ProjectDetailPage },
            { path: "/project/new", element: ProjectFormPage },
            { path: "/project/edit/:slug", element: ProjectFormPage },
        ],
        shortcut: {
            label: "Create Project",
            actionType: "route",
            target: "/project/new",
        },
        sidebar: {
            title: "Project Filters",
            mobileButtonLabel: "Filters",
            mobileButtonIcon: SlidersHorizontal,
            component: ProjectSidebarPanel,
            hasActiveFilter: (s) =>
                Boolean(
                    s.projectFilters.category ||
                    s.projectFilters.tool ||
                    s.projectFilters.visibility ||
                    s.projectFilters.is_favorite,
                ),
        },
    },
    {
        id: "note",
        label: "Notes",
        path: "/notes",
        icon: StickyNote,
        element: Board,
        shortcut: {
            label: "Create Note",
            actionType: "modal",
            target: "create-note",
        },
        sidebar: {
            title: "Note Folders",
            mobileButtonLabel: "Folders",
            mobileButtonIcon: Folder,
            component: NoteSidebarPanel,
        },
    },
    {
        id: "bookmark",
        label: "Bookmarks",
        path: "/bookmark",
        icon: Bookmark,
        element: BookmarkPage,
        shortcut: {
            label: "Create Bookmark",
            actionType: "modal",
            target: "create-bookmark",
        },
        sidebar: {
            title: "Bookmark Categories",
            mobileButtonLabel: "Categories",
            mobileButtonIcon: Tag,
            component: BookmarkSidebarPanel,
            hasActiveFilter: (s) =>
                Boolean(s.selectedBookmarkCategoryId || s.selectedBookmarkType),
        },
    },
    {
        id: "ds",
        label: "Design System",
        path: "/design-system",
        icon: Palette,
        element: DesignSystemPage,
        // Tidak punya `sidebar` -> SecondarySidebar otomatis tidak dirender di halaman ini
    },
];

// Batas maksimal menu utama di top bar & bottom bar (sisanya otomatis masuk dropdown/sheet)
export const PRIMARY_NAV_LIMIT = 3;

// Helper terpusat untuk mencocokkan modul aktif berdasarkan pathname saat ini
export function getActiveModule(pathname: string): ModuleConfig | undefined {
    return APP_MODULES.find((mod) => {
        if (mod.path === "/") {
            return (
                pathname === "/" ||
                mod.subRoutes?.some((sub) =>
                    pathname.startsWith(sub.path.split("/:")[0]),
                )
            );
        }
        return pathname.startsWith(mod.path);
    });
}
