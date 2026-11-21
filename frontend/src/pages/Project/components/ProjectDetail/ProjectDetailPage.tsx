import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import {
    useProject,
    useDeleteProject,
} from "../../../../hooks/queries/useProjects";
import { useViewModeStore } from "../../../../store/viewModeStore";
import DevDocsContent from "./components/ProjectDevDocsContent";
import ProjectHeader from "./components/ProjectHeader";
import PortfolioContent from "./components/ProjectPortfolioContent";
import TableOfContents from "./components/TableOfContents";

export default function ProjectDetailPage() {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const { data: project, isLoading, isError } = useProject(slug || "");
    const { mutate: deleteProject } = useDeleteProject();
    const { mode } = useViewModeStore();
    const { user, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-coral w-9 h-9" />
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="text-center py-20 text-coral text-sm font-medium">
                Proyek tidak ditemukan atau Anda tidak memiliki akses.
            </div>
        );
    }

    const isOwner =
        isAuthenticated && (!project.user_id || user?.id === project.user_id);
    const effectiveMode = isOwner ? mode : "portfolio";

    const handleDelete = () => {
        if (!isOwner) return;
        if (
            window.confirm(
                "Apakah Anda yakin ingin menghapus proyek ini selamanya? Semua rencana dan changelog juga akan terhapus!",
            )
        ) {
            deleteProject(project.id, {
                onSuccess: () => navigate("/"),
            });
        }
    };

    const activeContent =
        effectiveMode === "portfolio"
            ? project.portfolio_content || ""
            : project.documentation_content || "";

    return (
        <div className="max-w-6xl mx-auto">
            <ProjectHeader
                project={project}
                mode={effectiveMode}
                onDelete={handleDelete}
            />

            {project.cover_img && (
                <div className="w-full h-64 md:h-96 bg-surface rounded-[24px] border border-line overflow-hidden mb-10">
                    <img
                        src={project.cover_img}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="flex gap-10 items-start relative">
                <div className="flex-1 min-w-0 max-w-none">
                    {effectiveMode === "portfolio" ? (
                        <PortfolioContent project={project} />
                    ) : (
                        <DevDocsContent project={project} />
                    )}
                </div>

                <TableOfContents content={activeContent} />
            </div>
        </div>
    );
}
