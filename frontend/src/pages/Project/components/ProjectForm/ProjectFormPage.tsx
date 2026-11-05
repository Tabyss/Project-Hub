import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import ProjectBasicInfoSection from "./ProjectBasicInfoSection";
import ProjectMediaSection from "./ProjectMediaSection";
import { Loader2, Save } from "lucide-react";
import MarkdownEditor from "../../../../components/forms/MarkdownEditor";
import {
    useCreateProject,
    useProject,
    useUpdateProject,
} from "../../../../hooks/useProjects";
import type { Project } from "../../../../types";

export default function ProjectFormPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { data: initialData, isLoading: isLoadingData } = useProject(
        slug || "",
    );
    const isEditMode = !!slug;

    const [formData, setFormData] = useState<Partial<Project>>({
        title: "",
        slug: "",
        tagline: "",
        category: ["Web App"],
        visibility: "Public",
        status: "Active",
        is_favorite: false,
        role: "Full Stack Developer",
        tools: [],
        cover_img: "",
        repo_url: "",
        live_url: "",
        portfolio_content: "",
        documentation_content: "",
    });

    const { mutate: createProject, isPending: isCreating } = useCreateProject();
    const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData(initialData);
        }
    }, [initialData, isEditMode]);

    const handleTitleChange = (title: string) => {
        if (!isEditMode) {
            const generatedSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)+/g, "");
            setFormData({ ...formData, title, slug: generatedSlug });
        } else {
            setFormData({ ...formData, title });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && initialData) {
            updateProject(
                { id: initialData.id, data: formData },
                {
                    onSuccess: () => navigate(`/project/${formData.slug}`),
                },
            );
        } else {
            createProject(formData, {
                onSuccess: () => navigate("/"),
            });
        }
    };

    if (isEditMode && isLoadingData) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Page Header */}
            <div className="sticky top-16 flex items-center justify-between px-7 py-6 bg-white z-50">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {isEditMode ? "Edit Project" : "Create New Project"}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={isEditMode ? `/project/${slug}` : "/"}
                        className="px-6 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="bg-black text-white font-bold px-8 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <Save size={20} />{" "}
                                {isEditMode ? "Save" : "Publish"}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="px-7 space-y-8">
                {/* SECTION 1: Basic Info */}
                <div className="grid grid-cols-3 gap-4">
                    <ProjectBasicInfoSection
                        formData={formData}
                        setFormData={setFormData}
                        handleTitleChange={handleTitleChange}
                    />

                    {/* SECTION 2: Media & Links */}
                    <ProjectMediaSection
                        formData={formData}
                        setFormData={setFormData}
                    />
                </div>

                {/* SECTION 3: Portfolio Story (Markdown) */}
                <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                        3. Portfolio Story
                    </h2>
                    <div className="space-y-6">
                        <MarkdownEditor
                            label="Portfolio Content"
                            value={formData.portfolio_content || ""}
                            onChange={(val) =>
                                setFormData({
                                    ...formData,
                                    portfolio_content: val,
                                })
                            }
                            placeholder="Write the full problem, solution, methodology, and impact..."
                            rows={8}
                        />
                    </div>
                </section>

                {/* SECTION 4: Technical Documentation (Markdown) */}
                <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
                        4. Technical Documentation
                    </h2>
                    <div className="space-y-6">
                        <MarkdownEditor
                            label="Documentation Content"
                            value={formData.documentation_content || ""}
                            onChange={(val) =>
                                setFormData({
                                    ...formData,
                                    documentation_content: val,
                                })
                            }
                            placeholder="Write architecture overviews, API specs, deployment notes..."
                            rows={8}
                        />
                    </div>
                </section>
            </form>
        </div>
    );
}
