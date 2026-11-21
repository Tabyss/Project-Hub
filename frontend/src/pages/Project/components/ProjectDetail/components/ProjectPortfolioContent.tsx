import type { Project } from "../../../../../types";
import MarkdownRenderer from "./MarkdownRenderer";

export default function PortfolioContent({ project }: { project: Project }) {
    return (
        <div className="space-y-12">
            {project.media_urls && project.media_urls.length > 0 && (
                <section className="pt-6 border-t border-line">
                    <h3 className="text-xl font-bold text-ink mb-5">
                        Project Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {project.media_urls.map((url, idx) => (
                            <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full h-48 bg-surface rounded-2xl overflow-hidden border border-line group"
                            >
                                <img
                                    src={url}
                                    alt={`Screenshot ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {project.portfolio_content ? (
                <section>
                    <MarkdownRenderer content={project.portfolio_content} />
                </section>
            ) : (
                <p className="text-ink-muted text-sm italic">
                    Belum ada konten cerita portofolio yang ditambahkan.
                </p>
            )}
        </div>
    );
}
