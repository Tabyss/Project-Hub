import { useViewModeStore } from "../../store/viewModeStore";
import { ExternalLink, Lock, FolderGit2, Star, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";
import type { Project } from "../../types";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const { mode } = useViewModeStore();

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full relative">
            {/* Favorite Indicator */}
            {project.is_favorite && (
                <div className="absolute top-3 left-3 z-10 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-md">
                    <Star size={14} className="fill-slate-900" />
                </div>
            )}

            {/* Cover Image */}
            <div className="h-48 bg-slate-100 relative overflow-hidden">
                {project.cover_img ? (
                    <img
                        src={project.cover_img}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <FolderGit2 size={48} />
                    </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                    {project.visibility === "Private" && (
                        <span className="bg-slate-800 text-white text-xs px-2 py-1 rounded flex items-center gap-1 font-medium shadow-sm">
                            <Lock size={12} /> Private
                        </span>
                    )}
                    {mode === "devdocs" && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium border border-blue-200 shadow-sm">
                            {project.status}
                        </span>
                    )}
                </div>
            </div>

            {/* Text Content */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                    {/* Render Multiple Categories */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {project.category?.map((cat, index) => (
                            <span
                                key={index}
                                className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-wider uppercase"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                    {project.tools && project.tools.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                            {project.tools.map((tool, i) => (
                                <span
                                    key={i}
                                    className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                                >
                                    {tool}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {project.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mb-3">
                    Role: {project.role}
                </p>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1">
                    {project.tagline}
                </p>

                {/* Tools Badges */}

                {/* Action Links */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                    <Link
                        to={`/project/${project.slug}`}
                        className="text-sm font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    >
                        {mode === "portfolio"
                            ? "View Case Study"
                            : "View Documentation"}{" "}
                        &rarr;
                    </Link>
                    <div className="flex-1" />
                    {project.repo_url && mode === "devdocs" && (
                        <a
                            href={project.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-slate-900"
                        >
                            <GitBranch size={18} />
                        </a>
                    )}
                    {project.live_url && (
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-slate-900"
                        >
                            <ExternalLink size={18} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
