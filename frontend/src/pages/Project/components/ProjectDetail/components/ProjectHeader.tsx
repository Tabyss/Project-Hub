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

interface ProjectHeaderProps {
    project: Project;
    mode: string;
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
        <>
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-medium transition-colors"
            >
                <ArrowLeft size={20} /> Kembali ke Home
            </Link>

            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    {Array.isArray(project.category) ? (
                        project.category.map((cat, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full"
                            >
                                {cat}
                            </span>
                        ))
                    ) : (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                            {project.category}
                        </span>
                    )}

                    <span className="text-slate-400 text-sm flex items-center gap-1">
                        <Calendar size={14} /> Terakhir update: {formattedDate}
                    </span>

                    {mode === "devdocs" && (
                        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                            <Link
                                to={`/project/edit/${project.slug}`}
                                className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"
                            >
                                <Pencil size={14} /> Edit
                            </Link>
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-1 text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                    {project.title}
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                    {project.tagline}
                </p>
                <div className="mb-6 flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                        Role: {project.role}
                    </span>
                </div>

                {/* TAMPILKAN TOOLS */}
                {project.tools && project.tools.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {project.tools.map((tool, idx) => (
                            <span
                                key={idx}
                                className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded"
                            >
                                {tool}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-4">
                    {project.live_url && (
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <ExternalLink size={18} /> Live Demo
                        </a>
                    )}
                    {project.repo_url && mode === "devdocs" && (
                        <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
                        >
                            <GitBranch size={18} /> Repository
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}
