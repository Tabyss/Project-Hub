import { useState, useEffect } from "react";
import type { Project, Visibility, Status } from "../../../../types";
import { Star } from "lucide-react";

interface ProjectBasicInfoSectionProps {
    formData: Partial<Project>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Project>>>;
    handleTitleChange: (title: string) => void;
}

export default function ProjectBasicInfoSection({
    formData,
    setFormData,
    handleTitleChange,
}: ProjectBasicInfoSectionProps) {
    const [categoryInput, setCategoryInput] = useState(
        formData.category?.join(", ") || ""
    );
    const [toolsInput, setToolsInput] = useState(
        formData.tools?.join(", ") || ""
    );

    useEffect(() => {
        if (formData.category) {
            setCategoryInput(formData.category.join(", "));
        }
    }, [formData.category]);

    useEffect(() => {
        if (formData.tools) {
            setToolsInput(formData.tools.join(", "));
        }
    }, [formData.tools]);

    const commitCategories = () => {
        const list = categoryInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (list.length <= 3) {
            setFormData((prev) => ({ ...prev, category: list }));
        }
    };

    const commitTools = () => {
        const list = toolsInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        setFormData((prev) => ({ ...prev, tools: list }));
    };

    return (
        <section className="col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">
                    1. Basic Information
                </h2>
                <button
                    type="button"
                    onClick={() =>
                        setFormData((prev) => ({
                            ...prev,
                            is_favorite: !prev.is_favorite,
                        }))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                        formData.is_favorite
                            ? "bg-amber-100 text-amber-700 border border-amber-300"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                    <Star
                        size={16}
                        className={
                            formData.is_favorite
                                ? "fill-amber-500 text-amber-500"
                                : ""
                        }
                    />
                    {formData.is_favorite ? "Featured Project" : "Mark as Favorite"}
                </button>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title || ""}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Slug URL *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.slug || ""}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    slug: e.target.value,
                                }))
                            }
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Short Tagline *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.tagline || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                tagline: e.target.value,
                            }))
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="E.g., A fast web-based e-reader with Google Drive integration..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Role *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.role || ""}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                role: e.target.value,
                            }))
                        }
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Frontend Developer, Full Stack Engineer..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Categories (Max 3, comma separated) *
                        </label>
                        <input
                            type="text"
                            required
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                            onBlur={commitCategories}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Web App, Frontend, AI"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Visibility
                        </label>
                        <select
                            value={formData.visibility || "Public"}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    visibility: e.target.value as Visibility,
                                }))
                            }
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="Public">
                                Public (Show on Portfolio)
                            </option>
                            <option value="Private">
                                Private (Dev Docs Only)
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status || "Active"}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    status: e.target.value as Status,
                                }))
                            }
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="Active">Active</option>
                            <option value="Maintained">Maintained</option>
                            <option value="In Development">
                                In Development
                            </option>
                            <option value="Idea">Idea / Concept</option>
                            <option value="Paused">Paused</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">
                        Tools / Technologies (Comma separated)
                    </label>
                    <input
                        type="text"
                        value={toolsInput}
                        onChange={(e) => setToolsInput(e.target.value)}
                        onBlur={commitTools}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="React, TypeScript, FastAPI, PostgreSQL..."
                    />
                </div>
            </div>
        </section>
    );
}