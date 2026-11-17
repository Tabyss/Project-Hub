import { useState, useEffect } from "react";
import { useProjects, useProjectFiltersOptions } from "../../hooks/useProjects";
import { useViewModeStore } from "../../store/viewModeStore";
import { useAuth } from "../../context/AuthContext";
import ProjectCard from "../../components/portfolio/ProjectCard";
import Modal from "../../components/common/Modal";
import ProjectForm from "../../components/forms/ProjectForm";
import {
    Loader2,
    AlertCircle,
    Plus,
    LayoutTemplate,
    Code,
    FilterX,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ProjectPage() {
    const { mode, setMode } = useViewModeStore();
    const { user, isAuthenticated, openLoginModal } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        category: "",
        tool: "",
        visibility: "",
        is_favorite: "",
    });

    // Reset filter ketika berganti akun atau logout
    useEffect(() => {
        setFilters({
            category: "",
            tool: "",
            visibility: "",
            is_favorite: "",
        });
    }, [user?.id]);

    const { data: filterOptions } = useProjectFiltersOptions();

    const activeFilters = {
        ...(filters.category && { category: filters.category }),
        ...(filters.tool && { tool: filters.tool }),
        ...(filters.visibility &&
            mode === "devdocs" && { visibility: filters.visibility }),
        ...(filters.is_favorite !== "" && {
            is_favorite: filters.is_favorite === "true",
        }),
    };

    const { data: projects, isLoading, isError } = useProjects(activeFilters);

    const handleModeToggle = () => {
        if (mode === "portfolio") {
            if (!isAuthenticated) {
                openLoginModal();
                return;
            }
            setMode("devdocs");
        } else {
            setMode("portfolio");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-red-500 gap-2">
                <AlertCircle size={32} />
                <p>Gagal memuat data dari server. Pastikan backend menyala.</p>
            </div>
        );
    }

    return (
        <div className="px-7 py-6">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                        {mode === "portfolio" && !isAuthenticated
                            ? "Featured Work & Projects"
                            : `${user?.username ? `${user.username}'s` : "Engineering"} Workspace`}
                    </h2>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                        {mode === "devdocs" && isAuthenticated && (
                            <Link
                                to="/project/new"
                                className="h-10 w-10 inline-flex justify-center items-center gap-2 bg-slate-900 text-white text-sm rounded-full font-semibold hover:bg-slate-800 transition-colors"
                            >
                                <Plus size={20} />
                            </Link>
                        )}
                        <button
                            onClick={handleModeToggle}
                            className={`flex justify-between items-center gap-2 w-[150px] px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                mode === "portfolio"
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    : "bg-slate-900 text-slate-100 hover:bg-slate-800"
                            }`}
                        >
                            {mode === "portfolio" ? "Porto Mode" : "Dev Mode"}
                            {mode === "portfolio" ? (
                                <LayoutTemplate size={16} />
                            ) : (
                                <Code size={16} />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* BARIS FILTER */}
            <div className="flex flex-wrap items-center gap-3 mb-8 bg-white p-4 rounded-xl border border-slate-200">
                <select
                    value={filters.category}
                    onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                    }
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Categories</option>
                    {filterOptions?.categories?.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.tool}
                    onChange={(e) =>
                        setFilters({ ...filters, tool: e.target.value })
                    }
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Tools</option>
                    {filterOptions?.tools?.map((tool) => (
                        <option key={tool} value={tool}>
                            {tool}
                        </option>
                    ))}
                </select>

                <select
                    value={filters.is_favorite}
                    onChange={(e) =>
                        setFilters({ ...filters, is_favorite: e.target.value })
                    }
                    className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Status</option>
                    <option value="true">Favorite / Featured</option>
                    <option value="false">Regular</option>
                </select>

                {mode === "devdocs" && isAuthenticated && (
                    <select
                        value={filters.visibility}
                        onChange={(e) =>
                            setFilters({
                                ...filters,
                                visibility: e.target.value,
                            })
                        }
                        className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Visibility</option>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                    </select>
                )}

                <button
                    onClick={() =>
                        setFilters({
                            category: "",
                            tool: "",
                            visibility: "",
                            is_favorite: "",
                        })
                    }
                    className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto flex items-center gap-1 text-sm font-medium"
                >
                    <FilterX size={16} /> Reset
                </button>
            </div>

            {/* GRID PROJECT */}
            {!projects || projects.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                    Belum ada proyek yang cocok dengan filter.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            {/* MODAL BUAT PROJECT */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Buat Project Baru"
            >
                <ProjectForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
