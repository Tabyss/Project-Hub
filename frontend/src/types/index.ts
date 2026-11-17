export type Visibility = "Public" | "Private";
export type Status =
    | "Idea"
    | "In Development"
    | "Active"
    | "Maintained"
    | "Paused"
    | "Archived";
export type Priority = "Low" | "Medium" | "High";
export type LogType =
    | "feature"
    | "bugfix"
    | "refactor"
    | "docs"
    | "maintenance"
    | "release";

export interface Project {
    id: string;
    user_id?: string;
    title: string;
    slug: string;
    tagline: string;
    category: string[];
    visibility: Visibility;
    status: Status;
    is_favorite: boolean;
    role: string;

    cover_img?: string | null;
    repo_url?: string | null;
    live_url?: string | null;

    tools?: string[];
    media_urls?: string[];

    portfolio_content?: string | null;
    documentation_content?: string | null;

    created_at: string;
    last_updated_at: string;
}

export interface Plan {
    id: string;
    project_id: string;
    task: string;
    priority: Priority;
    is_completed: boolean;
    created_at: string;
}

export interface Log {
    id: string;
    project_id: string;
    version?: string | null;
    title: string;
    details?: string | null;
    log_type: LogType;
    created_at: string;
}

export interface Folder {
    id: string;
    name: string;
    color?: string;
    notes_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Note {
    id: string;
    title?: string | null;
    content: string;
    is_pinned: boolean;
    folder_id?: string | null;
    folder?: Folder | null;
    created_at: string;
    updated_at: string;
}

export interface FolderCreateInput {
    name: string;
    color?: string;
}

export interface FolderUpdateInput {
    name?: string;
    color?: string;
}

export interface NoteCreateInput {
    title?: string | null;
    content: string;
    is_pinned?: boolean;
    folder_id?: string | null;
}

export interface NoteUpdateInput {
    title?: string | null;
    content?: string;
    is_pinned?: boolean;
    folder_id?: string | null;
}

export interface NoteFilterParams {
    folder_id?: string;
    is_pinned?: boolean;
    search?: string;
}
