import api from "./api";

export interface BookmarkCategory {
  id: string;
  name: string;
  color: string;
  created_at: string;
  bookmarks_count: number;
}

export interface BookmarkCheckpoint {
  id: string;
  bookmark_id: string;
  page_number: number;
  page_url?: string | null;
  note?: string | null;
  created_at: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  text?: string | null;
  url: string;
  bookmark_type: "web" | "book";
  category_id?: string | null;
  category?: BookmarkCategory | null;
  total_pages?: number | null;
  checkpoints: BookmarkCheckpoint[];
  created_at: string;
  updated_at: string;
}

export const bookmarkService = {
  getCategories: async () => (await api.get<BookmarkCategory[]>("/bookmarks/categories")).data,
  createCategory: async (data: { name: string; color: string }) =>
    (await api.post<BookmarkCategory>("/bookmarks/categories", data)).data,
  updateCategory: async (id: string, data: { name?: string; color?: string }) =>
    (await api.patch<BookmarkCategory>(`/bookmarks/categories/${id}`, data)).data,
  deleteCategory: async (id: string) => api.delete(`/bookmarks/categories/${id}`),

  getBookmarks: async (params?: {
    category_id?: string;
    bookmark_type?: "web" | "book";
    search?: string;
    sort_by?: string;
  }) => (await api.get<BookmarkItem[]>("/bookmarks/", { params })).data,

  createBookmark: async (data: {
    title: string;
    text?: string;
    url: string;
    bookmark_type: "web" | "book";
    category_id?: string | null;
    total_pages?: number | null;
    initial_page?: number | null;
  }) => (await api.post<BookmarkItem>("/bookmarks/", data)).data,

  updateBookmark: async (id: string, data: Partial<BookmarkItem>) =>
    (await api.patch<BookmarkItem>(`/bookmarks/${id}`, data)).data,

  deleteBookmark: async (id: string) => api.delete(`/bookmarks/${id}`),

  addCheckpoint: async (
    bookmarkId: string,
    data: { page_number: number; page_url?: string; note?: string }
  ) => (await api.post<BookmarkCheckpoint>(`/bookmarks/${bookmarkId}/checkpoints`, data)).data,

  deleteCheckpoint: async (bookmarkId: string, checkpointId: string) =>
    api.delete(`/bookmarks/${bookmarkId}/checkpoints/${checkpointId}`),
};