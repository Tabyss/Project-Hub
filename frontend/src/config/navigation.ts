import {
  FolderKanban,
  StickyNote,
  Bookmark,
  Palette,
  type LucideIcon,
} from "lucide-react";

export interface NavShortcut {
  label: string;
  actionType: "route" | "modal";
  target: string; // path route atau nama event modal
}

export interface NavItemConfig {
  id: "project" | "note" | "bookmark" | "ds";
  label: string;
  path: string;
  icon: LucideIcon;
  shortcut?: NavShortcut;
}

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  {
    id: "project",
    label: "Projects",
    path: "/",
    icon: FolderKanban,
    shortcut: {
      label: "Create Project",
      actionType: "route",
      target: "/project/new",
    },
  },
  {
    id: "note",
    label: "Notes",
    path: "/notes",
    icon: StickyNote,
    shortcut: {
      label: "Create Note",
      actionType: "modal",
      target: "create-note",
    },
  },
  {
    id: "bookmark",
    label: "Bookmarks",
    path: "/bookmark",
    icon: Bookmark,
    shortcut: {
      label: "Create Bookmark",
      actionType: "modal",
      target: "create-bookmark",
    },
  },
  {
    id: "ds",
    label: "Design System",
    path: "/design-system",
    icon: Palette,
  },
];

// Maksimal 3 menu utama ditampilkan langsung, sisanya masuk dropdown "More"
export const PRIMARY_NAV_LIMIT = 3;