import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Loader2, AlertCircle, Plus, LayoutTemplate, Code } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useProjects } from "../../hooks/queries/useProjects";
import { useViewModeStore } from "../../store/viewModeStore";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { DsButton } from "../DesignSystem/DesignSystemPage";
import ProjectCard from "./components/ProjectCard";

export default function ProjectListPage() {
    const { mode, setMode } = useViewModeStore();
    const { user, isAuthenticated, openLoginModal } = useAuth();
    const { projectFilters, resetProjectFilters } = useWorkspaceStore();

    useEffect(() => {
        resetProjectFilters();
    }, [user?.id, resetProjectFilters]);

    const activeFilters = useMemo(
        () => ({
            ...(projectFilters.category && {
                category: projectFilters.category,
            }),
            ...(projectFilters.tool && { tool: projectFilters.tool }),
            ...(projectFilters.visibility &&
                mode === "devdocs" && {
                    visibility: projectFilters.visibility,
                }),
            ...(projectFilters.is_favorite !== "" && {
                is_favorite: projectFilters.is_favorite === "true",
            }),
        }),
        [projectFilters, mode],
    );

    const {
        data: projects = [],
        isLoading,
        isError,
    } = useProjects(activeFilters);

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
                <Loader2 className="w-8 h-8 animate-spin text-coral" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-coral gap-2">
                <AlertCircle size={32} />
                <p className="text-sm font-medium">
                    Gagal memuat data dari server. Pastikan backend menyala.
                </p>
            </div>
        );
    }

    const pageTitle =
        mode === "portfolio" && !isAuthenticated
            ? "Featured Projects"
            : `${user?.username ? `${user.username}'s` : "Engineering"} Projects`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
                    {pageTitle}
                </h1>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={handleModeToggle}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            mode === "portfolio"
                                ? "bg-surface text-ink border border-line hover:bg-surface-hover"
                                : "bg-ink text-canvas"
                        }`}
                    >
                        {mode === "portfolio" ? (
                            <>
                                <LayoutTemplate size={14} /> Porto Mode
                            </>
                        ) : (
                            <>
                                <Code size={14} /> DevDocs Mode
                            </>
                        )}
                    </button>

                    {mode === "devdocs" && isAuthenticated && (
                        <Link to="/project/new">
                            <DsButton variant="coral">
                                <Plus size={15} /> New Project
                            </DsButton>
                        </Link>
                    )}
                </div>
            </div>

            {/* Project Grid */}
            {projects.length === 0 ? (
                <div className="text-center py-20 text-ink-muted text-xs bg-surface rounded-[24px] border border-dashed border-line">
                    Belum ada proyek yang cocok dengan filter di sidebar.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}
