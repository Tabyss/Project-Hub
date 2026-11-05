import { useState, useEffect, useRef } from "react";
import { useCreateProject, useUpdateProject } from "../../hooks/useProjects";
import { Loader2, UploadCloud, X } from "lucide-react";
import type { Project, Visibility, Status } from "../../types";
import api from "../../services/api";

interface ProjectFormProps {
    initialData?: Project;
    onSuccess: () => void;
}

export default function ProjectForm({
    initialData,
    onSuccess,
}: ProjectFormProps) {
    const [formData, setFormData] = useState<Partial<Project>>({
        title: "",
        slug: "",
        tagline: "",
        category: ["Web App"],
        visibility: "Public",
        status: "Active",
        role: "Developer",
        portfolio_content: "",
        documentation_content: "",
        cover_img: "",
    });

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: createProject, isPending: isCreating } = useCreateProject();
    const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleTitleChange = (title: string) => {
        if (!initialData) {
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
            setFormData({ ...formData, title, slug });
        } else {
            setFormData({ ...formData, title });
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const { data } = await api.post("/upload/", uploadData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setFormData({ ...formData, cover_img: data.url });
        } catch (error) {
            alert(
                "Gagal mengunggah gambar. Pastikan backend mendukung endpoint /upload/",
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (initialData) {
            updateProject(
                { id: initialData.id, data: formData },
                { onSuccess },
            );
        } else {
            createProject(formData, { onSuccess });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
        >
            {/* --- SECTION UPLOAD IMAGE --- */}
            <div className="mb-4 border-b border-slate-100 pb-4">
                <label className="block text-sm font-semibold mb-2">
                    Cover Image
                </label>

                {formData.cover_img ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-slate-200 group">
                        <img
                            src={formData.cover_img}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setFormData({ ...formData, cover_img: "" })
                            }
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus gambar"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                        {isUploading ? (
                            <Loader2 className="animate-spin mb-2" size={24} />
                        ) : (
                            <UploadCloud className="mb-2" size={24} />
                        )}
                        <span className="text-sm font-medium">
                            {isUploading
                                ? "Mengunggah..."
                                : "Klik untuk upload gambar"}
                        </span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                        />
                    </div>
                )}
            </div>
            {/* ---------------------------- */}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Nama Project
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title || ""}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Slug URL
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.slug || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg bg-slate-50 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1">
                    Tagline (1 Kalimat)
                </label>
                <input
                    type="text"
                    required
                    value={formData.tagline || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, tagline: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Kategori (Pisahkan dengan koma)
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.category?.join(", ") || ""}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                category: e.target.value
                                    .split(",")
                                    .map((c) => c.trim()),
                            })
                        }
                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                        placeholder="Web App, IoT..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Visibility
                    </label>
                    <select
                        value={formData.visibility || "Public"}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                visibility: e.target.value as Visibility,
                            })
                        }
                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                    >
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Status
                    </label>
                    <select
                        value={formData.status || "Active"}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                status: e.target.value as Status,
                            })
                        }
                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                    >
                        <option value="Active">Active</option>
                        <option value="Maintained">Maintained</option>
                        <option value="In Development">In Dev</option>
                        <option value="Archived">Archived</option>
                    </select>
                </div>
            </div>

            <div className="pt-4 border-t">
                <label className="block text-sm font-semibold mb-1 text-blue-600">
                    Portfolio Content (Markdown)
                </label>
                <textarea
                    rows={3}
                    value={formData.portfolio_content || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            portfolio_content: e.target.value,
                        })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold mb-1 text-slate-800">
                    Documentation Content (Dev Docs)
                </label>
                <textarea
                    rows={3}
                    value={formData.documentation_content || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            documentation_content: e.target.value,
                        })
                    }
                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2"
                />
            </div>

            <button
                type="submit"
                disabled={isPending || isUploading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <Loader2 className="animate-spin" />
                ) : initialData ? (
                    "Simpan Perubahan"
                ) : (
                    "Buat Project"
                )}
            </button>
        </form>
    );
}
