import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDeleteProject, useProject } from "../../../../hooks/useProjects";
import { useViewModeStore } from "../../../../store/viewModeStore";
import { useAuth } from "../../../../context/AuthContext";
import { Loader2 } from "lucide-react";
import Modal from "../../../../components/common/Modal";
import ProjectForm from "../../../../components/forms/ProjectForm";
import ProjectDevDocsContent from "./components/ProjectDevDocsContent";
import ProjectHeader from "./components/ProjectHeader";
import ProjectPortfolioContent from "./components/ProjectPortfolioContent";
import TableOfContents from "./components/TableOfContents";

export default function ProjectDetailPage() {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug: string }>();
    const { data: project, isLoading, isError } = useProject(slug || "");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { mutate: deleteProject } = useDeleteProject();
    const { mode } = useViewModeStore();
    const { user, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
            </div>
        );
    }

    if (isError || !project) {
        return (
            <div className="text-center py-20 text-red-500">
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
        <div className="px-4 py-10 max-w-7xl mx-auto">
            <ProjectHeader
                project={project}
                mode={effectiveMode}
                onDelete={handleDelete}
            />

            {project.cover_img && (
                <div className="w-full h-64 md:h-96 bg-slate-100 rounded-2xl overflow-hidden mb-12 shadow-inner">
                    <img
                        src={project.cover_img}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="flex gap-12 items-start relative">
                <div className="flex-1 min-w-0 prose-content-area prose prose-slate prose-lg max-w-none">
                    {effectiveMode === "portfolio" && (
                        <ProjectPortfolioContent project={project} />
                    )}
                    {effectiveMode === "devdocs" && (
                        <ProjectDevDocsContent project={project} />
                    )}
                </div>

                <TableOfContents contentDependency={activeContent + effectiveMode} />
            </div>

            {isOwner && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit Project"
                >
                    <ProjectForm
                        initialData={project}
                        onSuccess={() => setIsEditModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}