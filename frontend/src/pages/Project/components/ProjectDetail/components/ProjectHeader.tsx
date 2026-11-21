import { Link } from "react-router-dom";
import {
    ArrowLeft,
    ExternalLink,
    Calendar,
    GitBranch,
    Pencil,
    Trash2,
} from "lucide-react";
import type { Project } from "../../../../../types";
import { DsButton } from "../../../../DesignSystem/DesignSystemPage";

interface ProjectHeaderProps {
    project: Project;
    mode: "portfolio" | "devdocs";
    onDelete: () => void;
}

export default function ProjectHeader({
    project,
    mode,
    onDelete,
}: ProjectHeaderProps) {
    const formattedDate = new Date(project.last_updated_at).toLocaleDateString(
        "id-ID",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
        },
    );

    return (
        <header className="mb-10">
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-coral mb-6 transition-colors"
            >
                <ArrowLeft size={16} /> Kembali ke Projects
            </Link>

            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    {Array.isArray(project.category) ? (
                        project.category.map((cat) => (
                            <span
                                key={cat}
                                className="px-3 py-1 bg-coral/10 text-coral text-xs font-bold rounded-full uppercase tracking-wider"
                            >
                                {cat}
                            </span>
                        ))
                    ) : project.category ? (
                        <span className="px-3 py-1 bg-coral/10 text-coral text-xs font-bold rounded-full uppercase tracking-wider">
                            {project.category}
                        </span>
                    ) : null}

                    <span className="text-ink-muted text-xs flex items-center gap-1.5 ml-1">
                        <Calendar size={13} /> Update: {formattedDate}
                    </span>
                </div>

                {mode === "devdocs" && (
                    <div className="flex items-center gap-2">
                        <Link to={`/project/edit/${project.slug}`}>
                            <DsButton variant="secondary" type="button">
                                <Pencil size={14} /> Edit
                            </DsButton>
                        </Link>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-3.5 py-2 rounded-full hover:bg-red-500/20 font-semibold transition-colors cursor-pointer"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-ink mb-4 tracking-tight">
                {project.title}
            </h1>
            <p className="text-lg md:text-xl text-ink-muted mb-6 leading-relaxed">
                {project.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-bold text-ink bg-surface border border-line px-3 py-1.5 rounded-lg">
                    Role: {project.role}
                </span>

                {project.tools?.map((tool) => (
                    <span
                        key={tool}
                        className="text-xs font-medium bg-canvas text-ink-muted border border-line px-2.5 py-1.5 rounded-lg"
                    >
                        {tool}
                    </span>
                ))}
            </div>

            {(project.live_url || (project.repo_url && mode === "devdocs")) && (
                <div className="flex flex-wrap gap-3 pt-2">
                    {project.live_url && (
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <DsButton variant="coral" type="button">
                                <ExternalLink size={15} /> Live Demo
                            </DsButton>
                        </a>
                    )}
                    {project.repo_url && mode === "devdocs" && (
                        <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-ink text-canvas px-5 py-2.5 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                            <GitBranch size={15} /> Repository
                        </a>
                    )}
                </div>
            )}
        </header>
    );
}
