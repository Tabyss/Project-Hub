import { useState } from "react";
import { Star } from "lucide-react";
import type { Project, Visibility, Status } from "../../../../../types";

interface BasicInfoSectionProps {
    formData: Partial<Project>;
    updateField: <K extends keyof Project>(field: K, value: Project[K]) => void;
    onTitleChange: (title: string) => void;
}

const INPUT_CLASS =
    "w-full px-4 py-2.5 bg-canvas border border-line rounded-xl text-sm text-ink outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all";

const parseCommaSeparated = (raw: string, limit?: number) => {
    const items = raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    return limit ? items.slice(0, limit) : items;
};

export default function BasicInfoSection({
    formData,
    updateField,
    onTitleChange,
}: BasicInfoSectionProps) {
    const [categoryText, setCategoryText] = useState<string | null>(null);
    const [toolsText, setToolsText] = useState<string | null>(null);

    const displayedCategories =
        categoryText !== null
            ? categoryText
            : (formData.category || []).join(", ");
    const displayedTools =
        toolsText !== null ? toolsText : (formData.tools || []).join(", ");

    const handleCategoryBlur = () => {
        if (categoryText === null) return;
        updateField("category", parseCommaSeparated(categoryText, 3));
        setCategoryText(null);
    };

    const handleToolsBlur = () => {
        if (toolsText === null) return;
        updateField("tools", parseCommaSeparated(toolsText));
        setToolsText(null);
    };

    return (
        <section className="lg:col-span-2 bg-surface p-6 rounded-[24px] border border-line">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-line">
                <h2 className="text-base font-bold text-ink">
                    1. Basic Information
                </h2>
                <button
                    type="button"
                    onClick={() =>
                        updateField("is_favorite", !formData.is_favorite)
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        formData.is_favorite
                            ? "bg-amber-400/20 text-amber-600 border border-amber-400/40"
                            : "bg-canvas text-ink-muted border border-line hover:text-ink"
                    }`}
                >
                    <Star
                        size={14}
                        className={
                            formData.is_favorite
                                ? "fill-amber-500 text-amber-500"
                                : ""
                        }
                    />
                    {formData.is_favorite
                        ? "Featured Project"
                        : "Mark as Favorite"}
                </button>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title || ""}
                            onChange={(e) => onTitleChange(e.target.value)}
                            className={INPUT_CLASS}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">
                            Slug URL *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.slug || ""}
                            onChange={(e) =>
                                updateField("slug", e.target.value)
                            }
                            className={`${INPUT_CLASS} font-mono text-xs`}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                        Short Tagline *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.tagline || ""}
                        onChange={(e) => updateField("tagline", e.target.value)}
                        className={INPUT_CLASS}
                        placeholder="E.g., A fast web-based e-reader with Google Drive integration..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                        Role *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.role || ""}
                        onChange={(e) => updateField("role", e.target.value)}
                        className={INPUT_CLASS}
                        placeholder="Ex: Frontend Developer, Full Stack Engineer..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">
                            Categories (Max 3) *
                        </label>
                        <input
                            type="text"
                            required
                            value={displayedCategories}
                            onChange={(e) => setCategoryText(e.target.value)}
                            onBlur={handleCategoryBlur}
                            className={INPUT_CLASS}
                            placeholder="Web App, Frontend, AI"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">
                            Visibility
                        </label>
                        <select
                            value={formData.visibility || "Public"}
                            onChange={(e) =>
                                updateField(
                                    "visibility",
                                    e.target.value as Visibility,
                                )
                            }
                            className={INPUT_CLASS}
                        >
                            <option value="Public">Public (Portfolio)</option>
                            <option value="Private">
                                Private (DevDocs Only)
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1.5">
                            Status
                        </label>
                        <select
                            value={formData.status || "Active"}
                            onChange={(e) =>
                                updateField("status", e.target.value as Status)
                            }
                            className={INPUT_CLASS}
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
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                        Tools / Technologies (Comma separated)
                    </label>
                    <input
                        type="text"
                        value={displayedTools}
                        onChange={(e) => setToolsText(e.target.value)}
                        onBlur={handleToolsBlur}
                        className={INPUT_CLASS}
                        placeholder="React, TypeScript, FastAPI, PostgreSQL..."
                    />
                </div>
            </div>
        </section>
    );
}
