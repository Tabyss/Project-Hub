import ReactMarkdown from "react-markdown";
import type { Project } from "../../../../../types";
import { markdownComponents } from "../../../../../components/common/MarkdownHeadings";

interface ProjectPortfolioContentProps {
    project: Project;
}

export default function ProjectPortfolioContent({
    project,
}: ProjectPortfolioContentProps) {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {project.media_urls && project.media_urls.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                        Project Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {project.media_urls.map((url, idx) => (
                            <div
                                key={idx}
                                className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <img
                                    src={url}
                                    alt={`Screenshot ${idx + 1}`}
                                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                                    onClick={() => window.open(url, "_blank")}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {project.portfolio_content ? (
                <section>
                    <ReactMarkdown components={markdownComponents}>
                        {project.portfolio_content}
                    </ReactMarkdown>
                </section>
            ) : (
                <p className="text-slate-400 italic">
                    Belum ada konten cerita portofolio yang ditambahkan.
                </p>
            )}
        </div>
    );
}
