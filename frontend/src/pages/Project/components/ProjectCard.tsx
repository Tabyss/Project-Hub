import { Link } from "react-router-dom";
import { ExternalLink, Lock, FolderGit2, Star, GitBranch } from "lucide-react";
import { useViewModeStore } from "../../../store/viewModeStore";
import type { Project } from "../../../types";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const { mode } = useViewModeStore();

    return (
        <article className="bg-surface rounded-[24px] border border-line overflow-hidden hover:border-coral/50 transition-all group flex flex-col h-full relative">
            {/* Favorite Badge */}
            {project.is_favorite && (
                <div className="absolute top-3 left-3 z-10 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-sm">
                    <Star size={13} className="fill-slate-900" />
                </div>
            )}

            {/* Cover Image */}
            <div className="h-44 bg-canvas relative overflow-hidden border-b border-line">
                {project.cover_img ? (
                    <img
                        src={project.cover_img}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted/40">
                        <FolderGit2 size={44} />
                    </div>
                )}

                <div className="absolute top-3 right-3 flex gap-1.5">
                    {project.visibility === "Private" && (
                        <span className="bg-ink text-canvas text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                            <Lock size={11} /> Private
                        </span>
                    )}
                    {mode === "devdocs" && (
                        <span className="bg-surface/90 backdrop-blur-sm text-ink text-[11px] px-2.5 py-1 rounded-full font-medium border border-line">
                            {project.status}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Categories */}
                {project.category && project.category.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {project.category.map((cat) => (
                            <span
                                key={cat}
                                className="text-[10px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-md tracking-wider uppercase"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                )}

                <h3 className="text-lg font-bold text-ink mb-0.5 group-hover:text-coral transition-colors">
                    {project.title}
                </h3>
                <p className="text-xs font-medium text-ink-muted mb-3">
                    {project.role}
                </p>

                <p className="text-ink-muted text-sm mb-4 line-clamp-2 flex-1">
                    {project.tagline}
                </p>

                {/* Tech Stack Badges */}
                {project.tools && project.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {project.tools.slice(0, 4).map((tool) => (
                            <span
                                key={tool}
                                className="text-[11px] bg-canvas border border-line text-ink-muted px-2 py-0.5 rounded-md"
                            >
                                {tool}
                            </span>
                        ))}
                        {project.tools.length > 4 && (
                            <span className="text-[11px] text-ink-muted px-1.5 py-0.5">
                                +{project.tools.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center gap-3 mt-auto pt-3.5 border-t border-line">
                    <Link
                        to={`/project/${project.slug}`}
                        className="text-xs font-semibold text-ink hover:text-coral transition-colors"
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
                            className="text-ink-muted hover:text-ink transition-colors"
                            title="Source Repository"
                        >
                            <GitBranch size={16} />
                        </a>
                    )}
                    {project.live_url && (
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-ink-muted hover:text-ink transition-colors"
                            title="Live Demo"
                        >
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}
